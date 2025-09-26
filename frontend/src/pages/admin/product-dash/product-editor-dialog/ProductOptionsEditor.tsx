import React, { useEffect, useState } from "react";
import type { Product, ProductOption } from "@shared/types/Product";
import AnimatedDropdownSurface from "@components/controls/AnimatedDropdownSurface";
import OptionsPresetDropdown from "@pages/admin/product-dash/product-editor-dialog/ProductOptionsPresetsDropdown";
import { useApi } from "@api/useApi";
import { XButton } from "@components/controls/CustomControls";

interface ProductOptionsEditorProps {
  product: Product;
  setProduct: React.Dispatch<React.SetStateAction<Product>>;
}

const ProductOptionsEditor: React.FC<ProductOptionsEditorProps> = ({
  product,
  setProduct,
}) => {
  const { productOptionsPresets } = useApi();
  const [localOptions, setLocalOptions] = useState<ProductOption[]>(
    product.options || []
  );
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // <-- trigger refresh

  // Sync local options with product
  useEffect(() => {
    setLocalOptions(product.options || []);
  }, [product.options]);

  // Push changes to product
  useEffect(() => {
    setProduct((prev) => ({
      ...prev,
      options: localOptions,
    }));
  }, [localOptions, setProduct]);

  // Option management
  const addOption = () =>
    setLocalOptions((prev) => [...prev, { name: "", values: "" }]);
  const removeOption = (i: number) =>
    setLocalOptions((prev) => prev.filter((_, idx) => idx !== i));
  const updateOptionName = (i: number, name: string) =>
    setLocalOptions((prev) =>
      prev.map((opt, idx) => (idx === i ? { ...opt, name } : opt))
    );
  const updateOptionValues = (i: number, values: string) =>
    setLocalOptions((prev) =>
      prev.map((opt, idx) => (idx === i ? { ...opt, values } : opt))
    );

  // Save preset
  const handleSavePreset = async () => {
    if (localOptions.length === 0) {
      alert("No options to save as preset.");
      return;
    }
    const name = prompt("Enter preset name:");
    if (!name) return;

    setSaving(true);
    try {
      await productOptionsPresets.create({ name, options: localOptions });
      alert("Preset saved successfully");
      setRefreshKey((prev) => prev + 1); // <-- refresh dropdown
    } catch (err: any) {
      alert("Error saving preset: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatedDropdownSurface
      label={
        <span className="text-lg font-semibold text-text">Product Options</span>
      }
    >
      <div className="flex flex-col gap-4 p-4">
        {/* Preset Dropdown */}
        <OptionsPresetDropdown
          localOptions={localOptions}
          setLocalOptions={setLocalOptions}
          refreshKey={refreshKey}
        />

        {/* Options List */}
        {localOptions.map((opt, i) => (
          <div
            key={i}
            className="p-2 flex flex-col gap-2 w-full max-w-full border-b border-border pb-2"
          >
            <div className="flex flex-wrap gap-2 items-center w-full">
              <input
                type="text"
                placeholder="Option Name"
                value={opt.name}
                onChange={(e) => updateOptionName(i, e.target.value)}
                className="input-box flex-1 min-w-0 px-2 py-1"
              />
              <XButton onClick={() => removeOption(i)} />
            </div>
            <div className="flex flex-wrap gap-2 items-center w-full">
              <input
                type="text"
                placeholder="Values (comma-separated)"
                value={opt.values}
                onChange={(e) => updateOptionValues(i, e.target.value)}
                className="input-box flex-1 min-w-0 px-2 py-1"
              />
            </div>
          </div>
        ))}

        {/* Bottom Buttons */}
        <div className="flex flex-wrap gap-2 w-full mt-auto">
          <button
            type="button"
            className="btn-primary px-3 py-2 flex-shrink-0"
            onClick={addOption}
          >
            Add Option
          </button>
          <button
            type="button"
            className="btn-secondary px-3 py-2 flex-shrink-0 ml-auto"
            onClick={handleSavePreset}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Preset"}
          </button>
        </div>
      </div>
    </AnimatedDropdownSurface>
  );
};

export default ProductOptionsEditor;
