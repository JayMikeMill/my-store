// src/components/Dropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownProps {
  label: React.ReactNode;
  children: React.ReactNode;
  openInitially?: boolean;
  disabled?: boolean;
}

const AnimatedDropdown: React.FC<DropdownProps> = ({
  label,
  children,
  openInitially = false,
  disabled = false,
}) => {
  const [open, setOpen] = useState(openInitially);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    if (disabled) {
      setOpen(false); // force close when disabled
    }
  }, [disabled]);

  useEffect(() => {
    if (!contentRef.current) return;

    if (open) {
      setHeight(`${contentRef.current.scrollHeight}px`);
      const timeout = setTimeout(() => setHeight("auto"), 300);
      return () => clearTimeout(timeout);
    } else {
      if (height === "auto") {
        setHeight(`${contentRef.current.scrollHeight}px`);
        requestAnimationFrame(() => setHeight("0px"));
      } else {
        setHeight("0px");
      }
    }
  }, [open]);

  const rounding = open ? "rounded-t-md" : "rounded-md";

  return (
    <div className={`border  border-border ${rounding} w-full max-w-full`}>
      <button
        type="button"
        className={`flex justify-between items-center ${rounding} w-full px-4 py-2 bg-surfaceAlt text-text font-semibold ${
          disabled ? "cursor-not-allowed" : ""
        }`}
        onClick={() => !disabled && setOpen((prev) => !prev)}
      >
        {label}
        {!disabled && <span>{open ? "▲" : "▼"}</span>}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
            ref={contentRef}
          >
            <div className="p-4 flex flex-col gap-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedDropdown;
