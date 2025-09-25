import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/auth/AuthContext";

interface SiteMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SiteMenu({ isOpen, onClose }: SiteMenuProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Local state controls visibility for exit animation
  const [visible, setVisible] = useState(isOpen);

  // Sync local state when parent opens menu
  useEffect(() => {
    if (isOpen) setVisible(true);
  }, [isOpen]);

  // Escape key closes menu
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") handleClose();
  }, []);

  useEffect(() => {
    if (visible) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [visible, handleKeyDown]);

  const handleClose = () => setVisible(false);

  // After exit animation completes
  const handleExitComplete = () => {
    if (!visible) onClose();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={handleClose} // click outside closes menu
          />

          {/* Slide-out menu */}
          <motion.div
            className="relative bg-surface w-2/3 max-w-xs h-full shadow-lg p-lg flex flex-col gap-4"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Close button */}
            <button
              className="absolute text-text top-sm right-sm p-2 rounded hover:bg-surfaceAlt transition-colors z-10"
              onClick={handleClose}
              aria-label="Close menu"
              type="button"
            >
              <X size={24} />
            </button>

            {/* Menu links */}
            <button
              className="text-lg font-medium text-text hover:underline text-left"
              onClick={() => handleNavigate("/")}
            >
              Home
            </button>
            <button
              className="text-lg font-medium text-text hover:underline text-left"
              onClick={() => handleNavigate("/about")}
            >
              About
            </button>
            {user?.role === "admin" && (
              <button
                className="text-lg font-medium text-text hover:underline text-left"
                onClick={() => handleNavigate("/admin")}
              >
                Admin Dashboard
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
