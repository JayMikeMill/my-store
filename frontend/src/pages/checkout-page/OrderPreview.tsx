import { useCart, getCartTotals } from "@contexts/CartContext";
import { parseVariantOptions } from "@shared/types/Product";

export default function OrderPreview() {
  const { cart } = useCart();
  const totals = getCartTotals(cart);

  if (cart.length === 0) {
    return (
      <div className="max-w-[700px] mx-auto p-6 bg-surface rounded-lg shadow text-gray-800 text-center">
        <p>Your order is empty.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-surface rounded-lg shadow flex flex-col gap-4">
      <h3 className="text-center text-xl font-semibold mb-4">Order Summary</h3>

      <div className="flex flex-col gap-3">
        {cart.map((item, index) => {
          const key = item?.variant?.id ?? item?.product?.id ?? index;

          const imgSrc =
            item?.product?.images?.[0]?.thumbnail ||
            item?.product?.images?.[0]?.preview ||
            item?.product?.images?.[0]?.main ||
            "";

          const name = item?.product?.name ?? "Unknown Product";
          const selectedOptions = parseVariantOptions(item?.variant);

          return (
            <div
              key={key}
              className="flex items-center gap-md border-b border-divider pb-sm"
            >
              <img
                src={imgSrc}
                alt={name}
                className="w-16 h-16 object-cover rounded-card bg-surface"
              />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text truncate">{name}</p>

                {selectedOptions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedOptions.map((opt, idx) => (
                      <span key={`${key}-opt-${idx}`} className="options-tag">
                        {opt.name}: {opt.value}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-textSecondary">
                  Price: ${item.price.toFixed(2)} × {item.quantity} = $
                  {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-divider pt-md flex flex-col gap-sm text-right font-semibold text-text">
        <p>Total Items: {totals.totalItems}</p>
        <p>Subtotal: ${totals.totalPrice.toFixed(2)}</p>
      </div>
    </div>
  );
}
