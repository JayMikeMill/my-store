import { useCart } from "@contexts/CartContext";
import { type Product } from "@shared/types/Product";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      product: product,
      quantity: 1,
      price: product.price,
    });
  };

  const handleCardClick = () => {
    navigate(`/Product/${product.id}`);
  };

  let discountedPrice: number | null = null;
  if (product.discount) {
    if (typeof product.discount === "string") {
      if (product.discount.includes("%")) {
        const percentage = parseFloat(product.discount.replace("%", ""));
        discountedPrice = product.price * (1 - percentage / 100);
      } else {
        const amount = parseFloat(product.discount);
        discountedPrice = product.price - amount;
      }
    } else if (typeof product.discount === "number") {
      discountedPrice = product.price * (1 - product.discount);
    }
  }

  return (
    <div
      className="overflow-hidden cursor-pointer transition-all duration-300"
      onClick={handleCardClick}
    >
      <div className="relative w-full pt-[100%]">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0].preview}
            alt={product.name}
            className="absolute top-0 left-0 w-full h-full object-cover rounded-card"
          />
        ) : (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-surfaceAlt text-textSecondary rounded-card">
            No Image Available
          </div>
        )}
        {product.tags && product.tags.length > 0 && (
          <div className="absolute top-2 left-2 flex gap-1">
            {product.tags.map((tag, index) => (
              <span key={index} className="tag-box">
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-md ">
        <h3 className="text-base font-semibold mb-2 text-text">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 justify-center">
          {discountedPrice !== null && discountedPrice < product.price ? (
            <>
              <p className="text-sm text-textSecondary line-through">
                ${product.price.toFixed(2)}
              </p>
              <p className="text-lg text-primary font-bold">
                ${discountedPrice.toFixed(2)}
              </p>
            </>
          ) : (
            <p className="text-lg text-primary font-bold">
              ${product.price.toFixed(2)}
            </p>
          )}
        </div>
        <button className="btn-primary w-full mt-sm" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
