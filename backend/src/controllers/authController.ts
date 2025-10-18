import { controllerHandler } from "@utils";
import { AuthService as S } from "@services";
import { AuthResponse } from "shared/interfaces";

export const register = controllerHandler({
  handler: async ({ user, password }, req): Promise<AuthResponse> => {
    // Prevent non-admins from creating admin accounts
    if (user.role === "ADMIN" && req.user?.role !== "ADMIN") {
      return {
        user: null,
        success: false,
        status: "ERROR",
        message: "Only admins can create admin accounts",
      };
    }

    return S.register(user, password);
  },
});

export const login = controllerHandler({
  handler: async ({ email, password }, req, res): Promise<AuthResponse> => {
    const { token, user, success, status, message } = await S.authenticate(
      email,
      password
    );

    if (!success) return { user, success, status, message };

    // Set HTTP-only cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    return { user, success, status, message };
  },
});

export const logout = controllerHandler({
  handler: async (id, req, res): Promise<AuthResponse> => {
    await S.logout();
    // Clear cookie
    res.clearCookie("auth_token");
    return {
      user: null,
      success: true,
      status: "SUCCESS",
      message: "User logged out",
    };
  },
});
