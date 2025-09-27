import { CRUDInterface } from "@shared/types/crud-interface";

import {
  Product,
  ProductOptionsPreset,
  ProductReview,
  ProductTagPreset,
  ProductVariant,
} from "@shared/types/Product";
import { Category, Collection } from "@shared/types/Catalog";
import { Order } from "@shared/types/Order";
import { User } from "@shared/types/User";

export interface DBAdapter {
  products: CRUDInterface<Product>;
  productTagsPresets: CRUDInterface<ProductTagPreset>;
  productOptionsPresets: CRUDInterface<ProductOptionsPreset>;
  productReviews: CRUDInterface<ProductReview>;

  categories: CRUDInterface<Category>;
  collections: CRUDInterface<Collection>;
  orders: CRUDInterface<Order>;
  users: CRUDInterface<User>;
}
