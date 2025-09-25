import type { JSX } from "react";
import { useAuth } from "@contexts/auth/AuthContext";
import LoginDialog from "@components/dialogs/LoginDialog";
import { type UserRole } from "@shared/types/User";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: JSX.Element;
}

export function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user || !user.role || !allowedRoles.includes(user.role))
    return <LoginDialog />;

  return children;
}
