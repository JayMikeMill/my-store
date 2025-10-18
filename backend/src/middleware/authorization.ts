import { Request, Response, NextFunction } from "express";
import { auth } from "@adapters/services";
import dotenv from "dotenv";
import path from "path";
import { User, UserRole } from "shared/types";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * Middleware to require authentication and specific roles.
 * @param allowedRoles - array of roles, e.g., ["ADMIN"], ["OWNER"], ["ADMIN","OWNER"]
 */

export type AuthRole = UserRole | "OWNER";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string; role?: AuthRole };
  }
}

export const getAuthUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (process.env.REQUIRE_AUTH === "false") return next();

    const token = req.cookies.auth_token;

    if (!token) {
      req.user = undefined;
      return next();
    } else {
      const { user, success, message } = await auth.verifyToken(token);

      if (success && user) {
        req.user = { id: user.id!, role: user.role };
        console.log("Authenticated user:", req.user);
      } else {
        throw new Error(message || "Token verification failed");
      }
    }

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ error: "Authentication failed" });
  }
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }

  next();
};

export const reqAdmin = [getAuthUser, requireAdmin];
