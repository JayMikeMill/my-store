import { useAuth } from "@contexts/auth/AuthContext";
import { useNavigate } from "react-router-dom";

interface SiteMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SiteMenu({ isOpen, onClose }: SiteMenuProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-40 flex">
      <div className="bg-surface w-2/3 max-w-xs h-full shadow-lg p-lg flex flex-col gap-4">
        <a
          href="/"
          className="text-lg font-medium text-text hover:underline"
          onClick={() => onClose()}
        >
          Home
        </a>
        <a
          href="/about"
          className="text-lg font-medium text-text hover:underline"
          onClick={() => onClose()}
        >
          About
        </a>
        {user?.role === "admin" && (
          <a
            href="/admin"
            className="text-lg font-medium text-text hover:underline"
            onClick={() => onClose()}
          >
            Admin Dashboard
          </a>
        )}
      </div>
    </div>
  );
}
