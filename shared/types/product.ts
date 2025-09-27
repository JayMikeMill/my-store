// shared/models/Product.ts

import type { Category, Collection } from "./Catalog";

export interface Product {
  id?: string;
  name: string;
  price: number;
  discount?: string;
  description: string;
  stock: number;
  reviewCount?: number;
  averageRating?: number;
  dimensions?: ProductDimensions;
  images?: ProductImageSet[];
  tags?: ProductTag[];
  options?: ProductOption[];
  variants?: ProductVariant[];
  categories?: Category[];
  collections?: Collection[];
  reviews?: ProductReview[];
}

// Product images
export interface ProductImageSet {
  id?: string;
  main: string;
  preview: string;
  thumbnail: string;
}

// Product option
export interface ProductOption {
  id?: string;
  name: string; // e.g., "Color", "Size"
  values: string; // Comma-separated values (e.g., "Red,Blue,Green")
}

// Product option preset (a reusable set of options)
export interface ProductOptionsPreset {
  id?: string;
  name: string;
  options: ProductOption[];
}

// Tag entity
export interface ProductTag {
  id?: string;
  name: string;
  color?: string;
}

export interface ProductTagPreset extends ProductTag {}

// Variant entity
export interface ProductVariant {
  id?: string;
  options: string; // serialized string like "Color:Red|Size:M"
  priceOverride?: number;
  stock: number;
}

// Parse serialized variant options like "Color:Red|Size:M" into objects
export const parseVariantOptions = (variant?: ProductVariant) => {
  if (!variant?.options) return [];
  return variant.options.split("|").map((opt) => {
    const [name, value] = opt.split(":");
    return { name, value };
  });
};

// Selected product option (for cart/store use)
export interface ProductDimensions {
  weight_grams?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
}

// Review entity
export interface ProductReview {
  id?: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// -------------------------
// Product utility functions
// -------------------------
