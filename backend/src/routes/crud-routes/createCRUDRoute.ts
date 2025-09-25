// src/routes/crudRouter.ts
import { Router, Request, Response, NextFunction } from "express";
import { requireRole } from "@middleware/authorization";
import type { Role } from "@middleware/authorization";
import { QueryObject } from "@shared/types/QueryObject";
import { CRUDInterface } from "@shared/types/crud-interface";

/**
 * If rolesAllowed is empty or undefined, route is public.
 */
export type CRUDRouteAuth = Role[];

export type CRUDRouteOptions = {
  create?: CRUDRouteAuth;
  read?: CRUDRouteAuth;
  update?: CRUDRouteAuth;
  delete?: CRUDRouteAuth;
};

/**
 * Creates a full CRUD router for a given CRUDAdapter.
 * Authorization is applied only if rolesAllowed has roles.
 */
export function createCRUDRoute(
  crud: CRUDInterface<any>,
  options?: CRUDRouteOptions
) {
  const router = Router();

  // ---------------- CREATE ----------------
  const createHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await crud.create(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
  if (options?.create?.length)
    router.post("/", requireRole(options.create), createHandler);
  else router.post("/", createHandler);

  // ---------------- READ ALL ----------------
  const readAllHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await crud.getAll(parseQueryObject(req.query));
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
  if (options?.read?.length)
    router.get("/", requireRole(options.read), readAllHandler);
  else router.get("/", readAllHandler);

  // ---------------- READ ONE ----------------
  const readOneHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const item = await crud.get(req.params.id);
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  };
  if (options?.read?.length)
    router.get("/:id", requireRole(options.read), readOneHandler);
  else router.get("/:id", readOneHandler);

  // ---------------- UPDATE ----------------
  const updateHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const updated = await crud.update(req.body);
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };
  if (options?.update?.length)
    router.put("/:id", requireRole(options.update), updateHandler);
  else router.put("/:id", updateHandler);

  // ---------------- DELETE ----------------
  const deleteHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const deleted = await crud.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Not found" });
      res.json({ message: "Deleted", data: deleted });
    } catch (err) {
      next(err);
    }
  };
  if (options?.delete?.length)
    router.delete("/:id", requireRole(options.delete), deleteHandler);
  else router.delete("/:id", deleteHandler);

  return router;
}

export function parseQueryObject(query: Record<string, any>): QueryObject {
  const options: QueryObject = {};

  if (query.limit !== undefined) {
    const n = parseInt(query.limit as string);
    if (!isNaN(n) && n > 0) options.limit = n;
  }

  if (query.page !== undefined) {
    const n = parseInt(query.page as string);
    if (!isNaN(n) && n > 0) options.page = n;
  }

  if (query.sortBy !== undefined) {
    options.sortBy = query.sortBy as string;
  }

  if (query.sortOrder !== undefined) {
    const order = (query.sortOrder as string).toLowerCase();
    if (order === "asc" || order === "desc") options.sortOrder = order;
  }

  return options;
}
