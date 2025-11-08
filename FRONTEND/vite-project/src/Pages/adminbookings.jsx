import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./adminbookings.css"; // CSS file

const MENU_OPTIONS = [
  { key: "dashboard", label: "Dashboard", path: "/admin/dashboard" },
  { key: "rooms", label: "Manage Rooms", path: "/admin/rooms" },
  { key: "bookings", label: "Pending Bookings", path: "/admin/bookings" },
];

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const fetchPending = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/bookings/admin/pending", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching pending bookings:", error);
      alert("Failed to load pending bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [navigate]);

  const handleAction = async (bookingId, action) => {
    try {
      setActionLoading(bookingId + action);
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/bookings/admin/${bookingId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Booking ${action}d successfully!`);
      fetchPending();
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      alert(`Failed to ${action} booking: ${error.response?.data?.message || error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <header className="admin-navbar">
          <h1 className="navbar-title">Hostel Management System</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </header>
        <div className="admin-body">
          <aside className="admin-sidebar">
            <nav className="sidebar-nav">
              {MENU_OPTIONS.map((item) => (
                <Link key={item.key} to={item.path} className="sidebar-link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="admin-main">
            <div className="loading">Loading pending bookings...</div>
          </main>
        </div>
      </div>
    );
  }

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
        <main className="admin-main">
          <div className="admin-bookings">
            <h1>Pending Bookings</h1>
            {bookings.length === 0 ? (
              <p>No pending bookings at the moment.</p>
            ) : (
              <div className="bookings-grid">
                {bookings.map((booking) => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-info">
                      <p><strong>Student:</strong> {booking.studentId?.name} ({booking.studentId?.email})</p>
                      <p><strong>Room:</strong> {booking.roomId?.roomNumber} - {booking.roomId?.roomType}</p>
                      <p><strong>Hostel:</strong> {booking.roomId?.hostelId?.name || 'N/A'}</p>
                      <p><strong>Price:</strong> ${booking.roomId?.price}</p>
                      <p><strong>Status:</strong> 
                        <span className={`status ${booking.status}`}>{booking.status}</span>
                      </p>
                      <p><strong>Requested:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleAction(booking._id, "approve")}
                        disabled={actionLoading === booking._id + "approve"}
                        className="approve-btn"
                      >
                        {actionLoading === booking._id + "approve" ? "Approving..." : "Approve"}
                      </button>
                      <button 
                        onClick={() => handleAction(booking._id, "reject")}
                        disabled={actionLoading === booking._id + "reject"}
                        className="reject-btn"
                      >
                        {actionLoading === booking._id + "reject" ? "Rejecting..." : "Reject"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminBookings;