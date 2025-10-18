// backend/src/adapters/db/FirebaseAdapter.ts
import { FirebaseCrudAdapter } from "./FireBaseCrudAdapter";

import type { CrudInterface } from "shared/interfaces";

import {
  Product,
  ProductOptionsPreset,
  ProductReview,
  ProductTag,
  ProductTagPreset,
  Category,
  Collection,
  Order,
  User,
  ProductVariant,
  SystemSettings,
} from "shared/types";

import type { DBAdapter } from "@adapters/types";

export class FirebaseDBAdapter implements DBAdapter {
  public users: CrudInterface<User>;
  public products: CrudInterface<Product>;
  public productVariants: CrudInterface<ProductVariant>;
  public productTagsPresets: CrudInterface<ProductTagPreset>;
  public productOptionsPresets: CrudInterface<ProductOptionsPreset>;
  public productReviews: CrudInterface<ProductReview>;
  public categories: CrudInterface<Category>;
  public collections: CrudInterface<Collection>;
  public orders: CrudInterface<Order>;
  public systemSettings: CrudInterface<SystemSettings>;

  constructor() {
    this.users = new FirebaseCrudAdapter<User>("users");
    this.products = new FirebaseCrudAdapter<Product>("products");
    this.productVariants = new FirebaseCrudAdapter<ProductVariant>(
      "product_variants"
    );
    this.productTagsPresets = new FirebaseCrudAdapter<ProductTag>("tags");
    this.productOptionsPresets = new FirebaseCrudAdapter<ProductOptionsPreset>(
      "product_options_presets"
    );
    this.productReviews = new FirebaseCrudAdapter<ProductReview>(
      "product_reviews"
    );
    this.categories = new FirebaseCrudAdapter<Category>("categories");
    this.collections = new FirebaseCrudAdapter<Collection>("collections");
    this.orders = new FirebaseCrudAdapter<Order>("orders");

    this.systemSettings = new FirebaseCrudAdapter<SystemSettings>(
      "system_settings"
    );
  }

  public isTx: boolean = false;
  async transaction<T>(callback: (tx: DBAdapter) => Promise<T>): Promise<T> {
    // Firebase doesn’t have multi-collection transactions easily
    return callback(this);
  }
}
