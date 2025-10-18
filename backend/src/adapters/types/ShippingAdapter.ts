import { Address } from "shared/types";

import {
  Parcel,
  ShipmentRate,
  Shipment,
  AddressVerificationResult,
  ShipmentTrackingResult,
} from "shared/types";

export interface ShippingAdapter {
  /**
   * Verify an address
   */
  verifyAddress(address: Address): Promise<AddressVerificationResult>;

  /**
   * Get shipping rates for a given shipment
   */
  getRates(
    fromAddress: Address,
    toAddress: Address,
    parcel: Parcel
  ): Promise<ShipmentRate[]>;

  /**
   * Create a shipment and generate a label
   */
  createShipment(
    fromAddress: Address,
    toAddress: Address,
    parcel: Parcel,
    carrier?: string,
    service?: string
  ): Promise<Shipment>;

  /**
   * Buy a shipment (confirm and pay for the selected rate)
   */
  buyShipment(shipmentId: string, rate?: ShipmentRate): Promise<Shipment>;

  /**
   * Track a shipment by its tracking number
   */
  trackShipment(trackingNumber: string): Promise<ShipmentTrackingResult>;

  /**
   * Cancel a shipment
   */
  cancelShipment(shipmentId: string): Promise<boolean>;
}
