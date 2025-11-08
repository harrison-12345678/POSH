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
  const [activeBooking, setActiveBooking] = useState(null); // ✅ ADDED
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/users/profile/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setStudent(data);
        setName(`${data.firstName || ''} ${data.lastName || ''}`.trim());
        setPreview(data.profilePicture ? `http://localhost:5000${data.profilePicture}` : null);
        
        // ✅ ADDED: Fetch booking status
        await checkBookingStatus(token);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  // ✅ ADDED: Function to check booking status
  const checkBookingStatus = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings/status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      formData.append('firstName', name); // match backend field
      if (password) formData.append('password', password);
      if (profilePic) formData.append('profilePicture', profilePic); // match multer field

      const res = await fetch('http://localhost:5000/api/users/profile/me', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`, // DO NOT set Content-Type with FormData
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert('Profile updated successfully!');
        setStudent(data.user); // backend returns { message, user }
        setIsEditing(false);
      } else {
        alert(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  // ✅ ADDED: Function to determine hostel display
  const getHostelDisplay = () => {
    if (activeBooking) {
      return `${activeBooking.hostelId?.name || 'Hostel'} - Room ${activeBooking.roomId?.roomNumber || 'N/A'}`;
    }
    return student?.hostel || 'Not Assigned';
  };

  // ✅ ADDED: Function to get status display
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
              <p>
                <strong>Name:</strong> {`${student.firstName || ''} ${student.lastName || ''}`.trim()}
              </p>
              <p><strong>Email:</strong> {student.email}</p>
              <p><strong>Registration No:</strong> {student.registrationNumber}</p>
              
              {/* ✅ UPDATED: Dynamic hostel assignment */}
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

              {/* ✅ ADDED: Current booking info section */}
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
                  
                  <a href="/student-bookings" className="view-booking-btn">
                    View Booking Details
                  </a>
                </div>
              )}

              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            </>
          ) : (
            <form className="edit-form" onSubmit={handleUpdate}>
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label>Change Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep old password"
              />

              <label>Profile Picture</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />

              <button type="submit" className="save-btn">Save Changes</button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;