import { FirebaseAuthAdapter } from "@adapters/auth/FirebaseAuthAdapter";
import { FirebaseDBAdapter } from "@adapters/db/FirebaseDBAdapter";
import { PrismaDBAdapter } from "@adapters/db/PrismaDBAdapter";
import { SquarePaymentAdapter } from "@adapters/payment/SquarePaymentAdapter";
import { StripePaymentAdapter } from "@adapters/payment/StripePaymentAdapter";
import { FirebaseStorageAdapter } from "@adapters/storage/FirebaseStorageAdapter";
import { ImgBBStorageAdapter } from "@adapters/storage/ImgBBStorageAdapter";

import { env } from "@config/envVars";
import Stripe from "stripe";

// Create the adapters based on environment variables
export const auth =
  env.ADAPTER_AUTH === "firebase"
    ? new FirebaseAuthAdapter()
    : new FirebaseAuthAdapter();

export const db =
  env.ADAPTER_DB === "firebase"
    ? new FirebaseDBAdapter()
    : new PrismaDBAdapter();

export const storage =
  env.ADAPTER_STORAGE === "firebase"
    ? new FirebaseStorageAdapter()
    : new ImgBBStorageAdapter();

export const payment =
  env.ADAPTER_PAYMENT === "square"
    ? new SquarePaymentAdapter()
    : new StripePaymentAdapter();
