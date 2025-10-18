import { Request, Response, NextFunction } from "express";
import { AuthRole, getAuthUser } from "./authorization";
import { parseQueryType, QueryType, QueryObject } from "shared/types";

// Type guard to detect QueryObject
function isQueryObject<T>(query: QueryType<T>): query is QueryObject<T> {
  return query && typeof query === "object" && "select" in query;
}

// Type guard to detect if an object has an 'id' field
function hasId<T>(obj: any): obj is { id: any } {
  return obj && typeof obj === "object" && "id" in obj;
}

function dataAuthorization(roles: AuthRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // No user attached
      if (!req.user?.role)
        return res.status(401).json({ error: "Unauthorized" });

      // Check if user role is allowed
      if (roles.includes(req.user.role)) return next();

      // OWNER logic: only allow if querying self
      if (roles.includes("OWNER")) {
        // Parse query from request once
        const query = parseQueryType<any>(req.query);

        if (
          query &&
          ((hasId(query) && query.id === req.user.id) ||
            (isQueryObject(query) && query.select?.includes("id")))
        ) {
          return next();
        }
      }

      return res.status(403).json({ error: "Forbidden" });
    } catch (err) {
      console.error("Data Authorization middleware error:", err);
      return res.status(500).json({ error: "Error in data auth middleware" });
    }
  };
}

export const dataAuth = (roles: AuthRole[]) => [
  getAuthUser,
  dataAuthorization(roles),
];
