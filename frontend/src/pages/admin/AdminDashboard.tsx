import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@contexts/auth/AuthContext";

function navButtonClass(isActive: boolean) {
  return isActive ? "btn-normal-active" : "btn-normal";
}

export default function AdminDashboard() {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col w-full max-w-full font-sans bg-background">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-border flex-shrink-0 px-2 py-3">
        <h1 className="text-3xl text-text">Dashboard</h1>
        <button onClick={logout} className="btn-danger">
          Logout
        </button>
      </header>

      {/* Navigation */}

      <nav className="flex gap-2 p-2 border-b border-border overflow-x-auto whitespace-nowrap">
        <NavLink
          to="/admin/products-dash"
          className={({ isActive }) => navButtonClass(isActive)}
        >
          Products
        </NavLink>
        <NavLink
          to="/admin/catalog-dash"
          className={({ isActive }) => navButtonClass(isActive)}
        >
          Catalog
        </NavLink>
        <NavLink
          to="/admin/orders-dash"
          className={({ isActive }) => navButtonClass(isActive)}
        >
          Orders
        </NavLink>
        <NavLink
          to="/admin/users-dash"
          className={({ isActive }) => navButtonClass(isActive)}
        >
          Users
        </NavLink>
        <NavLink
          to="/admin/settings-dash"
          className={({ isActive }) => navButtonClass(isActive)}
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
