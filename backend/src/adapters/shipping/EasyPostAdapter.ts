import EasyPost from "@easypost/api";

import { Address } from "shared/types";

import { ShippingAdapter } from "@adapters/types";

import {
  Parcel,
  ShipmentRate,
  Shipment,
  AddressVerificationResult,
  ShipmentTrackingResult,
} from "shared/types";

import { env } from "@config";

// Helper: convert EasyPost rate string to number in cents
const dollarsToCents = (amount: string | number) =>
  Math.round(parseFloat(String(amount)) * 100);

const apiKey = env.EASYPOST_API_KEY_TEST || "YOUR_EASYPOST_KEY";

/**
 * Maps your internal Address type to EasyPost's expected address format.
 * Automatically splits apartment/unit from street1 to street2.
 */
export function mapToEasyPostAddress(address: Address) {
  const streetParts = (address.street1 || "").split(/\s+APT\s+/i); // split on "APT"
  const street1 = streetParts[0].trim();
  const street2 = (streetParts[1] || address.street2 || "").trim();

  return {
    name: address.name || "",
    company: address.company || undefined,
    street1,
    street2: street2 || undefined,
    city: address.city || "",
    state: address.state || "",
    zip: address.postalCode || "", // EasyPost expects "zip"
    country: address.country || "US",
    phone: address.phone || undefined,
    email: address.email || undefined,
  };
}

export class EasyPostAdapter implements ShippingAdapter {
  private api: InstanceType<typeof EasyPost>;

  constructor() {
    this.api = new EasyPost(apiKey);
  }

  // -------------------------------
  // Verify Address
  // -------------------------------
  async verifyAddress(address: Address): Promise<AddressVerificationResult> {
    try {
      const epAddress = await this.api.Address.create({
        ...mapToEasyPostAddress(address),
        verify: true,
      });

      const suggestions = epAddress.verifications?.delivery?.details ?? [];

      const verified = epAddress.verifications?.delivery?.success ?? false;
      const errors: string[] | undefined =
        epAddress.verifications?.delivery?.errors?.map((e: any) => e.message) ??
        undefined;

      return {
        valid: verified,
        normalizedAddress: verified
          ? {
              name: epAddress.name || "",
              street1: epAddress.street1 || "",
              street2: epAddress.street2 || undefined,
              city: epAddress.city || "",
              state: epAddress.state || "",
              postalCode: epAddress.zip || "",
              country: epAddress.country || "",
              company: epAddress.company || undefined,
              phone: epAddress.phone || undefined,
              email: epAddress.email || "",
            }
          : undefined,
        errors,
      };
    } catch (err: any) {
      return { valid: false, errors: [err.message] };
    }
  }

  // -------------------------------
  // Get Rates
  // -------------------------------
  async getRates(fromAddress: Address, toAddress: Address, parcel: Parcel) {
    const shipment = await this.api.Shipment.create({
      from_address: fromAddress,
      to_address: toAddress,
      parcel,
    });

    return shipment.rates.map(
      (r: any): ShipmentRate => ({
        carrier: r.carrier,
        service: r.service,
        rate: dollarsToCents(r.rate), // convert string to number
        currency: r.currency,
        deliveryDays: r.delivery_days ?? undefined,
      })
    );
  }

  // -------------------------------
  // Create Shipment (optionally buy)
  // -------------------------------
  async createShipment(
    fromAddress: Address,
    toAddress: Address,
    parcel: Parcel,
    carrier?: string,
    service?: string
  ): Promise<Shipment> {
    const mappedFrom = mapToEasyPostAddress(fromAddress);
    const mappedTo = mapToEasyPostAddress(toAddress);

    // 1️⃣ Create the shipment in EasyPost
    const epShipment = await this.api.Shipment.create({
      from_address: mappedFrom,
      to_address: mappedTo,
      parcel,
    });

    let finalShipment = epShipment;

    // 2️⃣ If carrier + service specified, attempt to buy the shipment
    if (carrier && service) {
      const chosenRate = epShipment.rates?.find(
        (r) => r.carrier === carrier && r.service === service
      );
      if (!chosenRate) {
        throw new Error(`Rate not found for ${carrier} ${service}`);
      }

      finalShipment = await this.api.Shipment.buy(epShipment.id, chosenRate);
    }

    return this.mapShipment(finalShipment);
  }

  // -------------------------------
  // Buy Shipment (already created)
  // -------------------------------
  async buyShipment(
    shipmentId: string,
    rate?: ShipmentRate
  ): Promise<Shipment> {
    // 1️⃣ Retrieve the shipment
    const epShipment = await this.api.Shipment.retrieve(shipmentId);

    if (!epShipment) throw new Error(`Shipment ${shipmentId} not found`);

    // 2️⃣ Determine which rate to use
    let chosenRate;
    if (!rate) {
      // If no rate provided, pick the lowest available rate
      if (!epShipment.rates || epShipment.rates.length === 0) {
        throw new Error("No rates available to buy shipment");
      }
      // Using EasyPost's built-in lowestRate() if available
      chosenRate = epShipment.lowestRate?.() ?? epShipment.rates[0];
    } else {
      chosenRate = epShipment.rates.find(
        (r) => r.carrier === rate.carrier && r.service === rate.service
      );
      if (!chosenRate) {
        throw new Error(`Rate not found for ${rate.carrier} ${rate.service}`);
      }
    }

    // 3️⃣ Buy the shipment using the static method
    const boughtShipment = await this.api.Shipment.buy(
      epShipment.id,
      chosenRate
    );

    console.log("Bought shipment:", boughtShipment);
    return this.mapShipment(boughtShipment);
  }

  // -------------------------------
  // Track Shipment
  // -------------------------------
  async trackShipment(trackingNumber: string): Promise<ShipmentTrackingResult> {
    const tracker = await this.api.Tracker.create({
      tracking_code: trackingNumber,
    });
    return {
      status: tracker.status,
      events: tracker.tracking_details ?? [],
      estimatedDelivery: tracker.est_delivery_date ?? undefined,
    };
  }

  // -------------------------------
  // Cancel Shipment
  // -------------------------------
  async cancelShipment(shipmentId: string): Promise<boolean> {
    try {
      const shipment = await this.api.Shipment.retrieve(shipmentId);
      if (!shipment) return false;

      if (shipment.selected_rate?.carrier === "USPS") {
        await this.api.Refund.create({ shipment: shipment.id });
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  // -------------------------------
  // Helper: Map EasyPost shipment to our Shipment interface
  // -------------------------------
  private mapShipment(epShipment: EasyPost.Shipment): Shipment {
    return {
      id: epShipment.id,
      trackingNumber: epShipment.tracking_code,
      labelUrl: epShipment.postage_label?.label_url ?? "",
      status: epShipment.status ?? undefined,
      fromAddress: {
        name: epShipment.from_address?.name || "",
        street1: epShipment.from_address?.street1 || "",
        street2: epShipment.from_address?.street2 || undefined,
        city: epShipment.from_address?.city || "",
        state: epShipment.from_address?.state || "",
        postalCode: epShipment.from_address?.zip || "",
        country: epShipment.from_address?.country || "",
        company: epShipment.from_address?.company || undefined,
        phone: epShipment.from_address?.phone || undefined,
        email: epShipment.from_address?.email || "none",
      },
      toAddress: {
        name: epShipment.to_address?.name || "",
        street1: epShipment.to_address?.street1 || "",
        street2: epShipment.to_address?.street2 || undefined,
        city: epShipment.to_address?.city || "",
        state: epShipment.to_address?.state || "",
        postalCode: epShipment.to_address?.zip || "",
        country: epShipment.to_address?.country || "",
        company: epShipment.to_address?.company || undefined,
        phone: epShipment.to_address?.phone || undefined,
        email: epShipment.to_address?.email || "none",
      },
      parcel: {
        length: epShipment.parcel?.length || 0,
        width: epShipment.parcel?.width || 0,
        height: epShipment.parcel?.height || 0,
        weight: epShipment.parcel?.weight || 0,
      },
      rates: epShipment.rates?.map(
        (r: any): ShipmentRate => ({
          carrier: r.carrier,
          service: r.service,
          rate: dollarsToCents(r.rate), // FIX: string → number
          currency: r.currency,
          deliveryDays: r.delivery_days ?? undefined,
        })
      ),
      carrier: epShipment.selected_rate?.carrier,
      service: epShipment.selected_rate?.service,
    };
  }
}
