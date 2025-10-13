import React from "react";
import { Link, useNavigate } from "react-router-dom";
import './admin-dashboard.css'; 

const MENU_OPTIONS = [
  { key: "dashboard", label: "Dashboard", path: "/admin/dashboard"},
  { key: "rooms", label: "Manage Rooms", path: "/admin/rooms" },
  { key: "bookings", label: "Pending Bookings" ,path: "/admin/bookings"},
];


export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear token or session
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      {/* Top Navbar */}
      <header className="admin-navbar">
        <h1 className="navbar-title">Hostel Management System</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Sidebar + Main Content */}
      <div className="admin-body">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <nav className="sidebar-nav">
            {MENU_OPTIONS.map((item) => (
              <Link key={item.key} to={item.path} className="sidebar-link">
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
