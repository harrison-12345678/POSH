import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./admin-dashboard.css";

const MENU_OPTIONS = [
  { key: "dashboard", label: "Dashboard", path: "/admin/dashboard" },
  { key: "rooms", label: "Manage Rooms", path: "/admin/rooms" },
  { key: "bookings", label: "Pending Bookings", path: "/admin/bookings" },
];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch dashboard data using existing endpoints
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch all bookings for this admin's hostel
        const bookingsRes = await axios.get("http://localhost:5000/api/bookings/admin/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const allBookings = bookingsRes.data;

        // Fetch all rooms for this admin's hostel
        const roomsRes = await axios.get("http://localhost:5000/api/rooms", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const allRooms = roomsRes.data;

        // Calculate dashboard stats
        const dashboardData = {
          totalRooms: allRooms.length,
          occupiedRooms: allRooms.filter(room => room.isOccupied).length,
          pendingBookings: allBookings.filter(b => b.status === "pending").length,
          approvedBookings: allBookings.filter(b => b.status === "approved").length,
          rejectedBookings: allBookings.filter(b => b.status === "rejected").length,
          totalStudents: [...new Set(allBookings.map(b => b.studentId?._id).filter(id => id))].length,
          recentBookings: allBookings.slice(0, 10) // Show only first 10 most recent
        };
        
        setData(dashboardData);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (!data) return <p className="loading">Failed to load dashboard data</p>;

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
          <div className="admin-dashboard-container">
            <h2 className="dashboard-title">🏠 Admin Dashboard</h2>

            {/* Summary Cards */}
            <div className="dashboard-cards">
              <div className="card blue">
                <h3>Total Rooms</h3>
                <p>{data.totalRooms}</p>
              </div>
              <div className="card navy">
                <h3>Occupied Rooms</h3>
                <p>{data.occupiedRooms}</p>
              </div>
              <div className="card teal">
                <h3>Pending Bookings</h3>
                <p>{data.pendingBookings}</p>
              </div>
              <div className="card green">
                <h3>Approved Bookings</h3>
                <p>{data.approvedBookings}</p>
              </div>
              <div className="card red">
                <h3>Rejected Bookings</h3>
                <p>{data.rejectedBookings}</p>
              </div>
              <div className="card gray">
                <h3>Total Students</h3>
                <p>{data.totalStudents}</p>
              </div>
            </div>

            {/* Recent Bookings */}
            <h3 className="section-title">Recent Bookings</h3>
            {data.recentBookings.length === 0 ? (
              <p>No bookings found.</p>
            ) : (
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Room</th>
                    <th>Status</th>
                    <th>Booked At</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentBookings.map((booking, index) => (
                    <tr key={booking._id || index}>
                      <td>
                        {booking.studentId ? 
                          `${booking.studentId.firstName || ''} ${booking.studentId.lastName || ''}`.trim() 
                          : 'N/A'
                        }
                      </td>
                      <td>{booking.studentId?.email || 'N/A'}</td>
                      <td>{booking.roomId?.roomNumber || 'N/A'}</td>
                      <td>
                        <span className={`status-${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;