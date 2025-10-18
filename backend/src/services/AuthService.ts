import { register } from "./../controllers/authController";
// @services/authService.ts
import { auth } from "@adapters/services";
import { AuthApi, AuthResponse } from "shared/interfaces";
import { User } from "shared/types";

class AuthService implements AuthApi {
  async register(user: User, password: string): Promise<AuthResponse> {
    return await auth.register(user, password);
  }

  // Dummy implementation to satisfy interface
  // backend uses authenticate instead, and returns only user to frontend
  async login(): Promise<any> {
    return null;
  }

  // Actual authenticate method used by backend
  async authenticate(
    email: string,
    password: string
  ): Promise<{ token: string | null } & AuthResponse> {
    return await auth.login(email, password);
  }

  async logout(): Promise<AuthResponse> {
    return auth.logout("");
  }
}

export default new AuthService();
