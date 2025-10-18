// src/routes/crudRouter.ts
import { Router, Request, Response, NextFunction } from "express";
import { dataAuth } from "@middleware/dataAuth";
import type { AuthRole } from "@middleware/authorization";
import type { CrudInterface } from "shared/interfaces";
import { parseQueryType } from "shared/types";

export type CRUDRouteAuth = AuthRole[];

export type CRUDRouteOptions = {
  create?: CRUDRouteAuth;
  readOne?: CRUDRouteAuth;
  readMany?: CRUDRouteAuth;
  update?: CRUDRouteAuth;
  delete?: CRUDRouteAuth;
};

export const reqAdminEdit: CRUDRouteOptions = {
  create: ["ADMIN"],
  update: ["ADMIN"],
  delete: ["ADMIN"],
};

export const reqOwnerAll: CRUDRouteOptions = {
  create: ["ADMIN", "OWNER"],
  readOne: ["ADMIN", "OWNER"],
  readMany: ["ADMIN"], // Only admin can list all
  update: ["ADMIN", "OWNER"],
  delete: ["ADMIN", "OWNER"],
};
export function createCrudRoute(
  crud: CrudInterface<any>,
  options?: CRUDRouteOptions
) {
  const router = Router();

  const wrapHandler =
    (handler: (req: Request) => Promise<any>) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.json(await handler(req));
      } catch (err) {
        next(err);
      }
    };

  // ---------------- CREATE ----------------
  const createHandler = wrapHandler((req) => crud.create(req.body));
  if (options?.create?.length)
    router.post("/", dataAuth(options.create), createHandler);
  else router.post("/", createHandler);

  // ---------------- READ ----------------
  // getOne
  const getOneHandler = wrapHandler((req) => {
    return crud.getOne(parseQueryType(req.query) ?? {});
  });

  if (options?.readOne?.length)
    router.get("/one/", dataAuth(options.readOne), getOneHandler);
  else router.get("/one/", getOneHandler);

  // getMany
  const getManyHandler = wrapHandler((req) =>
    crud.getMany(parseQueryType(req.query))
  );
  if (options?.readMany?.length)
    router.get("/", dataAuth(options.readMany), getManyHandler);
  else router.get("/", getManyHandler);

  // ---------------- UPDATE ----------------
  const updateHandler = wrapHandler((req) =>
    crud.update({ ...req.body, id: req.params.id })
  );
  if (options?.update?.length)
    router.put("/:id", dataAuth(options.update), updateHandler);
  else router.put("/:id", updateHandler);

  // ---------------- DELETE ----------------
  const deleteHandler = wrapHandler((req) => crud.delete(req.params.id));
  if (options?.delete?.length)
    router.delete("/:id", dataAuth(options.delete), deleteHandler);
  else router.delete("/:id", deleteHandler);

  return router;
}
