import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { AuthAdapter } from "@adapters/types";
import { db } from "@adapters/services";
import { User } from "shared/types";
import { AuthResponse } from "shared/interfaces";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = "1d";

export class JwtAuthAdapter implements AuthAdapter {
  //==================================================
  // Register a new user
  //==================================================
  async register(user: User, password: string): Promise<AuthResponse> {
    try {
      const existingUser = await db.users.getOne({ email: user.email });
      if (existingUser)
        return { user: null, success: false, status: "USER_EXISTS" };

      // Hash password with Argon2id
      const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64MB
        timeCost: 3, // iterations
        parallelism: 1,
      });

      const newUser = { ...user, passwordHash };
      const createdUser = await db.users.create(newUser);

      const { passwordHash: _, ...userWithoutPassword } = createdUser;
      return {
        user: userWithoutPassword as User,
        success: true,
        status: "SUCCESS",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { user: null, success: false, status: "ERROR", message };
    }
  }

  //==================================================
  // Login and return JWT
  //==================================================
  async login(
    email: string,
    password: string
  ): Promise<{ token: string | null } & AuthResponse> {
    try {
      const userRecord = await db.users.getOne({ email });

      if (!userRecord)
        return {
          token: null,
          user: null,
          success: false,
          status: "USER_NOT_FOUND",
        };

      const valid = await argon2.verify(userRecord.passwordHash, password);
      if (!valid)
        return {
          token: null,
          user: null,
          success: false,
          status: "INVALID_PASSWORD",
        };

      const token = jwt.sign({ userId: userRecord.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      const { passwordHash: _, ...userWithoutPassword } = userRecord;

      return {
        token,
        user: userWithoutPassword as User,
        success: true,
        status: "SUCCESS",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        token: null,
        user: null,
        success: false,
        status: "ERROR",
        message,
      };
    }
  }

  //==================================================
  // Logout (JWT is stateless)
  //==================================================
  async logout(userId: string): Promise<AuthResponse> {
    return {
      user: null,
      success: true,
      status: "SUCCESS",
      message: "User logged out",
    };
  }

  //==================================================
  // Verify JWT and return user
  //==================================================
  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      const userRecord = await db.users.getOne({ id: payload.userId });

      if (!userRecord)
        return {
          user: null,
          success: false,
          status: "USER_NOT_FOUND",
        };

      const { passwordHash: _, ...userWithoutPassword } = userRecord;
      return {
        user: userWithoutPassword as User,
        success: true,
        status: "SUCCESS",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { user: null, success: false, status: "ERROR", message };
    }
  }
}
