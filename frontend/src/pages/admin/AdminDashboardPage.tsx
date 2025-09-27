import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@contexts/auth/AuthContext";
import { NavButton } from "@components/controls/CustomControls";

export default function AdminDashboardPage() {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col w-full max-w-full font-sans bg-background">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-border flex-shrink-0 px-2 py-3">
        <h1 className="text-3xl text-text ">Dashboard</h1>
        <button onClick={logout} className="btn-normal">
          Logout
        </button>
      </header>

      {/* Navigation */}

      <nav className="flex gap-2 p-2 py-4 border-b border-border overflow-x-auto whitespace-nowrap">
        <NavLink
          to="/admin/products"
          className={({ isActive }) => NavButton(isActive)}
        >
          Products
        </NavLink>
        <NavLink
          to="/admin/catalog"
          className={({ isActive }) => NavButton(isActive)}
        >
          Catalog
        </NavLink>
        <NavLink
          to="/admin/orders"
          className={({ isActive }) => NavButton(isActive)}
        >
          Orders
        </NavLink>
        <NavLink
          to="/admin/users"
          className={({ isActive }) => NavButton(isActive)}
        >
          Users
        </NavLink>
        <NavLink
          to="/admin/settings"
          className={({ isActive }) => NavButton(isActive)}
        >
          Settings
        </NavLink>
      </nav>

      {/* Main content */}
      <main className="flex-grow overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
