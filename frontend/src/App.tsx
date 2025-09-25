import { Routes, Route } from "react-router-dom";
import SiteHeader from "@components/site/SiteHeader";
import SiteFooter from "@components/site/SiteFooter";
import HomePage from "@pages/HomePage";
import ProductPage from "@pages/product-page/ProductPage";
import CheckoutPage from "@pages/checkout-page/CheckoutPage";
import AboutPage from "./pages/AboutPage";

import AdminDashboard from "@pages/admin/AdminDashboard";
import AdminProductsDash from "@pages/admin/product-dash/AdminProductDash";
import AdminCatalogDash from "@pages/admin/AdminCatalogDash";
import AdminOrdersDash from "@pages/admin/AdminOrdersDash";
import AdminUsersDash from "@pages/admin/AdminUsersDash";
import AdminSettingsDash from "@pages/admin/AdminSettingsDash";

import { applyTheme } from "./theme";
import { Roles } from "../../shared/types/User";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import ScrollToTop from "./routes/ScrollToTop";

export default function App() {
  applyTheme("dark");

  return (
    <div>
      <SiteHeader />
      <main>
        <div className="bg-background">
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
              <Route index element={<AdminProductsDash />} />
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
      </main>
      <SiteFooter />
    </div>
  );
}
