import React from "react";
import { useNavigate } from "react-router-dom";
import { SITE } from "../../site-config";

const SiteFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-background text-text font-sans py-8">
      <div className="max-w-[1200px] mx-auto px-8 flex flex-col md:flex-row justify-between gap-8 flex-wrap">
        {/* Logo / Info */}
        <div className="flex-1 min-w-[250px] mb-6 md:mb-0">
          <h2 className="text-title font-bold mb-4">{SITE.name}</h2>
          <p className="text-secondary">{SITE.slogan}</p>
        </div>

        {/* Quick Links */}
        <div className="flex-1 min-w-[250px] mb-6 md:mb-0">
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => navigate("/")}
                className="hover:text-primary transition-colors"
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/about")}
                className="hover:text-primary transition-colors"
              >
                About
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/cart")}
                className="hover:text-primary transition-colors"
              >
                Cart
              </button>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div className="flex-1 min-w-[250px]">
          <h2 className="text-lg font-semibold mb-4">Follow Us</h2>
          <div className="flex flex-col gap-2">
            <a href="#" className="hover:text-primary transition-colors">
              Facebook
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Instagram
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-secondary text-center text-muted text-sm">
        &copy; {new Date().getFullYear()} {SITE.name} | All Rights Reserved
      </div>
    </footer>
  );
};

export default SiteFooter;
