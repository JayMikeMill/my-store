// shared/types/Order.ts
import type { ShippingInfo, Address } from "./Shipping";
import type { User } from "./User";

export interface Order {
  id?: string;
  userId?: string;
  status: OrderStatus;
  total: number; // cents
  transaction: Transaction;
  shippingInfo: ShippingInfo;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  invoices?: Invoice[];
  createdAt: Date;
  updatedAt: Date;
  notes?: string;

  // Related user
  user?: User;
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  product: JSON;
  variant?: JSON;
  quantity: number;
  price: number;

  // Related order
  order?: Order;
}

export interface Transaction {
  id?: string;
  orderId?: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: TransactionStatus;
  billingAddress?: Address;

  // Related order
  order?: Order;
}

export const TransactionStatuses = {
  PENDING: "PENDING",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
} as const;

export type TransactionStatus =
  (typeof TransactionStatuses)[keyof typeof TransactionStatuses];

export const PaymentMethods = {
  CARD: "CARD",
  STRIPE: "STRIPE",
  PAYPAL: "PAYPAL",
  SQUARE: "SQUARE",
  CASH: "CASH",
  APPLE_PAY: "APPLE_PAY",
  GOOGLE_PAY: "GOOGLE_PAY",
  BANK_TRANSFER: "BANK_TRANSFER",
  AFTERPAY: "AFTERPAY",
  KLARNA: "KLARNA",
  BITCOIN: "BITCOIN",
  ETHEREUM: "ETHEREUM",
  LITECOIN: "LITECOIN",
  OTHER_CRYPTO: "OTHER_CRYPTO",
  OTHER: "OTHER",
} as const;

export type PaymentMethod =
  (typeof PaymentMethods)[keyof typeof PaymentMethods];

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  pdfUrl?: string;
  createdAt: Date;

  // Related order
  order?: Order;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  timestamp: Date;

  // Related order
  order?: Order;
}

export const OrderStatuses = {
  PENDING: "PENDING",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof OrderStatuses)[keyof typeof OrderStatuses];
