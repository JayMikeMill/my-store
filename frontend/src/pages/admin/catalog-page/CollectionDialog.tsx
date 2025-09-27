// src/components/CatalogDialog.tsx
import { useState, useEffect, type SetStateAction } from "react";

// UI Components
import { AnimatedDialog } from "@components/controls/AnimatedDialog";
import { XButton } from "@components/controls/CustomControls";
import type { Collection, Category } from "@shared/types/Catalog";

import { useApi } from "@api/useApi";
import e from "cors";
import ImageEditor from "./CollectionImagesEditor";
import CollectionImagesEditor from "./CollectionImagesEditor";

// Types
export interface CollectionImageSet {
  banner: string;
  preview: string; // used for both preview & thumbnail
}

interface CatalogDialogProps<T extends Collection> {
  open: boolean;
  item: T | null;
  onSave: () => void;
  onCancel?: () => void;
  apiKey: "categories" | "collections";
  typeLabel: "Category" | "Collection";
}

export function CatalogDialog<T extends Collection>({
  open,
  item,
  onSave,
  onCancel,
  apiKey,
  typeLabel: type,
}: CatalogDialogProps<T>) {
  const emptyItem: T = {
    id: undefined,
    name: "",
    slug: "",
    description: "",
    seo: {},
    images: { banner: "", preview: "" },
  } as T;

  const [localItem, setLocalItem] = useState<T>(emptyItem);
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const api = useApi()[apiKey];

  useEffect(() => {
    if (!open) {
      setLocalItem(emptyItem);
      setIsAdding(false);
      return;
    }
    if (!item) {
      setLocalItem(emptyItem);
      setIsAdding(true);
      return;
    }
    setLocalItem(item);
    setIsAdding(false);
  }, [open, item]);

  const clearItem = () => {
    setLocalItem(emptyItem);
    setIsAdding(false);
  };
  const handleCancel = () => {
    clearItem();
    onCancel?.();
  };

  const saveItem: () => boolean = () => {
    try {
      if (isAdding) {
        api.create(localItem);
      } else if (localItem.id) {
        api.update({ ...localItem, id: localItem.id });
      } else {
        throw new Error("Item ID is missing for update.");
      }
      return true;
    } catch (error) {
      console.error("Error saving item:", error);
      return false;
    }
  };

  const handleSave = () => {
    if (saveItem()) {
      clearItem();
      onSave();
    }
  };

  return (
    <AnimatedDialog
      title={isAdding ? `Add ${type}` : `Edit ${type}`}
      open={open}
      onClose={handleCancel}
      className="dialog-box rounded-none sm:rounded-2xl h-auto max-w-5xl max-h-[90vh]
      flex flex-col overflow-hidden py-4 px-4 sm:px-8"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="flex flex-col gap-4 flex-1 overflow-y-auto py-4"
      >
        <div className="flex flex-row gap-md w-auto">
          {/* Name */}
          <label className="flex flex-col gap-1 text-sm font-semibold text-textSecondary">
            {type} Name
            <input
              type="text"
              placeholder={`${type} Name`}
              value={localItem.name}
              onChange={(e) =>
                setLocalItem((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              className="input-box px-2 py-1 h-10"
            />
          </label>

          {/* Slug */}
          <label className="flex flex-col gap-1 text-sm font-semibold text-textSecondary">
            Slug
            <input
              type="text"
              placeholder="URL Slug"
              value={localItem.slug}
              onChange={(e) =>
                setLocalItem((prev) => ({ ...prev, slug: e.target.value }))
              }
              required
              className="input-box px-2 py-1 h-10"
            />
          </label>
        </div>

        {/* SEO */}
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-sm font-semibold text-textSecondary">
            SEO Title
            <input
              type="text"
              placeholder="SEO Title"
              value={localItem.seo?.title ?? ""}
              onChange={(e) =>
                setLocalItem((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, title: e.target.value },
                }))
              }
              className="input-box px-2 py-1 h-10"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold text-textSecondary">
            Keywords (comma-separated)
            <input
              type="text"
              placeholder="keyword1, keyword2"
              value={localItem.seo?.keywords?.join(", ") ?? ""}
              onChange={(e) =>
                setLocalItem((prev) => ({
                  ...prev,
                  seo: {
                    ...prev.seo,
                    keywords: e.target.value.split(",").map((k) => k.trim()),
                  },
                }))
              }
              className="input-box px-2 py-1 h-10"
            />
          </label>
        </div>

        {/* Description */}
        <label className="flex flex-col gap-1 text-sm font-semibold text-textSecondary">
          Description
          <textarea
            placeholder="Description"
            value={localItem.description ?? ""}
            onChange={(e) =>
              setLocalItem((prev) => ({ ...prev, description: e.target.value }))
            }
            className="input-box px-2 py-1 h-24 resize-none"
          />
        </label>

        {/* Images */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-textSecondary">
            Images
          </span>

          <CollectionImagesEditor
            className="w-full, h-[100px]"
            images={localItem.images || null}
            onImagesChange={(images) =>
              setLocalItem((prev) => ({ ...prev, images }))
            }
            setIsProcessingImages={setIsProcessingImages}
          />
        </div>

        {/* Footer Buttons */}
        <div className="w-full flex flex-row gap-2 px-0 sm:px-0 items-center py-4 border-t flex-shrink-0">
          <button
            type="button"
            className="btn-cancel w-full h-12"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-normal w-full h-12"
            disabled={isProcessingImages}
          >
            {isProcessingImages
              ? "Processing..."
              : isAdding
                ? `Add ${type}`
                : `Save Changes`}
          </button>
        </div>
      </form>
    </AnimatedDialog>
  );
}

// Convenience wrappers
export const CategoryDialog = (
  props: Omit<CatalogDialogProps<Category>, "type">
) => <CatalogDialog {...props} typeLabel="Category" />;

export const CollectionDialog = (
  props: Omit<CatalogDialogProps<Collection>, "type">
) => <CatalogDialog {...props} typeLabel="Collection" />;
