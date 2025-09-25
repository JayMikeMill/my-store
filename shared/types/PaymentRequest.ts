import type { Address } from "./Shipping";

export type PaymentRequest = {
  token: string;
  amount: number;

  items: {
    name: string;
    price: number;
    quantity: number;
  }[];

  address: Address;
};
