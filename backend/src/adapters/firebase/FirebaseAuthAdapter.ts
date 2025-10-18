// backend/src/adapters/firebase/FirebaseAuthAdapter.ts
import { User } from "shared/types";
import { AuthAdapter } from "@adapters/types";
import { useFirebase } from "./config/firebaseAdmin";
import type { AuthResponse, AuthStatus } from "shared/interfaces";

export class FirebaseAuthAdapter implements AuthAdapter {
  private auth = useFirebase().auth;

  // Register a new user
  async register(user: User, password: string): Promise<AuthResponse> {
    try {
      const record = await this.auth.createUser({
        email: user.email,
        password,
      });

      // Set custom claims for role-based access
      await this.auth.setCustomUserClaims(record.uid, {
        role: user.role || "user",
      });

      // Optional: store user in your DB here

      const newUser: User = { ...user, id: record.uid };
      return { user: newUser, success: true, status: "SUCCESS" };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { user: null, success: false, status: "ERROR", message };
    }
  }

  // Login (return token and user)
  async login(
    email: string,
    password: string
  ): Promise<AuthResponse & { token: string | null }> {
    try {
      // In Firebase, login is usually handled on the client via Firebase SDK
      // Optionally, verify credentials via Firebase Admin here
      const userRecord = await this.auth.getUserByEmail(email);
      if (!userRecord) {
        return {
          user: null,
          token: null,
          success: false,
          status: "USER_NOT_FOUND",
        };
      }

      // Generate a custom token (Firebase uses this for client login)
      const token = await this.auth.createCustomToken(userRecord.uid);

      const user: User = userRecord as unknown as User;

      return { user, token, success: true, status: "SUCCESS" };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        user: null,
        token: null,
        success: false,
        status: "ERROR",
        message,
      };
    }
  }

  // Verify Firebase token
  async verifyToken(
    token: string
  ): Promise<AuthResponse & { token: string | null }> {
    try {
      const decoded = await this.auth.verifyIdToken(token);
      const userRecord = await this.auth.getUser(decoded.uid);
      const user: User = userRecord as unknown as User;
      return { user, token, success: true, status: "SUCCESS" };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        user: null,
        token: null,
        success: false,
        status: "ERROR",
        message,
      };
    }
  }

  // Logout (revoke refresh tokens)
  async logout(userId: string): Promise<AuthResponse> {
    try {
      await this.auth.revokeRefreshTokens(userId);
      return {
        user: null,
        success: true,
        status: "SUCCESS",
        message: "User logged out (tokens revoked)",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { user: null, success: false, status: "ERROR", message };
    }
  }
}
