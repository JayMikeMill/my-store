// upsertBuilder.ts
import { randomUUID } from "crypto";

export type AnyObject = { [key: string]: any };

const isObject = (val: unknown): val is AnyObject =>
  val !== null && typeof val === "object" && !Array.isArray(val);

/**
 * Remove `id` and any foreign key ending with 'Id' for create clauses.
 */
export const stripIds = (obj: AnyObject): AnyObject => {
  if (!isObject(obj)) return obj;
  const clone: AnyObject = {};
  for (const key in obj) {
    if (key === "id" || key.endsWith("Id")) continue;
    const val = obj[key];
    clone[key] = Array.isArray(val) ? val.map(stripIds) : stripIds(val);
  }
  return clone;
};

function createNested(input: AnyObject): AnyObject {
  if (!isObject(input)) return input;

  const { id, ...rest } = input;
  const obj: AnyObject = stripIds(rest);

  const result: AnyObject = {};

  for (const key in obj) {
    const val = obj[key];

    if (Array.isArray(val)) {
      if (val.length === 0) continue;
      result[key] = {
        create: val.map((item) => createNested(item)),
      };
    } else if (isObject(val)) {
      result[key] = createNested(val);
    } else {
      result[key] = val;
    }
  }

  return result;
}

function updateNested(input: AnyObject): AnyObject {
  if (!isObject(input)) return input;

  const { id, ...rest } = input;
  const result: AnyObject = {};

  for (const key in rest) {
    const val = rest[key];
    if (Array.isArray(val)) {
      if (val.length === 0) continue;
      result[key] = {
        update: val.map((item) => {
          if (item.id)
            return {
              where: { id: item.id },
              update: updateNested(item),
              create: createNested(item),
            };
          else return { create: createNested(item) };
        }),
      };
    } else if (isObject(val)) {
      if (val.id) result[key] = updateNested(val);
      else result[key] = createNested(val);
    } else {
      result[key] = val;
    }
  }

  return result;
}

export function upsertNested(input: AnyObject): AnyObject {
  if (!isObject(input)) return input;

  const { id, ...rest } = input;
  const result: AnyObject = {};

  if (id) {
    result.where = { id };
    result.update = updateNested(rest);
    result.create = createNested(rest);
  } else {
    result.create = createNested(rest);
  }

  return result;
}
