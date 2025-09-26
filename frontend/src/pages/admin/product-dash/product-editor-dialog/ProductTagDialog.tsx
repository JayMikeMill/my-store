import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedDialog } from "@components/controls/AnimatedDialog";

interface ProductTagDialogProps {
  name: string;
  setName: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  open: boolean; // parent controls visibility
  onClose: () => void;
  onSave: () => void;
}

export const ProductTagDialog: React.FC<ProductTagDialogProps> = ({
  name,
  setName,
  color,
  setColor,
  open,
  onClose,
  onSave,
}) => {
  return (
    <AnimatedDialog
      open={open}
      onClose={onClose}
      onEnter={onSave} // handle Enter key
      className="py-4 px-6 text-text rounded-2xl shadow-xl w-80 flex flex-col"
    >
      <h3 className="text-lg font-semibold text-center pb-4">
        Create Tag Preset
      </h3>

      <div className="flex gap-2 mb-4">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-16 h-10 border border-border rounded cursor-pointer"
        />
        <input
          type="text"
          placeholder="Tag Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-box px-2 py-1 w-full"
        />
      </div>

      <div className="flex gap-2 justify-center">
        <button type="button" className="btn-plain w-1/2" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-success w-1/2" onClick={onSave}>
          Save
        </button>
      </div>
    </AnimatedDialog>
  );
};
