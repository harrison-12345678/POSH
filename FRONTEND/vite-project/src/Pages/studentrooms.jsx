import React, { useEffect, useState } from 'react';
import StudentNavbar from './studentNavbar';
import axios from 'axios';
import './StudentRooms.css';

const StudentRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingRoomId, setBookingRoomId] = useState(null);
  const [hasActiveBooking, setHasActiveBooking] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    checkBookingStatus(token);
    
    axios.get("https://hostel-booking-system-7970.onrender.com/api/rooms/all", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      const availableRooms = res.data.filter(room => room.isAvailable && !room.isOccupied);
      setRooms(availableRooms);
    })
    .catch(err => console.error(err.response || err));
  }, []);

  const checkBookingStatus = async (token) => {
    try {
      const response = await axios.get("https://hostel-booking-system-7970.onrender.com/api/bookings/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.hasActiveBooking) {
        setHasActiveBooking(true);
        setActiveBooking(response.data.activeBooking);
      }
    } catch (error) {
      console.error('Error checking booking status:', error);
    }
  };

  const handleBookRoom = async (roomId) => {
    if (hasActiveBooking) {
      alert(`You already have an active ${activeBooking.status} booking for room ${activeBooking.roomId?.roomNumber}. Please cancel it first before booking a new room.`);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setBookingRoomId(roomId);

    try {
      const response = await axios.post(
        `https://hostel-booking-system-7970.onrender.com/api/bookings/book/${roomId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRooms(prevRooms => prevRooms.filter(room => room._id !== roomId));
      setHasActiveBooking(true);
      alert('Room booked successfully! Waiting for admin approval.');
      
    } catch (error) {
      console.error('Booking error:', error);
      
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already have')) {
        setHasActiveBooking(true);
      }
      
      alert(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
      setBookingRoomId(null);
    }
  };

  return (
    <div>
      <StudentNavbar />
      <div className="page-content">
        <h1>Available Rooms</h1>
        
        {hasActiveBooking && (
          <div className="booking-warning" style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <strong>⚠️ You have an active booking:</strong> 
            <p>Room: {activeBooking?.roomId?.roomNumber} | Hostel: {activeBooking?.hostelId?.name} | Status: {activeBooking?.status}</p>
            <p>Please cancel your current booking before booking a new room.</p>
            <a 
              href="/studentbookings" 
              style={{ color: '#856404', textDecoration: 'underline' }}
            >
              View My Bookings
            </a>
          </div>
        )}
        
        {rooms.length === 0 ? (
          <p>No rooms available at the moment.</p>
        ) : (
          <div className="room-container">
            {rooms.map(room => (
              <div key={room._id} className="room-card">
                {room.images?.length > 0 && (
                  <img
                    className="room-main-image"
                    src={room.images[0].startsWith('http') 
                      ? room.images[0] 
                      : `https://hostel-booking-system-7970.onrender.com/${room.images[0]}`
                    }
                    alt={`Room ${room.roomNumber}`}
                  />
                )}

                <h2>Room {room.roomNumber}</h2>
                <p><strong>Type:</strong> {room.roomType}</p>
                <p><strong>Capacity:</strong> {room.capacity} persons</p>
                <p><strong>Price:</strong> ${room.price}</p>
                <p><strong>Hostel:</strong> {room.hostelId?.name || 'N/A'}</p>
                <p><strong>Description:</strong> {room.description || 'No description'}</p>
                <p><strong>Amenities:</strong> {room.amenities?.length ? room.amenities.join(', ') : 'None'}</p>
                <p><strong>Status:</strong> Available</p>

                <button 
                  className="book-btn"
                  onClick={() => handleBookRoom(room._id)}
                  disabled={(loading && bookingRoomId === room._id) || hasActiveBooking}
                  style={hasActiveBooking ? { 
                    backgroundColor: '#6c757d', 
                    cursor: 'not-allowed' 
                  } : {}}
                >
                  {hasActiveBooking ? 'Already Booked' : 
                   (loading && bookingRoomId === room._id) ? 'Booking...' : 'Book Room'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRooms;
