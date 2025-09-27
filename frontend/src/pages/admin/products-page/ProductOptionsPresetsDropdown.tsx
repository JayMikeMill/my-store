import React, { useEffect, useState } from "react";
import type {
  ProductOption,
  ProductOptionsPreset,
} from "@shared/types/Product";
import { useApi } from "@api/useApi";
import { XButton } from "@components/controls/CustomControls";
import { AnimatedDropdownBox } from "@components/controls/AnimatedDropdownBox"; // adjust path

interface OptionsPresetDropdownProps {
  localOptions: ProductOption[];
  setLocalOptions: React.Dispatch<React.SetStateAction<ProductOption[]>>;
  refreshKey?: any; // changes whenever a new preset is saved
}

const OptionsPresetDropdown: React.FC<OptionsPresetDropdownProps> = ({
  setLocalOptions,
  refreshKey,
}) => {
  const { productOptionsPresets } = useApi();

  const [presets, setPresets] = useState<ProductOptionsPreset[]>([]);

  // Load presets
  useEffect(() => {
    let mounted = true;
    const loadPresets = async () => {
      try {
        const { data } = await productOptionsPresets.getAll();
        const arr = Array.isArray(data)
          ? data
          : Array.isArray((data as { data?: ProductOptionsPreset[] })?.data)
            ? (data as { data: ProductOptionsPreset[] }).data
            : [];
        if (mounted) setPresets(arr as ProductOptionsPreset[]);
      } catch (err: any) {
        if (mounted) alert("Failed to load presets: " + err.message);
      }
    };
    loadPresets();
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  const handleApplyPreset = (preset: ProductOptionsPreset) => {
    if (!preset.options || preset.options.length === 0) return;
    setLocalOptions(preset.options);
  };

  const handleDeletePreset = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this preset?")) return;
    try {
      await productOptionsPresets.delete(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert("Failed to delete preset: " + err.message);
    }
  };

  // Map presets to dropdown items
  const dropdownItems = presets.map((preset) => ({
    value: preset,
    render: (p: ProductOptionsPreset) => (
      <div className="flex justify-between items-center gap-2">
        <span className="flex-1 text-text">{p.name}</span>
        <XButton
          onClick={(e) => {
            e.stopPropagation();
            handleDeletePreset(p.id);
          }}
        />
      </div>
    ),
    onClick: handleApplyPreset,
  }));

  return (
    <AnimatedDropdownBox
      items={dropdownItems}
      headerText="Select Preset..."
      noItemsText="No option presets."
      className="mb-2"
    />
  );
};

export default OptionsPresetDropdown;
