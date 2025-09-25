// src/components/ProductDialog.tsx
import { useState, useEffect } from "react";
import ImageListEditor from "@components/editors/ImageListEditor";
import ProductOptionsEditor from "./ProductOptionsEditor";
import ProductStockEditor from "./ProductStockEditor";

import type {
  Product,
  ProductTag,
  ProductImageSet,
} from "@shared/types/Product";
import { useApi } from "@api/useApi";

interface ProductDialogProps {
  product: Product | null; // If null, we are adding a new product
  onClose: () => void; // Callback to close dialog
}

export default function ProductEditorDialog({
  product,
  onClose,
}: ProductDialogProps) {
  const [localProduct, setLocalProduct] = useState<Product>(
    product || {
      name: "",
      price: 0,
      description: "",
      stock: 0,
      options: [],
      variants: [],
      tags: [],
      images: [],
    }
  );

  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState<"%" | "$">("%");
  const [tagString, setTagString] = useState("");

  const { products, uploadImage } = useApi();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (!product) return;

    setLocalProduct(product);
    setTagString(product.tags?.map((t) => t.name).join(", ") || "");

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
  }, [product]);

  const handleDelete = async () => {
    if (!product) return onClose();
    if (!product.id) return alert("Product ID is missing.");

    const confirmed = window.confirm(
      `Are you sure you want to delete ${product.name}?`
    );
    if (!confirmed) return;

    await products.delete(product.id);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const tagsArray: ProductTag[] = tagString
        .split(",")
        .map((tag) => ({ name: tag.trim() }))
        .filter((tag) => tag.name !== "");

      const discountString =
        discountValue > 0
          ? discountType === "%"
            ? `${discountValue}%`
            : `${discountValue}`
          : "";

      // Require at least one image
      if (!localProduct.images || localProduct.images.length === 0) {
        alert("At least one image is required");
        return;
      }

      if (isProcessingImages) {
        alert("Please wait for images to finish processing.");
        return;
      }

      setIsSavingProduct(true);

      // Upload images
      const uploadedImages: ProductImageSet[] = [];
      for (const img of localProduct.images) {
        const isBlob = img.main.startsWith("blob:");
        if (isBlob) {
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
          // Already a URL
          uploadedImages.push(img);
        }
      }

      const productToSave: Product = {
        ...localProduct,
        tags: tagsArray,
        discount: discountString,
        images: uploadedImages,
      };

      console.log("saving product", productToSave);

      if (product?.id) {
        await products.update({ ...productToSave, id: product.id });
      } else {
        await products.create(productToSave);
      }

      setIsSavingProduct(false);
      onClose();
    } catch (err: any) {
      setIsSavingProduct(false);
      alert(err.message || "Error saving product");
    }
  };

  return (
    <div className="fixed inset-0 bg-overlay flex justify-center items-center z-50">
      <div className="dialog-box w-full h-full sm:h-[90vh] sm:max-w-4xl flex flex-col overflow-hidden px-2 sm:px-8">
        {/* Header */}
        <div className="flex items-center justify-between pt-4 pb-2 flex-shrink-0">
          <h2 className="text-2xl font-bold text-text text-center flex-1">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button
            className="ml-2 text-3xl font-bold text-textSecondary hover:text-danger transition px-2"
            onClick={onClose}
            aria-label="Close dialog"
            type="button"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden gap-lg"
        >
          <div className="flex flex-1 flex-col md:flex-row gap-md overflow-hidden min-h-0">
            {/* Left/Top: Scrollable form fields + options */}
            <div className="px-1 flex-1 flex flex-col gap-md overflow-y-auto">
              {/* Name, price, discount, tags, description */}
              <label className="flex flex-col gap-1 text-sm font-semibold text-textSecondary">
                Name
                <input
                  type="text"
                  value={localProduct.name}
                  onChange={(e) =>
                    setLocalProduct((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  className="input-box px-md py-1 h-8 text-text"
                />
              </label>

              {/* Price + Discount */}
              <div className="flex gap-md items-end">
                <label className="flex-1 flex flex-col gap-1 text-sm font-semibold text-textSecondary">
                  Price
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-textSecondary">
                      $
                    </span>
                    <input
                      type="number"
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
                    onChange={(e) =>
                      setDiscountType(e.target.value as "%" | "$")
                    }
                  >
                    <option value="%">%</option>
                    <option value="$">$</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <label className="flex flex-col gap-1 text-sm font-semibold text-textSecondary">
                Tags (comma-separated)
                <input
                  type="text"
                  value={tagString}
                  onChange={(e) => setTagString(e.target.value)}
                  className="input-box px-md py-1 h-8"
                />
              </label>

              {/* Description */}
              <label className="pb-0.5 flex flex-col gap-1 text-sm font-semibold text-textSecondary">
                Description
                <textarea
                  value={localProduct.description}
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

              {/* Options + Stock container */}
              <div className="flex flex-col gap-4">
                {/* Product Options Editor */}
                <ProductOptionsEditor
                  product={localProduct}
                  setProduct={setLocalProduct}
                />

                {/* Product Stock Editor */}
                <ProductStockEditor
                  product={localProduct}
                  setProduct={setLocalProduct}
                />
              </div>
            </div>

            {/* Right / Images */}
            <div className="md:w-1/3 flex flex-col gap-md flex-shrink-0">
              <ImageListEditor
                images={localProduct.images || []}
                onImagesChange={(imgs) =>
                  setLocalProduct((prev) => ({ ...prev, images: imgs }))
                }
                setIsProcessingImages={setIsProcessingImages} // keep track of processing
              />
            </div>
          </div>

          {/* Form Buttons */}
          <div className="w-full grid grid-cols-2 gap-2 px-4 sm:px-8 py-4 border-t border-border sm:grid-cols-4 flex-shrink-0">
            <button
              className="btn-danger w-full h-12"
              type="button"
              onClick={handleDelete}
            >
              Delete
            </button>
            <button
              type="submit"
              className="btn-success w-full h-12 whitespace-nowrap"
              disabled={isProcessingImages || isSavingProduct}
            >
              {isSavingProduct
                ? "Saving..."
                : isProcessingImages
                  ? "Processing Images..."
                  : product
                    ? "Save Changes"
                    : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
