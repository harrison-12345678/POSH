import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StudentNavbar from './studentNavbar';
import './StudentBookings.css';

const StudentBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null); // ✅ ADDED

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/bookings/student/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      alert("Failed to load your bookings");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADDED: Cancel booking function
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancellingId(bookingId);
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Booking cancelled successfully!');
      
      // Remove the cancelled booking from the list
      setBookings(prevBookings => prevBookings.filter(booking => booking._id !== bookingId));
      
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div>
        <StudentNavbar />
        <div className="page-content">
          <div className="loading">Loading your bookings...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StudentNavbar />
      <div className="page-content">
        <h1>My Bookings</h1>
        
        {bookings.length === 0 ? (
          <p>You haven't made any bookings yet.</p>
        ) : (
          <div className="bookings-container">
            {bookings.map(booking => (
              <div key={booking._id} className="booking-card">
                {/* Room Image */}
                {booking.roomId?.images?.length > 0 && (
                  <img
                    className="booking-room-image"
                    src={booking.roomId.images[0].startsWith('http') 
                      ? booking.roomId.images[0] 
                      : `http://localhost:5000/${booking.roomId.images[0]}`
                    }
                    alt={`Room ${booking.roomId?.roomNumber}`}
                  />
                )}
                
                <div className="booking-details">
                  <h3>Room {booking.roomId?.roomNumber}</h3>
                  <p><strong>Hostel:</strong> {booking.hostelId?.name || booking.roomId?.hostelId?.name || 'N/A'}</p>
                  <p><strong>Type:</strong> {booking.roomId?.roomType}</p>
                  <p><strong>Price:</strong> ${booking.roomId?.price}</p>
                  <p><strong>Booked on:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                  
                  {/* Status Badge */}
                  <div className={`status-badge status-${booking.status}`}>
                    {booking.status.toUpperCase()}
                  </div>

                  {/* ✅ ADDED: Cancel button for pending bookings */}
                  {booking.status === 'pending' && (
                    <button 
                      className="cancel-btn"
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancellingId === booking._id}
                    >
                      {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}

                  {/* ✅ ADDED: Message for approved bookings */}
                  {booking.status === 'approved' && (
                    <div className="approved-message">
                      ✅ Your booking has been approved!
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentBookings;