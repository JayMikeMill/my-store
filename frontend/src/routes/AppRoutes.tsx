// routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";

// Admin pages
import AdminDashboard from "@pages/admin/AdminDashboard";
import AdminProductsDash from "@pages/admin/product-dash/AdminProductDash";
import AdminCatalogDash from "@pages/admin/AdminCatalogDash";
import AdminOrdersDash from "@pages/admin/AdminOrdersDash";
import AdminUsersDash from "@pages/admin/AdminUsersDash";
import AdminSettingsDash from "@pages/admin/AdminSettingsDash";

// Public pages
import HomePage from "@pages/HomePage";
import ProductPage from "@pages/product-page/ProductPage";
import CheckoutPage from "@pages/checkout-page/CheckoutPage";
import AboutPage from "@pages/AboutPage";

// Auth & Roles
import { Roles } from "@shared/types/User";
import { ProtectedRoute } from "./ProtectedRoute";

// Scroll to top on route change
import ScrollToTop from "./ScrollToTop";

export default function AppRoutes() {
  return (
    <div>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Product/:id" element={<ProductPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="products-dash" replace />} />
          <Route path="products-dash" element={<AdminProductsDash />} />
          <Route path="catalog-dash" element={<AdminCatalogDash />} />
          <Route path="orders-dash" element={<AdminOrdersDash />} />
          <Route path="users-dash" element={<AdminUsersDash />} />
          <Route path="settings-dash" element={<AdminSettingsDash />} />
        </Route>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
  );
}
