import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ShoppingCart from "./ShoppingCart";

interface SlideOutCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SlideOutCart({ isOpen, onClose }: SlideOutCartProps) {
  // Local state to control visibility for exit animation
  const [visible, setVisible] = useState(isOpen);

  // Keep local state in sync with parent isOpen
  useEffect(() => {
    if (isOpen) setVisible(true);
  }, [isOpen]);

  // Escape key handling
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

  // Trigger exit animation
  const handleClose = () => setVisible(false);

  // Called when exit animation completes
  const handleExitComplete = () => {
    if (!visible) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <AnimatePresence onExitComplete={handleExitComplete}>
        {visible && (
          <>
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black"
              style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={handleClose} // click outside closes cart
            />

            {/* Slide-out container */}
            <motion.div
              className="fixed top-0 right-0 h-full w-full md:w-1/3 flex flex-col p-lg overflow-y-auto bg-backgroundAlt shadow-xl rounded-l-lg"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Close button */}
              <button
                className="text-text absolute top-sm right-sm p-2 rounded hover:bg-surfaceAlt transition-colors"
                onClick={handleClose}
                aria-label="Close cart"
                type="button"
              >
                <X size={24} />
              </button>

              <h2 className="text-title font-bold mb-md text-text">
                Shopping Cart
              </h2>

              {/* Full ShoppingCart */}
              <ShoppingCart onProceedToCheckout={handleClose} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
