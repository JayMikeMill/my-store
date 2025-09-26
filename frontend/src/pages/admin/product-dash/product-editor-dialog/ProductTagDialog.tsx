import React, { useState } from "react";
import { AnimatedDialog } from "@components/controls/AnimatedDialog";
import { HexColorPicker } from "react-colorful";

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
  color = "#aabbcc",
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
        <ColorPickerButton
          color={color}
          onChange={setColor}
          className="w-12 h-8 rounded-md border border-gray-400 shadow-sm"
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
        <button type="button" className="btn-cancel w-1/2" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-normal w-1/2" onClick={onSave}>
          Save
        </button>
      </div>
    </AnimatedDialog>
  );
};

interface ColorPickerButtonProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPickerButton({
  color,
  onChange,
  className,
}: ColorPickerButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* The button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        style={{ backgroundColor: color }}
      />

      {/* Dialog */}
      <AnimatedDialog
        open={open}
        onClose={() => setOpen(false)}
        className="p-2"
      >
        <HexColorPicker color={color} onChange={onChange} />
      </AnimatedDialog>
    </>
  );
}
