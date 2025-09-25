import { PaymentAdapter } from "./PaymentAdapter";
import { PaymentRequest } from "@shared/types/PaymentRequest";
import Stripe from "stripe";
import SuperJSON from "superjson";
import { Address } from "@shared/types/Shipping";
import { env } from "@config/envVars";

// Initialize Stripe client
const stripe = new Stripe(env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

export class StripePaymentAdapter implements PaymentAdapter {
  async processPayment(data: PaymentRequest) {
    const { token, amount, items, address } = data;

    console.log("Processing payment with info:", data);
    console.log("Using Stripe secret key:", process.env.STRIPE_SECRET_KEY);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Dollars → cents
      currency: "usd",
      payment_method: token, // The payment token from frontend
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never", // prevents redirect-based methods
      },
      metadata: {
        note: `Order with ${items?.length || 0} items`,
      },
      shipping: address ? mapToStripeShipping(address) : undefined,
    });

    const serialized = SuperJSON.serialize(paymentIntent);

    // Return safe JSON
    return JSON.parse(JSON.stringify(serialized.json));
  }

  async refundPayment(paymentId: string, amount?: number) {
    const refund = await stripe.refunds.create({
      payment_intent: paymentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return refund.status === "succeeded";
  }
}

// Map your custom address type to Stripe shipping
const mapToStripeShipping = (addr: Address) => ({
  name: `${addr.firstName} ${addr.lastName}`,
  address: {
    line1: addr.addressLine1,
    line2: addr.addressLine2,
    city: addr.city,
    state: addr.state,
    postal_code: addr.postalCode,
    country: addr.country,
  },
});
