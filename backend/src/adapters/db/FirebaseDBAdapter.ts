// backend/src/adapters/db/FirebaseAdapter.ts
import { FirebaseCRUDAdapter } from "./CRUD/FireBaseCRUDAdapter";
import { CRUDInterface } from "@shared/types/crud-interface";

import { User } from "@shared/types/User";
import {
  Product,
  ProductOptionsPreset,
  ProductReview,
  ProductTag,
  ProductTagPreset,
  ProductVariant,
} from "@shared/types/Product";
import { Category, Collection } from "@shared/types/Catalog";
import { Order } from "@shared/types/Order";
import type { DBAdapter } from "./DBAdapter";

export class FirebaseDBAdapter implements DBAdapter {
  public users: CRUDInterface<User>;
  public products: CRUDInterface<Product>;
  public productTagsPresets: CRUDInterface<ProductTagPreset>;
  public productOptionsPresets: CRUDInterface<ProductOptionsPreset>;
  public productReviews: CRUDInterface<ProductReview>;
  public categories: CRUDInterface<Category>;
  public collections: CRUDInterface<Collection>;
  public orders: CRUDInterface<Order>;

  constructor() {
    this.users = new FirebaseCRUDAdapter<User>("users");
    this.products = new FirebaseCRUDAdapter<Product>("products");
    this.productTagsPresets = new FirebaseCRUDAdapter<ProductTag>("tags");
    this.productOptionsPresets = new FirebaseCRUDAdapter<ProductOptionsPreset>(
      "product_options_presets"
    );
    this.productReviews = new FirebaseCRUDAdapter<ProductReview>(
      "product_reviews"
    );
    this.categories = new FirebaseCRUDAdapter<Category>("categories");
    this.collections = new FirebaseCRUDAdapter<Collection>("collections");
    this.orders = new FirebaseCRUDAdapter<Order>("orders");
  }
}
