/**
 * ====================================================
 * GENERIC PRISMA QUERY BUILDER
 * ====================================================
 *
 * Converts a custom QueryObject<T> into a Prisma-compatible
 * findMany/findFirst/findUnique query object.
 *
 * Supports:
 * - Nested dot-notation fields
 * - Full-text search on multiple fields
 * - Conditions with operators (=, !=, <, <=, >, >=, like, in)
 * - Select/include nested fields
 * - Sorting, pagination (limit & page)
 */

import { DeepDotKeyof, QueryCondition, QueryObject } from "shared/types";
import { ModelMetadata } from "./ModelMetadata";

/** Prisma find parameters */
type PrismaFindParams = {
  where?: any;
  select?: any;
  include?: any;
  orderBy?: any;
  take?: number;
  skip?: number;
};

/** -------------------- DEEP MERGE --------------------
 * Recursively merges `source` object into `target`.
 * Arrays are overwritten; only plain objects are merged.
 */
export function deepMerge(target: any, source: any) {
  if (!source || typeof source !== "object") return target;

  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];

    if (
      srcVal &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal) &&
      srcVal.constructor === Object
    ) {
      if (
        !tgtVal ||
        typeof tgtVal !== "object" ||
        tgtVal.constructor !== Object
      ) {
        target[key] = {};
      }
      deepMerge(target[key], srcVal);
    } else {
      target[key] = srcVal;
    }
  }

  return target;
}

/** -------------------- BUILD PRISMA QUERY --------------------
 * Converts a QueryObject<T> into Prisma findMany params
 */
export function buildPrismaQuery<T>(
  queryObj: QueryObject<T>,
  modelMeta: ModelMetadata<T>
): PrismaFindParams {
  // Build WHERE clause from conditions + search
  const where = buildPrismaWhere(queryObj, modelMeta.baseSearch || []);

  let select: any = undefined;
  let include: any = undefined;

  // Build select/include
  if (queryObj.select?.length) {
    select = buildNestedPrisma(queryObj.select.map(String), "select");
  } else if (queryObj.include?.length) {
    include = buildNestedPrisma(queryObj.include.map(String), "include");
  } else if (modelMeta.baseInclude) {
    include = modelMeta.baseInclude;
  }

  // Sorting and pagination
  const orderBy = queryObj.sortBy
    ? { [queryObj.sortBy]: queryObj.sortOrder === "desc" ? "desc" : "asc" }
    : undefined;
  const take = queryObj.limit;
  const skip =
    queryObj.page && queryObj.page > 1
      ? (queryObj.limit ?? 0) * (queryObj.page - 1)
      : undefined;

  const result: PrismaFindParams = { where, orderBy };
  if (typeof take === "number") result.take = take;
  if (typeof skip === "number") result.skip = skip;

  if (select && Object.keys(select).length) {
    result.select = select;
  } else if (include && Object.keys(include).length) {
    result.include = include;
  }

  return result;
}

/** -------------------- BUILD WHERE CLAUSE --------------------
 * Converts QueryObject conditions and search fields into Prisma where
 */
export function buildPrismaWhere<T>(
  query: QueryObject<T>,
  defaultSearchFields: (keyof T)[]
): any {
  const where: any = {};

  // Conditions
  if (query.conditions?.length) {
    for (const cond of query.conditions) {
      const nested = buildNestedWhere(cond.field, {
        [mapOperator(cond.operator)]: cond.value,
      });
      deepMerge(where, nested);
    }
  }

  // Full-text search
  if (query.search) {
    const searchFields =
      query.searchFields && query.searchFields.length > 0
        ? query.searchFields
        : defaultSearchFields;

    if (!searchFields || searchFields.length === 0) {
      throw new Error("searchFields must be defined for search queries.");
    }

    where.OR = searchFields.map((field) => {
      const parts = String(field).split(".");
      let nested: any = { contains: query.search };
      for (let i = parts.length - 1; i >= 0; i--) {
        nested = { [parts[i]]: nested };
      }
      return nested;
    });
  }

  return where;
}

/** -------------------- NESTED WHERE BUILDER --------------------
 * Converts dot-notation string field into nested Prisma where object
 */
export function buildNestedWhere(field: DeepDotKeyof<any>, value: any): any {
  if (field === undefined || field === null || field === "") return value;

  const parts = String(field).split(".");
  let nested: any = value;

  for (let i = parts.length - 1; i >= 0; i--) {
    const key = parts[i];
    if (key) nested = { [key]: nested };
  }

  return nested;
}

/** -------------------- OPERATOR MAPPING --------------------
 * Maps custom operators to Prisma query operators
 */
function mapOperator(op: QueryCondition["operator"]): string {
  switch (op) {
    case "=":
      return "equals";
    case "!=":
      return "not";
    case "<":
      return "lt";
    case "<=":
      return "lte";
    case ">":
      return "gt";
    case ">=":
      return "gte";
    case "like":
      return "contains";
    case "in":
      return "in";
    default:
      return "equals";
  }
}

/**
 * Build nested Prisma select/include object from array of dot-notation strings
 *
 * @param fields - array of dot-notation strings
 * @param mode - "select" (default) or "include"
 * @returns nested object ready for Prisma
 */
export function buildNestedPrisma(
  fields: string[],
  mode: "select" | "include" = "select"
): any {
  const root: any = {};

  for (const field of fields) {
    const parts = field.split(".");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const leaf = i === parts.length - 1;
      const key = parts[i];

      if (leaf) {
        current[key] = true;
      } else {
        if (!current[key] || current[key] === true) current[key] = {};
        if (mode === "include" && !("include" in current[key])) {
          current[key] = { include: current[key] };
        }
        current = mode === "include" ? current[key].include : current[key];
      }
    }
  }

  return root;
}
