import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface DropdownProps {
  label: React.ReactNode;
  children: React.ReactNode;
  openInitially?: boolean;
  disabled?: boolean;
}

const AnimatedDropdownSurface: React.FC<DropdownProps> = ({
  label,
  children,
  openInitially = false,
  disabled = false,
}) => {
  const [open, setOpen] = useState(openInitially);
  const [overflow, setOverflow] = useState(openInitially);

  const contentRef = useRef<HTMLDivElement>(null);

  const rounding = open ? "rounded-t-md" : "rounded-md";

  return (
    <div className={`border border-border ${rounding} w-full max-w-full`}>
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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onAnimationStart={() => setOverflow(false)} // hide overflow only when collapsing
            onAnimationComplete={() => setOverflow(open)} // show overflow when open
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`${overflow ? "overflow-visible" : "overflow-hidden"}`}
          >
            <div className="p-4 flex flex-col gap-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedDropdownSurface;
