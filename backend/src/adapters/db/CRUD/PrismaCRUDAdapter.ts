// src/crud/GenericCRUD.ts
import { PrismaClient } from "@prisma/client";
import type { QueryObject } from "@shared/types/QueryObject";
type NestedType = "upsertNested" | "createNested" | "set" | "upsert";
import { CRUDAdapter } from "./CRUDAdapter";

interface NestedFieldOptions {
  type: NestedType;
  path?: string; // nested path for nested inside nested
}

export type FieldMetadata<T> = Partial<Record<keyof T, NestedFieldOptions>>;

function stripIdsRecursive(obj: any): any {
  if (obj && typeof obj === "object") {
    if (Array.isArray(obj)) {
      return obj.map(stripIdsRecursive);
    } else {
      for (const key in obj) {
        if (key === "id" || key.endsWith("Id")) {
          delete obj[key];
        } else {
          obj[key] = stripIdsRecursive(obj[key]);
        }
      }
    }
  }

  return obj;
}

// ---------------- Nested Helpers ----------------
// Recursive function to remove all IDs from the object except root
// Helper functions
function stripIds(obj: any): any {
  if (obj && typeof obj === "object") {
    for (const key in obj) {
      if (key === "id" || key.endsWith("Id")) {
        delete obj[key];
      }
    }
  }
  return obj;
}

function upsertNested<T extends { id?: string }>(items?: T[]): any {
  if (!items?.length) return undefined;

  return items.map((item) => {
    const { id } = item;
    if (!id) return { create: stripIds(item) }; // New row
    return { where: { id }, update: stripIds(item) }; // Existing row
  });
}

function createNested<T extends object>(items?: T[], stripId = true) {
  if (!items?.length) return undefined;
  return {
    create: items.map((item) => {
      const copy = { ...item };
      stripIdsRecursive(copy); // always strip all ids
      return copy;
    }),
  };
}

function replaceNested<T extends object>(items?: T[], path?: string) {
  // Always delete existing rows
  const result: any = { deleteMany: {} };

  // If items exist, create new ones
  if (items?.length) {
    result.create = items.map((item) => {
      const copy: { [key: string]: any } = { ...item };

      // Remove all IDs recursively
      stripIdsRecursive(copy);

      // Handle nested path recursively
      if (path && copy[path]) copy[path] = createNested(copy[path]);

      return copy;
    });
  }

  // If items is undefined or empty, we still return { deleteMany: {} }
  return result;
}

// ---------------- CRUD Class ----------------
export interface PrismaCRUDAdpaterOptions<T> {
  model: keyof PrismaClient;
  include?: any;
  fields?: FieldMetadata<T>;
}

export class PrismaCRUDAdapter<T> implements CRUDAdapter<T> {
  private prisma: PrismaClient;
  private model: keyof PrismaClient;
  private include?: any;
  private fields?: FieldMetadata<T>;

  constructor(prisma: PrismaClient, opts: PrismaCRUDAdpaterOptions<T>) {
    this.prisma = prisma;
    this.model = opts.model;
    this.include = opts.include ?? {};
    this.fields = opts.fields ?? {};
  }

  private get client() {
    return this.prisma[this.model] as any;
  }

  private toPrisma(data: Partial<T>, action: "create" | "update") {
    console.log("toPrisma called with:", { data, action });

    if (!this.fields) return data;
    const result: any = { ...data };

    for (const key in this.fields) {
      const value = data[key as keyof T];
      if (value === undefined) continue;

      let { type, path } = this.fields[key as keyof T]!;

      // During create, switch upsertNested => createNested
      if (action === "create" && type === "upsertNested") type = "createNested";

      switch (type) {
        case "createNested":
          result[key] = createNested(value as any[]);
          break;
        case "upsertNested":
          result[key] = replaceNested(value as any[], path); // update only
          break;

        case "set":
          if (Array.isArray(value) && value.length) {
            result[key] = {
              set: (value as any[]).map((item: any) => ({ id: item.id })),
            };
          } else {
            delete result[key]; // remove empty array
          }
          break;
      }
    }

    return result;
  }

  private fromPrisma(data: any) {
    if (!this.fields) return data;
    const result: any = { ...data };

    for (const key in this.fields) {
      const value = data[key];
      if (value === undefined || value === null) continue;

      const { type, path } = this.fields[key as keyof T]!;

      switch (type) {
        case "upsertNested":
        case "createNested":
          result[key] =
            value.map?.((item: any) => {
              if (path && item[path]?.create) item[path] = item[path].create;
              return item;
            }) ?? [];
          break;

        case "set":
          result[key] = value ?? [];
          break;

        case "upsert":
          result[key] = value ?? undefined;
          break;
      }
    }

    return result;
  }

  // -------------------- CRUD --------------------
  async create(data: Partial<T>): Promise<T> {
    const created = await this.client.create({
      data: this.toPrisma(data, "create"),
      include: this.include,
    });
    return this.fromPrisma(created);
  }

  async get(id: string): Promise<T | null> {
    const found = await this.client.findUnique({
      where: { id },
      include: this.include,
    });
    return found ? this.fromPrisma(found) : null;
  }

  async getAll(query?: QueryObject): Promise<{ data: T[]; total: number }> {
    const prismaQuery = query ? queryOptionsToPrisma(query) : {};
    const where = (prismaQuery as any).where ?? {};
    const [results, total] = await this.prisma.$transaction([
      this.client.findMany({ ...prismaQuery, include: this.include }),
      this.client.count({ where }),
    ]);
    return { data: results.map(this.fromPrisma.bind(this)), total };
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const updated = await this.client.update({
      where: { id },
      data: this.toPrisma(updates, "update"),
      include: this.include,
    });
    return this.fromPrisma(updated);
  }

  async delete(id: string): Promise<T> {
    const deleted = await this.client.delete({
      where: { id },
      include: this.include,
    });
    return this.fromPrisma(deleted);
  }
}

export function queryOptionsToPrisma(query?: QueryObject) {
  let where: any = {};
  const orderBy: any = {};
  let take: number | undefined;
  let skip: number | undefined;

  // Handle individual conditions
  if (query?.conditions?.length) {
    for (const cond of query.conditions) {
      switch (cond.operator) {
        case "=":
          where[cond.field] = cond.value;
          break;
        case "!=":
          where[cond.field] = { not: cond.value };
          break;
        case "<":
          where[cond.field] = { lt: cond.value };
          break;
        case "<=":
          where[cond.field] = { lte: cond.value };
          break;
        case ">":
          where[cond.field] = { gt: cond.value };
          break;
        case ">=":
          where[cond.field] = { gte: cond.value };
          break;
      }
    }
  }

  // Handle global search across multiple fields
  if (!query?.conditions?.length && query?.search) {
    const search = query.search;
    // Example: search in name, description, category
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ];
  }

  // Sorting
  if (query?.sortBy) {
    orderBy[query.sortBy] = query.sortOrder === "desc" ? "desc" : "asc";
  }

  // Pagination
  if (query?.limit) {
    take = query.limit;
    if (query.page) skip = query.limit * (query.page - 1);
  }

  return {
    where: Object.keys(where).length ? where : undefined,
    orderBy: Object.keys(orderBy).length ? orderBy : undefined,
    take,
    skip,
  };
}
