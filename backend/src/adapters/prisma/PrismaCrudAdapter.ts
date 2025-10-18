/**
 * ====================================================
 * GENERIC ATOMIC NESTED CRUD ADAPTER
 * ====================================================
 *
 * Provides fully generic create / update / delete / read (CRUD) operations
 * for Prisma models, supporting:
 * - Nested relations of any depth
 * - Many-to-many relations
 * - Incremental updates on numeric fields
 * - Automatic handling of include/select metadata
 *
 * Usage:
 * const adapter = new PrismaCrudAdapter(prismaClient, { model: "user" });
 * await adapter.create({ name: "John" });
 * await adapter.getOne({ id: "..." });
 */

import { PrismaClient } from "@prisma/client";
import type { CrudInterface } from "shared/interfaces";
import { isQueryObject, type QueryType, type QueryObject } from "shared/types";
import { prismaNestedUpdate } from "./prismaNestedUpdate";
import { buildPrismaQuery } from "./buildPrismaQuery";
import {
  buildMetadata,
  DotFieldMetadata,
  FieldMetadata,
  ModelMetadata,
} from "./ModelMetadata";

// ----------------- HELPER: REMOVE EMPTY ARRAYS -----------------
/**
 * Removes empty arrays from an object to prevent Prisma errors.
 */
function removeEmptyArrays(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  const copy: any = {};
  for (const key in obj) {
    const val = obj[key];
    if (Array.isArray(val) && val.length === 0) continue;
    copy[key] = val;
  }
  return copy;
}

// ----------------- ADAPTER CONFIG INTERFACE -----------------
export interface PrismaCRUDAdapterProps<T> {
  /** Prisma model name, e.g., 'user' */
  model: keyof PrismaClient;

  /** Optional field metadata for nested relations (dot-notation allowed) */
  fieldMeta?: FieldMetadata<T> | DotFieldMetadata;

  /** Whether this adapter is inside a Prisma transaction */
  isTx?: boolean;
}

// ----------------- GENERIC CRUD ADAPTER -----------------
export class PrismaCrudAdapter<T> implements CrudInterface<T> {
  private prisma: PrismaClient;
  private model: keyof PrismaClient;
  private modelMetadata: ModelMetadata<T>;
  private isTx: boolean;

  constructor(prisma: PrismaClient, opts: PrismaCRUDAdapterProps<T>) {
    this.prisma = prisma;
    this.model = opts.model;
    this.modelMetadata = buildMetadata(opts.fieldMeta || {});
    this.isTx = opts.isTx ?? false;
  }

  /** Access Prisma model client */
  private get client() {
    return this.prisma[this.model] as any;
  }

  /**
   * Convert incoming data into Prisma-compatible nested create/update shape
   */
  private async toPrisma(
    data: Partial<T>,
    action: "create" | "update" | "increment",
    existing?: T
  ) {
    if (existing && (action === "update" || action === "increment")) {
      return prismaNestedUpdate(existing, data, this.modelMetadata, action);
    }

    const created = prismaNestedUpdate(
      null,
      data,
      this.modelMetadata,
      "create"
    );
    return removeEmptyArrays(created);
  }

  //===================================================
  // -------------------- CREATE --------------------
  //===================================================
  async create(data: Partial<T>): Promise<T> {
    const prismaData = await this.toPrisma(data, "create");

    return this.client.create({
      data: prismaData,
      include: this.modelMetadata.baseInclude,
    });
  }

  //===================================================
  // -------------------- GET ONE --------------------
  //===================================================
  async getOne(query: QueryType<T>): Promise<T | null> {
    // If query has `id`, use findUnique
    if ("id" in query && query.id) {
      return this.client.findUnique({
        where: { id: query.id },
        include: this.modelMetadata.baseInclude,
      });
    }

    // Otherwise, use findFirst
    const where: any = {};
    for (const key in query) {
      const val = (query as any)[key];
      if (val !== undefined) where[key] = val;
    }

    return this.client.findFirst({
      where,
      include: this.modelMetadata.baseInclude,
    });
  }

  //===================================================
  // -------------------- GET MANY -------------------
  //===================================================
  async getMany(
    query?: QueryType<T>
  ): Promise<{ data: T[]; total: number } | null> {
    // No query: return all
    if (!query) {
      const [data, total] = !this.isTx
        ? await this.prisma.$transaction([
            this.client.findMany({ include: this.modelMetadata.baseInclude }),
            this.client.count(),
          ])
        : await Promise.all([
            this.client.findMany({ include: this.modelMetadata.baseInclude }),
            this.client.count(),
          ]);
      return { data, total };
    }

    // If query is a QueryObject, use Prisma query builder
    if (isQueryObject(query)) {
      const queryParams = buildPrismaQuery(
        query as QueryObject<T>,
        this.modelMetadata
      );

      const [data, total] = !this.isTx
        ? await this.prisma.$transaction([
            this.client.findMany(queryParams),
            this.client.count({ where: queryParams.where }),
          ])
        : await Promise.all([
            this.client.findMany(queryParams),
            this.client.count({ where: queryParams.where }),
          ]);

      return { data, total };
    }

    // Otherwise, treat query as Partial<T>
    const where: any = {};
    for (const key in query) {
      const val = (query as any)[key];
      if (val !== undefined) where[key] = val;
    }
    const data = await this.client.findMany({
      where,
      include: this.modelMetadata.baseInclude,
    });
    return { data, total: data.length };
  }

  //===================================================
  // -------------------- UPDATE --------------------
  //===================================================
  async update(
    updates: Partial<T> & { id?: string },
    options?: { increment: boolean }
  ): Promise<T> {
    if (!updates.id) throw new Error("Document id is required for update");

    const { id, ...rest } = updates;
    const restData = rest as Partial<T>;

    if (options?.increment) return this.increment(id, restData);

    const existing = await this.getOne({ id } as any);
    if (!existing) throw new Error("Document not found");

    const prismaData = await this.toPrisma(restData, "update", existing);
    return this.client.update({
      where: { id },
      data: prismaData,
      include: this.modelMetadata.baseInclude,
    });
  }

  // ----------------- INCREMENT -----------------
  async increment(id: string, updates: Partial<T>): Promise<T> {
    const existing = await this.getOne({ id } as any);
    if (!existing) throw new Error("Document not found");

    const prismaData = await this.toPrisma(updates, "increment", existing);
    return this.client.update({
      where: { id },
      data: prismaData,
      include: this.modelMetadata.baseInclude,
    });
  }

  //===================================================
  // -------------------- DELETE --------------------
  //===================================================
  async delete(id: string): Promise<T> {
    return this.client.delete({
      where: { id },
      include: this.modelMetadata.baseInclude,
    });
  }
}
