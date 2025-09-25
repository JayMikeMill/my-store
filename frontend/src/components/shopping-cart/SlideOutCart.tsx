import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import ShoppingCart from "./ShoppingCart";

interface SlideOutCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SlideOutCart({ isOpen, onClose }: SlideOutCartProps) {
  const [mounted, setMounted] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      const timeout = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, handleKeyDown]);

  if (!mounted && !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart"
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide-out container */}
      <div
        className={`fixed top-0 right-0 h-full transform transition-transform duration-300 ease-in-out
				w-full md:w-1/3 flex flex-col p-lg overflow-y-auto
				bg-backgroundAlt shadow-xl rounded-l-lg ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          className="text-text absolute top-sm right-sm p-2 rounded hover:bg-surfaceAlt transition-colors"
          onClick={onClose}
          aria-label="Close cart"
          type="button"
        >
          <X size={24} />
        </button>

        <h2 className="text-title font-bold mb-md text-text">Shopping Cart</h2>

        {/* Full ShoppingCart component handles items, totals, buttons */}
        <ShoppingCart onProceedToCheckout={onClose} />
      </div>
    </div>
  );
}
