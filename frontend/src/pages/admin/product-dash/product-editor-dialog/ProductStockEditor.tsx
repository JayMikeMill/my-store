import React, { useEffect, useState } from "react";
import {
  parseVariantOptions,
  type Product,
  type ProductOption,
  type ProductVariant,
} from "@shared/types/Product";
import AnimatedDropdownSurface from "@components/controls/AnimatedDropdownSurface";

interface ProductStockEditorProps {
  product: Product;
  setProduct: React.Dispatch<React.SetStateAction<Product>>;
  openInitially?: boolean; // control visibility
}

const ProductStockEditor: React.FC<ProductStockEditorProps> = ({
  product,
  setProduct,
  openInitially = false,
}) => {
  const hasVariants = !!product.options?.length;
  const [localVariants, setLocalVariants] = useState<ProductVariant[]>([]);

  // Generate variants when options change
  useEffect(() => {
    if (!product.options?.length) {
      setLocalVariants([]);
      return;
    }

    const newVariants = generateVariants(product.options) || [];

    // Merge with existing product.variants to keep stock values
    setLocalVariants(
      newVariants.map((v) => {
        const existing = product.variants?.find(
          (ex) => ex.options === v.options
        );
        return { ...v, stock: existing?.stock ?? 0 };
      })
    );
  }, [product.options]);

  // Compute total stock from localVariants
  const totalStock = localVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

  // Push localVariants back into product whenever they change
  useEffect(() => {
    setProduct((prev) => ({
      ...prev,
      variants: localVariants,
      stock: hasVariants ? totalStock : prev.stock,
    }));
  }, [localVariants, hasVariants, totalStock, setProduct]);

  const updateVariantStock = (index: number, stock: number) => {
    setLocalVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, stock } : v))
    );
  };

  return (
    <AnimatedDropdownSurface
      className="pt-0 pb-2"
      label={
        <div className="flex items-center justify-between w-full pr-4">
          <span className="text-lg font-semibold text-text">
            {hasVariants ? "Total Stock" : "Product Stock"}
          </span>
          <input
            type="number"
            min={0}
            value={hasVariants ? totalStock : product.stock || 0}
            onChange={(e) => {
              if (!hasVariants) {
                setProduct((prev) => ({
                  ...prev,
                  stock: parseInt(e.target.value) || 0,
                }));
              }
            }}
            disabled={hasVariants}
            onFocus={(e) => e.target.select()}
            className={`input-box w-24 text-center`}
          />
        </div>
      }
      openInitially={openInitially}
      disabled={!hasVariants}
    >
      {localVariants.map((variant, idx) => (
        <div
          key={idx}
          className="flex justify-between items-center w-full border-b border-border pr-8 py-2"
        >
          <div className="flex flex-wrap gap-1 mt-1">
            {parseVariantOptions(variant).map((opt, optIdx) => (
              <span
                key={`variant-${idx}-opt-${optIdx}`}
                className="options-tag"
              >
                {opt.value}
              </span>
            ))}
          </div>

          <input
            type="number"
            min={0}
            value={variant.stock}
            onChange={(e) =>
              updateVariantStock(idx, parseInt(e.target.value) || 0)
            }
            onFocus={(e) => e.target.select()}
            className="input-box w-24 text-center"
          />
        </div>
      ))}
    </AnimatedDropdownSurface>
  );
};

/** Generate all possible variants */
export function generateVariants(
  options?: ProductOption[]
): ProductVariant[] | undefined {
  if (!options || options.length === 0) return;
  const valuesArrays = options.map((opt) =>
    opt.values
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
  );
  if (valuesArrays.some((arr) => arr.length === 0)) return;

  const cartesian = (arr: string[][]): string[][] =>
    arr.reduce((a, b) => a.flatMap((d) => b.map((e) => [...d, e])), [
      [],
    ] as string[][]);

  const combos = cartesian(valuesArrays);

  return combos.map((combo) => ({
    options: combo.map((val, i) => `${options[i].name}:${val}`).join("|"),
    stock: 0,
    priceOverride: undefined,
  }));
}

export default ProductStockEditor;
