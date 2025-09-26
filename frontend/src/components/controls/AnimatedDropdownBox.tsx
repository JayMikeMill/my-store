import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownItem<T> {
  value: T;
  render: (item: T) => ReactNode;
  onClick?: (item: T) => void;
}

interface AnimatedDropdownBoxProps<T> {
  items: DropdownItem<T>[];
  headerText?: string;
  noItemsText?: string;
  className?: string;
  menuClassName?: string;
}

export function AnimatedDropdownBox<T>({
  items,
  headerText = "Select...",
  noItemsText = "No items",
  className,
  menuClassName,
}: AnimatedDropdownBoxProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = () => setOpen((prev) => !prev);

  return (
    <div ref={ref} className={`relative w-full ${className ?? ""}`}>
      {/* Dropdown button */}
      {
        <button
          type="button"
          className="input-box px-2 py-1 w-full text-left flex justify-between items-center"
          onClick={toggle}
        >
          {headerText}
          <span>{open ? "▲" : "▼"}</span>
        </button>
      }
      {/* Animated Dropdown menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-10 mt-1 w-full bg-background border border-border rounded shadow-md max-h-60 overflow-y-auto ${menuClassName ?? ""}`}
          >
            {items.length === 0 ? (
              <div className="px-2 py-1 text-text">{noItemsText}</div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={idx}
                  className="px-2 py-1 hover:bg-backgroundAlt cursor-pointer"
                  onClick={() => {
                    item.onClick?.(item.value);
                    setOpen(false);
                  }}
                >
                  {item.render(item.value)}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
