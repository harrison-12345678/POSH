import React, { useEffect, useState } from 'react';
import StudentNavbar from './studentNavbar';
import { useNavigate } from 'react-router-dom';
import './studentprofile.css';

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://hostel-booking-system-7970.onrender.com/api/users/profile/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStudent(data);
        setName(`${data.firstName || ''} ${data.lastName || ''}`.trim());
        setPreview(data.profilePicture ? `https://hostel-booking-system-7970.onrender.com${data.profilePicture}` : null);
        
        await checkBookingStatus(token);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const checkBookingStatus = async (token) => {
    try {
      const response = await fetch('https://hostel-booking-system-7970.onrender.com/api/bookings/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.hasActiveBooking) {
        setActiveBooking(data.activeBooking);
      }
    } catch (error) {
      console.error('Error checking booking status:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('firstName', name);
      if (password) formData.append('password', password);
      if (profilePic) formData.append('profilePicture', profilePic);

      const res = await fetch('https://hostel-booking-system-7970.onrender.com/api/users/profile/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert('Profile updated successfully!');
        setStudent(data.user);
        setIsEditing(false);
      } else {
        alert(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const getHostelDisplay = () => {
    if (activeBooking) {
      return `${activeBooking.hostelId?.name || 'Hostel'} - Room ${activeBooking.roomId?.roomNumber || 'N/A'}`;
    }
    return student?.hostel || 'Not Assigned';
  };

  const getStatusDisplay = () => {
    if (activeBooking) {
      return activeBooking.status.charAt(0).toUpperCase() + activeBooking.status.slice(1);
    }
    return 'No Active Booking';
  };

  if (!student) return <p>Loading profile...</p>;

  return (
    <div>
      <StudentNavbar />
      <div className="profile-container">
        <h2>Student Profile</h2>
        <div className="profile-card">
          {preview && <img src={preview} alt="Profile" className="profile-pic" />}

          {!isEditing ? (
            <>
              <p><strong>Name:</strong> {`${student.firstName || ''} ${student.lastName || ''}`.trim()}</p>
              <p><strong>Email:</strong> {student.email}</p>
              <p><strong>Registration No:</strong> {student.registrationNumber}</p>
              <p><strong>Hostel:</strong> 
                <span className={activeBooking ? "hostel-assigned" : "hostel-not-assigned"}>
                  {getHostelDisplay()}
                  {activeBooking && (
                    <span className={`status-badge status-${activeBooking.status}`}>
                      {getStatusDisplay()}
                    </span>
                  )}
                </span>
              </p>

              {activeBooking && (
                <div className="current-booking-info">
                  <h4>Current Booking Details</h4>
                  <p><strong>Room:</strong> {activeBooking.roomId?.roomNumber}</p>
                  <p><strong>Hostel:</strong> {activeBooking.hostelId?.name}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-${activeBooking.status}`}>
                      {getStatusDisplay()}
                    </span>
                  </p>
                  <p><strong>Booked on:</strong> {new Date(activeBooking.createdAt).toLocaleDateString()}</p>
                  <a href="/student-bookings" className="view-booking-btn">View Booking Details</a>
                </div>
              )}

              <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
            </>
          ) : (
            <form className="edit-form" onSubmit={handleUpdate}>
              <label>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

              <label>Change Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep old password" />

              <label>Profile Picture</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />

              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
