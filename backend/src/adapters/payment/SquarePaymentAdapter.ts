import { PaymentAdapter } from "./PaymentAdapter";
import { PaymentRequest } from "@shared/types/PaymentRequest";

import { SquareClient, SquareEnvironment, Square } from "square";

import crypto from "crypto"; // For idempotency keys
import SuperJSON from "superjson";
import { Address } from "@shared/types/Shipping";

import { env } from "@config/envVars";

// Initialize Square client
const client = new SquareClient({
  token: env.SQUARE_ACCESS_TOKEN as string,
  environment: SquareEnvironment.Sandbox,
});

export class SquarePaymentAdapter implements PaymentAdapter {
  async processPayment(data: PaymentRequest) {
    const { token, amount, items, address } = data;

    console.log("Processing payment with info:", data);
    console.log("Using Square access token:", process.env.SQUARE_ACCESS_TOKEN);

    // Create the payment request
    const requestBody: Square.CreatePaymentRequest = {
      sourceId: token || "cnon:card-nonce-ok", // Sandbox default nonce
      idempotencyKey: crypto.randomUUID(), // Prevent duplicate charges
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)), // Dollars → cents
        currency: "USD",
      },
      note: `Order with ${items?.length || 0} items`,
      shippingAddress: mapToSquareAddress(address),
    };

    // Call Square API
    const response = await client.payments.create(requestBody);
    const payment = SuperJSON.serialize(response.payment);

    // Serialize safely
    const result = JSON.parse(JSON.stringify(payment.json));
    console.log("Square payment response:", result);

    return result;
  }

  async refundPayment(paymentId: string, amount?: number) {
    const refunds = client.refunds;

    // Get original payment to determine amount if not provided
    const paymentResponse = await client.payments.get({ paymentId });
    const paymentAmount =
      paymentResponse.payment?.amountMoney?.amount || BigInt(0);
    const refundAmount =
      amount !== undefined ? BigInt(Math.round(amount * 100)) : paymentAmount;

    const requestBody = {
      idempotencyKey: crypto.randomUUID(),
      paymentId,
      amountMoney: {
        amount: refundAmount,
        currency: "USD" as Square.Currency,
      },
    };

    const response = await refunds.refundPayment(requestBody);

    return response.refund?.status === "COMPLETED";
  }
}

// Function to map custom ShippingAddress to Square.Address
const mapToSquareAddress = (addr: Address): Square.Address => ({
  firstName: addr.firstName,
  lastName: addr.lastName,
  addressLine1: addr.addressLine1,
  addressLine2: addr.addressLine2,
  locality: addr.city,
  administrativeDistrictLevel1: addr.state,
  postalCode: addr.postalCode,
  country: addr.country as Square.Country,
});
