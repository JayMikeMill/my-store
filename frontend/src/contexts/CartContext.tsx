import {
  useEffect,
  useState,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { CartItem } from "@models/CartItem";

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (item: CartItem) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  // Load initial cart from localStorage or default to empty
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    console.log("Adding to cart:", item);
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (cartItem) =>
          cartItem.product.id === item.product.id &&
          cartItem.variant?.id === item.variant?.id
      );

      if (existingIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + (item.quantity || 1),
        };
        return updatedCart;
      } else {
        return [...prevCart, { ...item, quantity: item.quantity || 1 }];
      }
    });
  };

  const removeFromCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (c) =>
          c.product.id === item.product.id && c.variant?.id === item.variant?.id
      );
      if (existingIndex === -1) return prevCart;

      const updatedCart = [...prevCart];
      const quantityToRemove = item.quantity || 1;

      if (updatedCart[existingIndex].quantity > quantityToRemove) {
        updatedCart[existingIndex].quantity -= quantityToRemove;
        return updatedCart;
      } else {
        return prevCart.filter((_, i) => i !== existingIndex);
      }
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart"); // also clear storage
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

export const getCartTotals = (cart: CartItem[]) => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return { totalItems, totalPrice };
};
