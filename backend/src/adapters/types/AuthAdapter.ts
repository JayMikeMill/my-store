import { AuthResponse, AuthStatus } from "shared/interfaces";
import { User } from "shared/types";

export interface AuthAdapter {
  register(user: User, password: string): Promise<AuthResponse>;
  login(
    email: string,
    password: string
  ): Promise<{ token: string | null } & AuthResponse>;
  logout(userId: string, token?: string): Promise<AuthResponse>;
  verifyToken(token: string): Promise<AuthResponse>;
}
