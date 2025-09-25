// frontend/src/components/forms/payment-forms/PaymentFormStripe.tsx
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import type { ShippingInfo } from "@shared/types/Shipping";
import { useApi } from "@api/useApi";
import {
  TransactionStatuses,
  PaymentMethods,
  OrderStatuses,
} from "@shared/types/Order";
import type { CartItem } from "src/types/CartItem";

interface StripePaymentFormProps {
  total: number;
  cartItems: CartItem[];
  shippingInfo: ShippingInfo;
  setLoading: (loading: boolean) => void;
  setMessage: (msg: string | null) => void;
}

// Load Stripe publishable key from environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function InnerStripeForm({
  total,
  cartItems,
  shippingInfo,
  setLoading,
  setMessage,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { processPayment, orders } = useApi();

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    try {
      setLoading(true);

      // Create payment method on Stripe
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: `${shippingInfo.address.firstName} ${shippingInfo.address.lastName}`,
          address: {
            line1: shippingInfo.address.addressLine1,
            line2: shippingInfo.address.addressLine2,
            city: shippingInfo.address.city,
            state: shippingInfo.address.state,
            postal_code: shippingInfo.address.postalCode,
            country: shippingInfo.address.country,
          },
        },
      });

      if (error) {
        setMessage(error.message || "Payment method creation failed");
        return;
      }

      // Send paymentMethod.id to backend
      const response = await processPayment({
        token: paymentMethod!.id,
        amount: total,
        items: cartItems.map((item) => ({
          name:
            typeof item.product === "string"
              ? item.product
              : typeof item.product === "object" && "name" in item.product
                ? (item.product as { name: string }).name
                : "Unknown Product",
          price: item.price,
          quantity: item.quantity,
        })),
        address: shippingInfo.address,
      });

      const payment = (response as any).payment;
      if (payment?.status === "succeeded") onSuccess(payment);
      else setMessage("Payment failed: " + payment?.error || "Unknown error");
    } catch (err) {
      console.error("Stripe payment error:", err);
      setMessage("Payment could not be processed");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const onSuccess = (payment: any) => {
    setMessage("Payment successful!");
    orders.create({
      id: "pending id",
      items: cartItems.map((item) => ({
        product: JSON.parse(JSON.stringify(item.product)),
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      status: OrderStatuses.PAID,
      createdAt: new Date(),
      updatedAt: new Date(),
      transaction: {
        method: PaymentMethods.STRIPE,
        amount: payment.amount,
        currency: payment.currency,
        status: TransactionStatuses.PAID,
      },
      shippingInfo,
    });
  };

  return (
    <div className="input-box max-w-2xl mx-auto p-lg bg-surface rounded-lg shadow-xl flex flex-col gap-md text-text font-sans">
      <h3 className="text-3xl mb-lg text-center font-bold">
        {total > 0 ? "Payment" : ""}
      </h3>
      <p className="text-lg font-semibold text-text text-right md:text-left">
        Total: ${total.toFixed(2)}
      </p>

      <div className="w-full h-52 mb-md border border-border rounded-md bg-background p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: getComputedStyle(
                  document.documentElement
                ).getPropertyValue("--color-text"),
                fontFamily: "inherit",
                "::placeholder": {
                  color:
                    getComputedStyle(document.documentElement).getPropertyValue(
                      "--color-text"
                    ) || "#888",
                },
              },
              invalid: {
                color: "#ff4d4f", // for invalid input
              },
            },
          }}
        />
      </div>
      <button
        onClick={handlePayment}
        className="bg-primary hover:bg-primaryDark text-white rounded-md px-6 py-3 font-semibold shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full"
        disabled={!stripe || !elements}
      >
        Pay Now
      </button>
    </div>
  );
}

// Wrap in Elements provider
export default function StripePaymentFormWrapper(
  props: StripePaymentFormProps
) {
  return (
    <Elements stripe={stripePromise}>
      <InnerStripeForm {...props} />
    </Elements>
  );
}
