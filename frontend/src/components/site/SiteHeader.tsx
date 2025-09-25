import { SITE } from "../../config";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart, getCartTotals } from "@contexts/CartContext";
import { useState } from "react";

import SlideOutCart from "@components/shopping-cart/SlideOutCart";
import SiteMenu from "@components/site/SiteMenu";

export default function SiteHeader() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const cartTotals = getCartTotals(cart);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-surface shadow sticky top-0 z-30">
      {/* Header row */}
      <div className="max-w-6xl mx-auto flex items-center justify-between px-md py-sm">
        {/* Left: Menu button (mobile) */}
        <button
          className="p-2 rounded hover:bg-surface-hover"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <X className="text-text" size={24} />
          ) : (
            <Menu className="text-text" size={24} />
          )}
        </button>

        {/* Center: Logo + label */}
        <div
          className="flex flex-col items-center justify-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={SITE.logo} alt="Logo" className="max-h-10" />
        </div>

        {/* Right: Cart icon */}
        <div
          className="relative cursor-pointer"
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingCart className="text-text" size={24} />
          {cartTotals.totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-accent text-white rounded-full text-xs px-2 py-0.5">
              {cartTotals.totalItems}
            </span>
          )}
        </div>
      </div>

      {/* Slide-out menu */}
      <SiteMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Slide-out cart */}
      {isCartOpen && (
        <SlideOutCart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />
      )}
    </header>
  );
}
