import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { type Product, type ProductVariant } from "@shared/types/Product";

import { useCart } from "@contexts/CartContext";
import { useApi } from "@api/useApi";

import ProductOptionSelector from "./ProductOptionsSelector";
import ProductPageImages from "./ProductPageImages";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const getProduct = useApi().products.get;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  useEffect(() => {
    if (id) {
      getProduct(id).then((p) => setProduct(p));
    }
  }, [id]);

  if (!product)
    return <div className="p-8 text-center text-textSecondary">Loading...</div>;

  const discountedPrice = product.discount
    ? typeof product.discount === "string" && product.discount.includes("%")
      ? product.price * (1 - parseFloat(product.discount) / 100)
      : product.price - parseFloat(product.discount)
    : product.price;

  const discountLabel =
    product.discount &&
    typeof product.discount === "string" &&
    product.discount.includes("%")
      ? product.discount
      : product.discount
        ? `$${parseFloat(product.discount).toFixed(2)}`
        : null;

  const handleAddToCart = () => {
    addToCart({
      product: product,
      variant: selectedVariant ?? undefined,
      quantity: 1,
      price: selectedVariant?.priceOverride ?? discountedPrice,
    });
  };

  return (
    <div className="p-mt-8">
      <div className="flex flex-col md:flex-row justify-center md:items-start pb-2">
        {/* Small screen: Name & Price above image */}
        <div className="flex flex-col gap-2 md:hidden items-center w-full px-4">
          <h1 className="text-4xl font-bold text-text text-center">
            {product.name}
          </h1>
          <div className="flex items-center justify-center gap-2">
            {product.discount && discountedPrice < product.price ? (
              <>
                <span className="text-xl text-textMuted line-through">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-2xl text-text font-bold">
                  ${discountedPrice.toFixed(2)}
                </span>
                <span className="tag-box">{discountLabel} OFF!</span>
              </>
            ) : (
              <span className="text-2xl text-blue-600 font-bold">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Product Image */}
        <div className="w-full md:w-auto flex justify-center pb-4">
          <ProductPageImages images={product.images ?? []} />
        </div>

        {/* Product Details (md+ layout) */}
        <div className="flex flex-col gap-4 w-full md:w-auto text-left self-start px-4 md:px-0">
          <div className="hidden md:flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-text">{product.name}</h1>
            <div className="flex items-center gap-4">
              {product.discount && discountedPrice < product.price ? (
                <>
                  <span className="text-xl text-textMuted line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-2xl text-text font-bold">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  <span className="tag-box">{discountLabel} OFF!</span>
                </>
              ) : (
                <span className="text-2xl text-blue-600 font-bold">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <ProductOptionSelector
            product={product}
            onVariantChange={setSelectedVariant}
          />

          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {product.tags.map((tag, index) => (
                <span key={index} className="tag-box">
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="text-text text-xl">Product Description</div>
          <div className="text-textSecondary mb-4 whitespace-pre-line">
            {product.description}
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              className="btn-primary px-6 py-2"
              onClick={handleAddToCart}
              disabled={!selectedVariant}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
