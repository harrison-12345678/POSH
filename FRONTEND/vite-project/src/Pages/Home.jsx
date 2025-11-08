import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StudentNavbar from "./studentNavbar";
import "./Home.css";

const Home = () => {
  const images = [
    "/images/hostel1.jpg",
    "/images/hostel2.jpg",
    "/images/hostel3.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookingStatus, setBookingStatus] = useState(null); // ✅ ADDED
  const [loading, setLoading] = useState(true); // ✅ ADDED

  // Auto-change slides every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  // ✅ ADDED: Check booking status on component mount
  useEffect(() => {
    checkBookingStatus();
  }, []);

  const checkBookingStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/bookings/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setBookingStatus(data);
    } catch (error) {
      console.error("Error checking booking status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <StudentNavbar />

      {/* Slideshow Section */}
      <div className="slideshow-container">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="Hostel"
            className={`slide-image ${index === currentIndex ? "active" : ""}`}
          />
        ))}
        <div className="slide-overlay">
          <h1 className="slide-title">Welcome !</h1>
          <p className="slide-text">
            "Book your bed, start your journey.."
          </p>
        </div>
      </div>

      {/* Page Content */}
      <div className="home-content">
        {/* ✅ ADDED: Booking Status Card */}
        {!loading && (
          <div className="booking-status-card">
            <h2>📋 Booking Status</h2>
            {bookingStatus?.hasActiveBooking ? (
              <div className="has-booking">
                <div className="status-success">✅ You have an active booking</div>
                <div className="booking-details">
                  <p><strong>Room:</strong> {bookingStatus.activeBooking.roomId?.roomNumber}</p>
                  <p><strong>Hostel:</strong> {bookingStatus.activeBooking.hostelId?.name}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-${bookingStatus.activeBooking.status}`}>
                      {bookingStatus.activeBooking.status.charAt(0).toUpperCase() + bookingStatus.activeBooking.status.slice(1)}
                    </span>
                  </p>
                </div>
                <Link to="/studentbookings" className="view-booking-btn">
                  View Booking Details
                </Link>
              </div>
            ) : (
              <div className="no-booking">
                <div className="status-info">📝 No active booking found</div>
                <p>Ready to book your hostel room?</p>
                <Link to="/studentrooms" className="book-now-btn">
                  Book a Room Now
                </Link>
              </div>
            )}
          </div>
        )}

        <h2 className="section-title">Quick Actions</h2>

        <div className="card-container">
          <Link to="/studentrooms" className="card blue-card">
            <h3>🏠 Room Listings</h3>
            <p>Find and book available rooms easily.</p>
          </Link>

          <Link to="/studentbookings" className="card white-card">
            <h3>📅 Booking History</h3>
            <p>View your past and upcoming bookings.</p>
          </Link>

          <Link to="/studentprofile" className="card blue-card">
            <h3>👤 Profile</h3>
            <p>Manage your student account details.</p>
          </Link>
        </div>

        {/* Announcements */}
        <div className="announcements">
          <h2>📢 Announcements</h2>
          <ul>
            <li>
              Hostel Wi-Fi maintenance on <strong>18th Oct</strong>.
            </li>
            <li>
              Payment deadline: <strong>25th Oct</strong>.
            </li>
            <li>
              New rooms added in <strong>Sunrise Hostel</strong>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;