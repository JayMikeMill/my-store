import { PaymentAdapter } from "@adapters/types";
import {
  Address,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
} from "shared/types";
import Stripe from "stripe";
import { env } from "@config";

// Initialize Stripe client
const stripe = new Stripe(env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

export class StripePaymentAdapter implements PaymentAdapter {
  /**
   * Process a payment immediately (capture now)
   */
  async processPayment(data: PaymentRequest): Promise<PaymentResult> {
    try {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100),
        currency: data.currency?.toLowerCase() || "usd",
        payment_method: data.token,
        confirm: true,
        automatic_payment_methods: { enabled: true },
        metadata: data.metadata,
        shipping: data.shippingInfo
          ? mapToStripeShipping(data.shippingInfo.address!)
          : undefined,
      });

      return this.mapPaymentIntent(intent);
    } catch (error) {
      return this.handleStripeError(error);
    }
  }

  /**
   * Authorize payment only (manual capture)
   */
  async authorizePayment(data: PaymentRequest): Promise<PaymentResult> {
    try {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100),
        currency: data.currency?.toLowerCase() || "usd",
        payment_method: data.token,
        confirm: true,
        capture_method: "manual",
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
        metadata: data.metadata,
        shipping: data.shippingInfo
          ? mapToStripeShipping(data.shippingInfo.address!)
          : undefined,
      });

      return this.mapPaymentIntent(intent);
    } catch (error) {
      return this.handleStripeError(error);
    }
  }

  /**
   * Capture a previously authorized payment
   */
  async capturePayment(
    paymentId: string,
    amount?: number
  ): Promise<PaymentResult> {
    try {
      const intent = await stripe.paymentIntents.capture(paymentId, {
        amount_to_capture: amount ? Math.round(amount * 100) : undefined,
      });

      return this.mapPaymentIntent(intent);
    } catch (error) {
      return this.handleStripeError(error);
    }
  }

  /**
   * Refund a payment (full or partial)
   */
  async refundPayment(
    paymentId: string,
    amount?: number
  ): Promise<PaymentResult> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      return {
        id: paymentId,
        amount: amount ?? 0,
        currency: "USD",
        status: "REFUNDED",
        captured: false,
        metadata: {},
      };
    } catch (error) {
      return this.handleStripeError(error);
    }
  }

  /**
   * Map Stripe PaymentIntent to generic PaymentResult
   */
  private mapPaymentIntent(intent: Stripe.PaymentIntent): PaymentResult {
    let status: PaymentStatus;

    switch (intent.status) {
      case "requires_capture":
        status = "AUTHORIZED";
        break;
      case "succeeded":
        status = "CAPTURED";
        break;
      case "processing":
      case "requires_payment_method":
        status = "PENDING";
        break;
      case "canceled":
        status = "CANCELED";
        break;
      default:
        status = "FAILED";
    }

    return {
      id: intent.id,
      amount: (intent.amount ?? 0) / 100,
      currency: (intent.currency ?? "usd").toUpperCase(),
      status,
      captured: intent.status === "succeeded",
      metadata: intent.metadata as Record<string, string>,
    };
  }

  /**
   * Handle Stripe errors in a consistent way
   */
  private handleStripeError(error: unknown): PaymentResult {
    console.error("Stripe error:", error);
    return {
      id: "",
      amount: 0,
      currency: "USD",
      status: "FAILED",
      captured: false,
      metadata: {},
    };
  }
}

// Map your custom address type to Stripe shipping
const mapToStripeShipping = (
  address: Address
): Stripe.PaymentIntentCreateParams.Shipping => ({
  name: address.name,
  address: {
    line1: address.street1,
    line2: address.street2 ?? "",
    city: address.city,
    state: address.state,
    postal_code: address.postalCode,
    country: address.country,
  },
  phone: address.phone ?? "", // optional, if you have it
});
