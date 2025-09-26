import React, { useEffect, useState } from "react";

import { XButton } from "@components/controls/CustomControls";
import { AnimatedDropdownBox } from "@components/controls/AnimatedDropdownBox";

import type {
  Product,
  ProductTag,
  ProductTagPreset,
} from "@shared/types/Product";

import { ProductTagDialog } from "./ProductTagDialog";

import { useApi } from "@api/useApi";
import AnimatedDropdownSurface from "@components/controls/AnimatedDropdownSurface";

interface TagPresetsDropdownProps {
  onSelectPreset: (preset: ProductTagPreset) => void; // notify main component
}

const TagPresetsDropdown: React.FC<TagPresetsDropdownProps> = ({
  onSelectPreset,
}) => {
  const { productTagsPresets } = useApi();
  const [presets, setPresets] = useState<ProductTagPreset[]>([]);
  const [creating, setCreating] = useState(false);

  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#000000");

  // Load presets
  useEffect(() => {
    (async () => {
      try {
        const res = await productTagsPresets.getAll();
        setPresets(res.data);
      } catch (err) {
        console.error("Error loading tag presets", err);
      }
    })();
  }, []);

  // Delete preset
  const deletePreset = async (id?: string) => {
    if (!id) return;
    try {
      await productTagsPresets.delete(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting tag preset", err);
    }
  };

  // Create preset
  const createPreset = async () => {
    if (!newTagName.trim()) return;
    try {
      const created = await productTagsPresets.create({
        name: newTagName.trim(),
        color: newTagColor,
      });
      setPresets((prev) => [...prev, created]);
      setCreating(false);
      setNewTagName("");
      setNewTagColor("#ffffffff");
    } catch (err) {
      console.error("Error creating tag preset", err);
    }
  };

  const handleSelect = (preset: ProductTagPreset) => {
    onSelectPreset(preset);
  };

  // Map presets to AnimatedDropdownBox items
  const dropdownItems = presets.map((p) => ({
    value: p,
    render: (preset: ProductTagPreset) => (
      <div className="flex gap-2 items-center w-auto cursor-pointer hover:bg-backgroundAlt z-100">
        {/* Colored circle */}
        <div
          className="w-4 h-4 rounded-full"
          style={{
            backgroundColor: preset.color ?? "#ccc",
          }}
        />
        <span className="flex-1 text-text">{preset.name}</span>
        <XButton
          onClick={(e) => {
            e.stopPropagation();
            deletePreset(p.id);
          }}
        />
      </div>
    ),
    onClick: handleSelect,
  }));

  return (
    <div className="relative flex items-center gap-2">
      {/* Dropdown */}
      <AnimatedDropdownBox
        items={dropdownItems}
        headerText="Select Tag..."
        noItemsText="No tag presets."
        className="w-full"
      />

      {/* Create Tag Button */}
      <button
        type="button"
        className="btn-primary px-3 py-1 whitespace-nowrap"
        onClick={() => setCreating(true)}
      >
        Create Tag
      </button>

      {/* Create Tag Dialog */}

      <ProductTagDialog
        open={creating}
        name={newTagName}
        setName={setNewTagName}
        color={newTagColor}
        setColor={setNewTagColor}
        onClose={() => setCreating(false)}
        onSave={createPreset}
      />
    </div>
  );
};

/* -------------------- 3. ProductTagsEditor Component -------------------- */
interface ProductTagsEditorProps {
  product: Product;
  setProduct: React.Dispatch<React.SetStateAction<Product>>;
}

const ProductTagsEditor: React.FC<ProductTagsEditorProps> = ({
  product,
  setProduct,
}) => {
  const [localTags, setLocalTags] = useState<ProductTag[]>(product.tags || []);

  // Sync local tags with product
  useEffect(() => setLocalTags(product.tags || []), [product.tags]);
  useEffect(
    () => setProduct((prev) => ({ ...prev, tags: localTags })),
    [localTags]
  );

  const addTag = (preset: ProductTagPreset) => {
    if (!localTags.some((t) => t.name === preset.name)) {
      setLocalTags((prev) => [...prev, preset]);
    }
  };

  const removeTag = (i: number) =>
    setLocalTags((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <AnimatedDropdownSurface
      label={
        <span className="text-lg font-semibold text-text">Product Tags</span>
      }
    >
      <div className="flex flex-col px-2">
        <TagPresetsDropdown onSelectPreset={addTag} />

        <div className="flex flex-wrap gap-2 mt-2">
          {localTags.map((tag, i) => (
            <div
              key={i}
              className="flex items-center gap-2 py-1.5 pr-3 rounded-full items-middle justify-middle"
              style={{ backgroundColor: tag.color || "#ccc", color: "#fff" }}
            >
              <span className="text-center ml-4">{tag.name}YOOO</span>
              <XButton
                className="w-5 h-5 justify-left"
                onClick={() => removeTag(i)}
              />
            </div>
          ))}
        </div>
      </div>
    </AnimatedDropdownSurface>
  );
};

export default ProductTagsEditor;
