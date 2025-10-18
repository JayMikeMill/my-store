import { SystemSettingsService } from "@services";
import {
  Address,
  Order,
  Product,
  ProductVariant,
  QueryObject,
} from "shared/types";
import { db, payment, shipping } from "@adapters/services";
import { DBAdapter } from "@adapters/types/DBAdapter";
import { toMajorPriceString } from "shared/utils/PriceUtils";
import { OrderProcessingApi } from "shared/interfaces";

class OrderProcessingService implements OrderProcessingApi {
  async placeOrder(
    paymentMethod: any,
    order: Order
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    // implement order placement logic
    try {
      // 1. Check stock for all items in the order
      if (!(await stockAvailable(order, db))) {
        throw new Error(
          "One or more items are out of stock. Your cart has been updated."
        );
      }

      // 2a Create metadata for payment
      const metadata: Record<string, string> = {};

      order.items?.forEach((item, index) => {
        const prefix = `item_${index}_`;
        metadata[`${prefix}productId`] = item.product.id ?? "unknown";
        metadata[`${prefix}variantId`] = item.variant?.id ?? "unknown";
        metadata[`${prefix}name`] = item.product.name ?? "unknown";
        metadata[`${prefix}quantity`] = String(item.quantity || 1);
        metadata[`${prefix}price`] = String(toMajorPriceString(item.price));
      });

      // 2b. Authorize payment
      const paymentResult = await payment.authorizePayment({
        token: paymentMethod.id,
        amount: order.total / 100, // amount is in cents
        currency: order.transaction?.currency || "USD",
        metadata,
      });

      if (paymentResult.status !== "AUTHORIZED") {
        throw new Error(
          "Payment authorization failed. Try another payment method."
        );
      }

      // 3. Create order and update stock within a transaction
      let newOrder: Order | undefined;
      await db.transaction(async (tx) => {
        // 3a. Re-check stock to avoid race conditions
        if (!(await stockAvailable(order, tx))) {
          throw new Error("Out of stock");
        }

        // 3b. Create order and update stock
        newOrder = await tx.orders.create(order);

        // 3c. Update stock levels
        await updateStock(order, tx);
      });

      // 5. Capture payment
      const captureResult = await payment.capturePayment(paymentResult.id);
      if (captureResult.status !== "CAPTURED") {
        throw new Error("Payment capture failed");
      }

      return { success: true, data: { newOrder, payment: captureResult } };
    } catch (error) {
      console.error("Error placing order:", error);
      return {
        success: false,
        error:
          typeof error === "object" && error !== null && "message" in error
            ? (error as any).message
            : String(error),
      };
    }
  }

  // Buy shipping label for an order
  async buyOrderShipping(orderId: string): Promise<Order | null> {
    const order = await db.orders.getOne({ id: orderId });
    if (!order) throw new Error("Order not found (id: " + orderId + ")");

    const adminSettings = await SystemSettingsService.getAdminSettings();

    //const fromAddress = adminSettings?.shippingOrigin;
    const fromAddress = {
      name: "My Store",
      street1: "1791 King Ave",
      city: "Hamilton",
      state: "OH",
      postalCode: "45015",
      country: "US",
      phone: "614-555-1234",
      email: "info@mystore.com",
    };

    const normalizedFrom = (await shipping.verifyAddress(fromAddress))
      .normalizedAddress;

    if (!normalizedFrom)
      throw new Error("Shipping origin address not set in admin settings");

    const toAddress = order.shippingInfo?.address;

    if (!toAddress) throw new Error("Order has no shipping address");

    // console.log(
    //   "Buying shipping for order:",
    //   order,
    //   "from",
    //   normalizedFrom,
    //   "to",
    //   toAddress
    // );

    const parcel = { length: 12, width: 8, height: 4, weight: 32 };

    const createdShipment = await shipping.createShipment(
      normalizedFrom,
      order.shippingInfo?.address!,
      //getOrderDiminsions(order)
      parcel
    );

    if (!createdShipment) throw new Error("Failed to create shipment");

    const purchasedShiment = await shipping.buyShipment(createdShipment.id);

    if (!purchasedShiment) throw new Error("Failed to buy shipment");

    const shippingInfo = {
      shipmentId: purchasedShiment.id,
      parcel: parcel,
      tracking: purchasedShiment.trackingNumber,
      labelUrl: purchasedShiment.labelUrl,
      carrier: purchasedShiment.carrier,
      status: purchasedShiment.status,
    };

    order.shippingInfo = { ...order.shippingInfo, ...shippingInfo };

    await db.orders.update(order as Order & { id: string });

    console.log("Shipping purchased:", purchasedShiment);
    return order;
  }

  async refundOrder(id: string) {
    // implement refund logic
  }
}

async function stockAvailable(
  order: Order,
  dbAdapter: DBAdapter
): Promise<boolean> {
  if (!order.items || order.items.length === 0)
    throw new Error("Order has no items");

  const productIds = order.items.map((item) => item.product.id);
  if (productIds.some((id) => !id)) throw new Error("Invalid product ID");

  const productQuery: QueryObject<Product> = {
    conditions: [{ field: "id", operator: "in", value: productIds }],
    select: ["id", "name", "stock"],
  };
  const productResult = await dbAdapter.products.getMany(productQuery);
  if (!productResult?.data?.length)
    throw new Error("No products found for this order");

  const variantIds = order.items
    .map((item) => item.variant?.id)
    .filter(Boolean) as string[];

  const variantMap: Record<string, ProductVariant> = {};
  if (variantIds.length > 0) {
    const variantQuery: QueryObject<ProductVariant> = {
      conditions: [{ field: "id", operator: "in", value: variantIds }],
      select: ["id", "productId", "stock"],
    };
    const variantResult = await dbAdapter.productVariants.getMany(variantQuery);
    if (variantResult?.data?.length) {
      for (const v of variantResult.data) {
        if (v.id) variantMap[v.id] = v;
      }
    }
  }

  for (const item of order.items) {
    if (item.variant?.id) {
      const variant = variantMap[item.variant.id];
      if (!variant) throw new Error(`Variant not found: ${item.variant.id}`);

      // Only check stock if defined
      if (variant.stock != null && variant.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for variant ${variant.id} of product ${item.product.id}`
        );
      }
    } else {
      const product = productResult.data.find(
        (p: Product) => p.id === item.product.id
      );
      if (!product) throw new Error(`Product not found: ${item.product.id}`);

      // Only check stock if defined
      if (product.stock != null && product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.id}`);
      }
    }
  }

  return true;
}

// ------------------ Update Stock ------------------
async function updateStock(order: Order, dbAdapter: DBAdapter) {
  if (!order.items || order.items.length === 0)
    throw new Error("Order has no items");

  const updatePromises: Promise<any>[] = [];

  console.log("Updating stock for order items:", order.items);

  for (const item of order.items) {
    const quantity = item.quantity || 1;

    if (item.variant?.id) {
      const variant = await dbAdapter.productVariants.getOne({
        id: item.variant.id,
      });
      if (variant?.stock != null) {
        updatePromises.push(
          dbAdapter.productVariants.update(
            { id: item.variant.id, stock: -quantity },
            { increment: true }
          )
        );

        updatePromises.push(
          dbAdapter.products.update(
            { id: item.product.id!, stock: -quantity },
            { increment: true }
          )
        );
      }
    } else if (item.product?.id) {
      const product = await dbAdapter.products.getOne({ id: item.product.id });
      if (product?.stock != null) {
        updatePromises.push(
          dbAdapter.products.update(
            { id: item.product.id, stock: -quantity },
            { increment: true }
          )
        );
      }
    }
  }

  await Promise.all(updatePromises);
}

export default new OrderProcessingService();
