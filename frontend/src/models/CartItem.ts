// frontend/src/types/CartItem.ts
import type { Product, ProductVariant } from "@shared/types/Product";

// Represents an item in the shopping cart
export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}
