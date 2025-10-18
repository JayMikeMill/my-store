import { PrismaClient } from "@prisma/client";
import { PrismaCrudAdapter, PrismaCRUDAdapterProps } from "./PrismaCrudAdapter";

import type {
  User,
  Category,
  Collection,
  Product,
  ProductVariant,
  ProductOptionsPreset,
  ProductTagPreset,
  ProductReview,
  Order,
  SystemSettings,
} from "shared/types";
import { FieldConfigDefaults } from "./ModelMetadata";

//==================================================
// CRUD Configuration
//==================================================

const { owned, manyToMany, json, include, search } = FieldConfigDefaults;

const CrudProps: CrudPropsType = {
  // ========================================
  // Core user/auth
  // ========================================
  users: {
    model: "user",
    fieldMeta: {
      email: { search },
      settings: { json },
    },
  },

  // ========================================
  // Catalog & Products
  // ========================================
  categories: {
    model: "category",
    fieldMeta: {
      name: { search },
      description: { search },
      images: { owned, include },
    },
  },

  collections: {
    model: "collection",
    fieldMeta: {
      name: { search },
      description: { search },
      images: { owned, include },
    },
  },

  products: {
    model: "product",
    fieldMeta: {
      id: { search },
      name: { search },
      description: { search },
      images: { owned, include },
      tags: { owned, include },
      options: { owned, include },
      variants: { owned, include },
      dimensions: { owned, include },
      categories: { manyToMany, include },
      collections: { manyToMany, include },
      reviews: { owned, include },
    },
  },

  productVariants: {
    model: "productVariant",
    fieldMeta: {
      id: { search },
      options: { json },
    },
  },

  productOptionsPresets: {
    model: "productOptionsPreset",
    fieldMeta: {
      name: { search },
      options: { json },
    },
  },

  productTagsPresets: {
    model: "productTagPreset",
    fieldMeta: { name: { search } },
  },

  productReviews: {
    model: "productReview",
  },

  // ========================================
  // Commerce
  // ========================================
  orders: {
    model: "order",

    fieldMeta: {
      id: { search },
      userId: { search },
      shippingInfo: { owned, include },
      "shippingInfo.address": { owned, include },
      items: { owned, include },
      "items.product": { json },
      "items.variant": { json },
      transaction: { owned, include },
      "transaction.billingAddress": { owned, include },
      "transaction.gatewayResponse": { json },
      statusHistory: { owned, include },
      invoices: { owned, include },
    },
  },

  // ========================================
  // System / Configuration
  // ========================================
  systemSettings: {
    model: "systemSettings",
    fieldMeta: {
      scope: { search },
      settings: { json },
    },
  },
};

//==================================================
// Types
//==================================================

type CrudPropsType = {
  users: PrismaCRUDAdapterProps<User>;
  categories: PrismaCRUDAdapterProps<Category>;
  collections: PrismaCRUDAdapterProps<Collection>;
  products: PrismaCRUDAdapterProps<Product>;
  productVariants: PrismaCRUDAdapterProps<ProductVariant>;
  productOptionsPresets: PrismaCRUDAdapterProps<ProductOptionsPreset>;
  productTagsPresets: PrismaCRUDAdapterProps<ProductTagPreset>;
  productReviews: PrismaCRUDAdapterProps<ProductReview>;
  orders: PrismaCRUDAdapterProps<Order>;
  systemSettings: PrismaCRUDAdapterProps<SystemSettings>;
};

//==================================================
// ----------------- Crud Adapters -----------------
//==================================================

// ---------- Core user/auth ----------
class UserCrud extends PrismaCrudAdapter<User> {
  constructor(prismaClient: PrismaClient, isTx?: boolean) {
    super(prismaClient, { ...CrudProps.users, isTx });
  }
}

// ---------- Catalog & Products ----------
class CategoryCrud extends PrismaCrudAdapter<Category> {
  constructor(prismaClient: PrismaClient, isTx?: boolean) {
    super(prismaClient, { ...CrudProps.categories, isTx });
  }
}

class CollectionCrud extends PrismaCrudAdapter<Collection> {
  constructor(prismaClient: PrismaClient, isTx?: boolean) {
    super(prismaClient, { ...CrudProps.collections, isTx });
  }
}

class ProductCrud extends PrismaCrudAdapter<Product> {
  constructor(prismaClient: PrismaClient, isTx?: boolean) {
    super(prismaClient, { ...CrudProps.products, isTx });
  }
}

class ProductVariantCrud extends PrismaCrudAdapter<ProductVariant> {
  constructor(prismaClient: PrismaClient, isTx?: boolean) {
    super(prismaClient, { ...CrudProps.productVariants, isTx });
  }
}

class ProductOptionPresetCrud extends PrismaCrudAdapter<ProductOptionsPreset> {
  constructor(prismaClient: PrismaClient, isTx?: boolean) {
    super(prismaClient, { ...CrudProps.productOptionsPresets, isTx });
  }
}

class ProductTagPresetCrud extends PrismaCrudAdapter<ProductTagPreset> {
  constructor(prismaClient: PrismaClient, isTx?: boolean) {
    super(prismaClient, { ...CrudProps.productTagsPresets, isTx });
  }
}

class ProductReviewCrud extends PrismaCrudAdapter<ProductReview> {
  constructor(prismaClient: PrismaClient, isTx?: boolean) {
    super(prismaClient, { ...CrudProps.productReviews, isTx });
  }
}

// ---------- Commerce ----------
class OrderCrud extends PrismaCrudAdapter<Order> {
  constructor(prismaClient: PrismaClient, isTx?: boolean) {
    super(prismaClient, { ...CrudProps.orders, isTx });
  }
}

// ---------- System / Configuration ----------
class SystemSettingsCrud extends PrismaCrudAdapter<SystemSettings> {
  constructor(prismaClient: PrismaClient, isTx?: boolean) {
    super(prismaClient, { ...CrudProps.systemSettings, isTx });
  }
}

//==================================================
// Exports
//==================================================

export {
  // Core user/auth
  UserCrud,

  // Catalog & Products
  CategoryCrud,
  CollectionCrud,
  ProductCrud,
  ProductVariantCrud,
  ProductOptionPresetCrud,
  ProductTagPresetCrud,
  ProductReviewCrud,

  // Commerce
  OrderCrud,

  // System / Configuration
  SystemSettingsCrud,
};
