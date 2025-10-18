// src/services/ShippingService.ts
import { shipping } from "@adapters/services";
import { ShippingApi } from "shared/interfaces";
import {
  Address,
  Parcel,
  ShipmentRate,
  Shipment,
  AddressVerificationResult,
  ShipmentTrackingResult,
} from "shared/types";

class ShippingService implements ShippingApi {
  async verifyAddress(address: Address): Promise<AddressVerificationResult> {
    return shipping.verifyAddress(address);
  }

  async getRates(
    from: Address,
    to: Address,
    parcel: Parcel
  ): Promise<ShipmentRate[]> {
    return shipping.getRates(from, to, parcel);
  }

  async trackShipment(trackingNumber: string): Promise<ShipmentTrackingResult> {
    return shipping.trackShipment(trackingNumber);
  }

  async createShipment(
    from: Address,
    to: Address,
    parcel: Parcel,
    carrier?: string,
    service?: string
  ): Promise<Shipment> {
    return shipping.createShipment(from, to, parcel, carrier, service);
  }

  async buyShipment(
    shipmentId: string,
    rate?: ShipmentRate
  ): Promise<Shipment> {
    return shipping.buyShipment(shipmentId, rate);
  }

  async cancelShipment(shipmentId: string): Promise<boolean> {
    return shipping.cancelShipment(shipmentId);
  }
}

export default new ShippingService();
