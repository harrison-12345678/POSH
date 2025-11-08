import React from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ Link & useNavigate
import "./StudentNavbar.css";

const StudentNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // or your auth token
    navigate("/"); // programmatic navigation after logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <h1 className="navbar-brand">Student Dashboard</h1>

        {/* Links */}
        <ul className="navbar-links">
          <li><Link to="/studentrooms">Room Listings</Link></li>
          <li><Link to="/studentbookings">Booking History</Link></li>
          <li><Link to="/studentprofile">Profile</Link></li>
        </ul>

        {/* Logout Button */}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default StudentNavbar;
