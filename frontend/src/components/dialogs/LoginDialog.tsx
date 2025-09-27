// src/components/LoginDialog.tsx
import { useState } from "react";
import { useAuth } from "@contexts/auth/AuthContext";
import { AnimatedDialog } from "@components/controls/AnimatedDialog";

interface LoginDialogProps {
  open: boolean;
  onClose?: () => void; // Optional callback if you want to close dialog manually
}

export default function LoginDialog({ open, onClose }: LoginDialogProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("aptotekinfo@gmail.com");
  const [password, setPassword] = useState("aptotek2025");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || "Failed to login");
    }
  };

  return (
    <AnimatedDialog
      title="Admin Login"
      open={open}
      onClose={onClose || (() => {})}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-md sm:gap-lg p-md w-auto"
      >
        <label className="flex flex-col gap-xs text-base font-semibold text-textSecondary">
          <span className="mb-xs">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-box px-lg py-md"
            autoComplete="username"
          />
        </label>
        <label className="flex flex-col gap-xs text-base font-semibold text-textSecondary">
          <span className="mb-xs">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-box px-lg py-md"
            autoComplete="current-password"
          />
        </label>
        <button type="submit" className="btn-normal">
          Login
        </button>
        {error && (
          <p className="text-error text-base text-center mt-xs">{error}</p>
        )}
      </form>
    </AnimatedDialog>
  );
}
