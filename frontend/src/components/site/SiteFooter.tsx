import React from "react";

const SiteFooter: React.FC = () => {
  return (
    <footer className="bg-background text-text font-sans py-8">
      {/* Main content */}
      <div className="max-w-[1200px] mx-auto px-8 flex flex-col md:flex-row justify-between gap-8 flex-wrap">
        {/* Logo / Info */}
        <div className="flex-1 min-w-[250px] mb-6 md:mb-0">
          <h2 className="text-title font-bold mb-4">My Store</h2>
          <p className="text-secondary">
            Providing quality products since 2023.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex-1 min-w-[250px] mb-6 md:mb-0">
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <a href="/" className="hover:text-primary transition-colors">
                Home
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-primary transition-colors">
                About
              </a>
            </li>
            <li>
              <a href="/cart" className="hover:text-primary transition-colors">
                Cart
              </a>
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

      {/* Footer bottom */}
      <div className="mt-8 pt-4 border-t border-secondary text-center text-muted text-sm">
        &copy; {new Date().getFullYear()} My Store | All Rights Reserved
      </div>
    </footer>
  );
};

export default SiteFooter;
