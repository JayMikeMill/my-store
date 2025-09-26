// src/components/ProductDialog.tsx
import React, { useState, useEffect } from "react";
import ImageListEditor from "@components/editors/ImageListEditor";
import ProductOptionsEditor from "./ProductOptionsEditor";
import ProductStockEditor from "./ProductStockEditor";
import ProductTagsEditor from "./ProductTagsEditor";
import { AnimatedDialog } from "@components/controls/AnimatedDialog";
import { XButton } from "@components/controls/CustomControls";

import type { Product, ProductImageSet } from "@shared/types/Product";
import { useApi } from "@api/useApi";

const emptyProduct: Product = {
  id: undefined,
  name: "",
  price: 0,
  description: "",
  stock: 0,
  options: [],
  variants: [],
  tags: [],
  images: [],
  discount: "",
};

interface ProductDialogProps {
  product: Product | null;
  open: boolean;
  onSave: () => void;
  onCancel?: () => void;
}

export const ProductEditorDialog: React.FC<ProductDialogProps> = ({
  product,
  open,
  onSave,
  onCancel,
}) => {
  const [localProduct, setLocalProduct] = useState<Product>(emptyProduct);

  const [isAdding, setIsAdding] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState<"%" | "$">("%");

  const { products, uploadImage } = useApi();

  // Sync local product when dialog opens
  useEffect(() => {
    if (!open) {
      setLocalProduct(emptyProduct);
      setIsAdding(false);
      return;
    }

    if (!product) {
      setLocalProduct(emptyProduct);
      setIsAdding(true);
      return;
    }

    setIsAdding(false);
    setLocalProduct(product);

    if (product.discount) {
      if (product.discount.includes("%")) {
        setDiscountType("%");
        setDiscountValue(parseFloat(product.discount.replace("%", "")));
      } else {
        setDiscountType("$");
        setDiscountValue(parseFloat(product.discount));
      }
    } else {
      setDiscountType("%");
      setDiscountValue(0);
    }
  }, [open, product]);

  const handleCancel = () => {
    setLocalProduct(emptyProduct);
    setIsAdding(false);
    setDiscountValue(0);
    setDiscountType("%");
    onCancel?.();
  };

  const handleDelete = async () => {
    if (!localProduct.id) return onSave();

    const confirmed = window.confirm(
      `Are you sure you want to delete ${localProduct.name}?`
    );
    if (!confirmed) return;

    await products.delete(localProduct.id);
    onSave();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!localProduct.images || localProduct.images.length === 0) {
      alert("At least one image is required");
      return;
    }

    if (isProcessingImages) {
      alert("Please wait for images to finish processing.");
      return;
    }

    setIsSavingProduct(true);

    try {
      const discountString =
        discountValue > 0
          ? discountType === "%"
            ? `${discountValue}%`
            : `${discountValue}`
          : "";

      const uploadedImages: ProductImageSet[] = [];

      for (const img of localProduct.images) {
        if (img.main.startsWith("blob:")) {
          const blobM = await fetch(img.main).then((r) => r.blob());
          const blobP = await fetch(img.preview).then((r) => r.blob());
          const blobT = await fetch(img.thumbnail).then((r) => r.blob());

          const uploadedMain = await uploadImage(blobM, `product_main`);
          const uploadedPreview = await uploadImage(blobP, `product_preview`);
          const uploadedThumbnail = await uploadImage(blobT, `product_thumb`);

          uploadedImages.push({
            main: uploadedMain.url,
            preview: uploadedPreview.url,
            thumbnail: uploadedThumbnail.url,
          });
        } else {
          uploadedImages.push(img);
        }
      }

      const productToSave: Product = {
        ...localProduct,
        discount: discountString,
        images: uploadedImages,
      };

      if (localProduct.id) {
        await products.update({
          ...productToSave,
          id: localProduct.id as string,
        });
      } else {
        await products.create(productToSave);
      }

      setIsSavingProduct(false);
      onSave();
    } catch (err: any) {
      setIsSavingProduct(false);
      alert(err.message || "Error saving product");
    }
  };

  console.log("Rendering ProductEditorDialog", {
    open,
    isAdding,
    localProduct,
  });
  if (!isAdding && !localProduct.id) return null;

  return (
    <AnimatedDialog
      open={open}
      onClose={handleCancel}
      className="dialog-box rounded-none sm:rounded-2xl pl-2 w-full h-full sm:h-[90vh] sm:max-w-4xl flex flex-col overflow-hidden px-2 sm:px-8"
    >
      <div className="flex items-center justify-between pt-4 pb-2 flex-shrink-0 pl-4">
        <h2 className="text-2xl font-bold text-text text-left  flex-1">
          {isAdding ? "Add Product" : "Edit Product"}
        </h2>
        <XButton
          className="w-8 h-8"
          onClick={onCancel ?? (() => {})}
          aria-label="Close dialog"
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-1 overflow-hidden border-t"
      >
        <div className="flex flex-1 flex-col sm:flex-row sm:gap-md overflow-hidden min-h-0">
          {/* Main Editor */}
          <div className="flex-1 flex flex-col gap-md px-2 overflow-y-auto py-4 sm:border sm:rounded-lg sm:mt-4">
            {/* Name */}
            <label className="flex flex-col gap-1 text-sm font-semibold text-textSecondary">
              Name
              <input
                type="text"
                placeholder="Product Name"
                value={localProduct.name}
                onChange={(e) =>
                  setLocalProduct((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                className="input-box px-md py-1 h-8 text-text"
              />
            </label>

            {/* Price & Discount */}
            <div className="flex gap-md items-end">
              <label className="flex-1 flex flex-col gap-1 text-sm font-semibold text-textSecondary">
                Price
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-textSecondary">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    onFocus={(e) => e.target.select()}
                    value={localProduct.price}
                    onChange={(e) =>
                      setLocalProduct((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value),
                      }))
                    }
                    required
                    step="0.01"
                    className="input-box pl-6 pr-md py-1 h-8 w-full"
                  />
                </div>
              </label>

              <div className="flex-1 flex gap-1 items-end">
                <label className="flex-1 flex flex-col gap-1 text-sm font-semibold text-textSecondary">
                  Discount
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-textSecondary">
                      {discountType}
                    </span>
                    <input
                      type="number"
                      min={0}
                      onFocus={(e) => e.target.select()}
                      className="input-box pl-6 pr-md py-1 h-8 w-full"
                      value={discountValue}
                      onChange={(e) =>
                        setDiscountValue(parseFloat(e.target.value))
                      }
                      step="0.01"
                    />
                  </div>
                </label>
                <select
                  className="input-box ml-1 px-2 py-1 h-8"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as "%" | "$")}
                >
                  <option value="%" className="text-center">
                    %
                  </option>
                  <option value="$" className="text-center">
                    $
                  </option>
                </select>
              </div>
            </div>

            {/* Description */}
            <label className="pb-0.5 flex flex-col gap-1 text-sm font-semibold text-textSecondary">
              Description
              <textarea
                value={localProduct.description}
                placeholder="Product Description"
                onChange={(e) =>
                  setLocalProduct((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
                className="input-box px-md py-1 h-40 resize-none"
              />
            </label>

            {/* Editors */}
            <div className="flex flex-col gap-4">
              <ProductTagsEditor
                product={localProduct}
                setProduct={setLocalProduct}
                openInitially={true}
              />
              <ProductOptionsEditor
                product={localProduct}
                setProduct={setLocalProduct}
                openInitially={true}
              />
              <ProductStockEditor
                product={localProduct}
                setProduct={setLocalProduct}
                openInitially={true}
              />
            </div>

            <button
              className="btn-normal h-12"
              type="button"
              onClick={handleDelete}
            >
              Delete Product
            </button>
          </div>

          {/* Image Editor */}
          <div className=" flex flex-col flex-shrink-0  sm:w-1/3 sm:border-t sm:border sm:mt-4">
            <span className="text-xl font-semibold text-text text-center rounded-t-sm py-2 hidden hidden sm:block">
              Product Images
            </span>
            <ImageListEditor
              className="sm:border-0"
              images={localProduct.images ?? []}
              onImagesChange={(imgs) =>
                setLocalProduct((prev) => ({ ...prev, images: imgs }))
              }
              setIsProcessingImages={setIsProcessingImages}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="w-full flex flex-row gap-2 px-4 sm:px-40 items-center py-4 border-border flex-shrink-0">
          <button
            className="btn-cancel w-full h-12"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-normal w-full h-12 whitespace-nowrap"
            disabled={isProcessingImages || isSavingProduct}
          >
            {isSavingProduct
              ? "Saving..."
              : isProcessingImages
                ? "Processing Images..."
                : localProduct.id
                  ? "Save Changes"
                  : "Add Product"}
          </button>
        </div>
      </form>
    </AnimatedDialog>
  );
};
