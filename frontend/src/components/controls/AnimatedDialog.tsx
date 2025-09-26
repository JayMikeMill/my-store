import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedDialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onEnter?: () => void; // optional Enter key handler
  className?: string; // custom dialog class
}

export const AnimatedDialog: React.FC<AnimatedDialogProps> = ({
  open,
  onClose,
  children,
  onEnter,
  className,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Disable background scroll when open
  useEffect(() => {
    if (open) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        open &&
        dialogRef.current &&
        !dialogRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onEnter) {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onKeyDown={handleKeyDown}
        >
          {/* Background overlay */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Dialog content */}
          <motion.div
            ref={dialogRef}
            className={`dialog-box relative z-10 ${className ?? ""}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
