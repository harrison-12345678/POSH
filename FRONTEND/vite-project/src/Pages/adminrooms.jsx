import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './adminrooms.css';

const MENU_OPTIONS = [
  { key: "dashboard", label: "Dashboard", path: "/admin/dashboard" },
  { key: "rooms", label: "Manage Rooms", path: "/admin/rooms" },
  { key: "bookings", label: "Pending Bookings", path: "/admin/bookings" },
];

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'single',
    capacity: 1,
    price: '',
    description: '',
    amenities: [],
    images: [],
    isAvailable: true
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Fetch all rooms for admin's hostel
  const fetchRooms = async () => {
    console.log('JWT token:', localStorage.getItem('token'));

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch('http://localhost:5000/api/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      } else {
        throw new Error('Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      alert('Failed to fetch rooms. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Upload images to backend
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setImageUploading(true);
      const uploadedImages = [];

      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          alert(`Image ${file.name} is too large. Maximum size is 5MB.`);
          continue;
        }

        if (!file.type.startsWith('image/')) {
          alert(`File ${file.name} is not an image.`);
          continue;
        }

        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formDataUpload
        });

        if (!response.ok) {
          throw new Error("Image upload failed");
        }

        const data = await response.json();
        uploadedImages.push(data.fileUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }));

      e.target.value = '';
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Error uploading images. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  // Remove image from array
  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Submit room (create or update)
  const handleSubmit = async (e) => {
    console.log('JWT token:', localStorage.getItem('token'));

    e.preventDefault();
    console.log('Form submit fired', formData);
    try {
      const token = localStorage.getItem('token');
      const url = editingRoom
        ? `http://localhost:5000/api/rooms/${editingRoom._id}`
        : 'http://localhost:5000/api/rooms';

      const method = editingRoom ? 'PUT' : 'POST';

      const requestData = {
        roomNumber: formData.roomNumber,
        roomType: formData.roomType,
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price),
        description: formData.description,
        amenities: formData.amenities,
        images: formData.images, // file URLs from backend
        isAvailable: formData.isAvailable
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        alert(editingRoom ? 'Room updated successfully!' : 'Room created successfully!');
        resetForm();
        fetchRooms();
      } else {
        const error = await response.json();
        alert(error.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Operation failed. Please try again.');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      capacity: room.capacity,
      price: room.price,
      description: room.description || '',
      amenities: room.amenities || [],
      images: room.images || [],
      isAvailable: room.isAvailable
    });
    setShowForm(true);
  };

  const handleDelete = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          alert('Room deleted successfully!');
          fetchRooms();
        } else {
          const error = await response.json();
          alert(error.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Delete failed. Please try again.');
      }
    }
  };

  const toggleAvailability = async (roomId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });

      if (response.ok) {
        alert(`Room marked as ${!currentStatus ? 'available' : 'occupied'}!`);
        fetchRooms();
      } else {
        const error = await response.json();
        alert(error.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Update failed. Please try again.');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      roomType: 'single',
      capacity: 1,
      price: '',
      description: '',
      amenities: [],
      images: [],
      isAvailable: true
    });
  };

  const amenityOptions = [
    'WiFi', 'AC', 'Heating', 'Private Bathroom',
    'TV', 'Fridge', 'Study Table', 'Wardrobe',
    'Hot Water', 'Laundry', 'Cleaning Service', 'Security'
  ];

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
          <div className="admin-rooms">
            <h1>Manage Rooms</h1>

            {/* Button to show add-room form */}
            {!showForm && (
              <button onClick={() => setShowForm(true)}>Add New Room</button>
            )}

            {/* Room Form */}
            {showForm && (
              <form onSubmit={handleSubmit} className="room-form">
                <div>
                  <label>Room Number:</label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label>Room Type:</label>
                  <select
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleInputChange}
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                  </select>
                </div>

                <div>
                  <label>Capacity:</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label>Price:</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min={0}
                    required
                  />
                </div>

                <div>
                  <label>Description:</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label>Amenities:</label>
                  <div className="amenities">
                    {amenityOptions.map((amenity) => (
                      <label key={amenity}>
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityChange(amenity)}
                        />
                        {amenity}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label>Images:</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleImageUpload}
                  />
                  {imageUploading && <p>Uploading...</p>}
                  <div className="image-preview">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="image-item">
                        <img src={img} alt={`Room ${idx}`} />
                        <button type="button" onClick={() => removeImage(idx)}>Remove</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label>
                    Available:
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleInputChange}
                    />
                  </label>
                </div>

                <button type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Submit button clicked');
                    handleSubmit(e);
                  }}
                >
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </button>
                <button type="button" onClick={resetForm}>Cancel</button>
              </form>
            )}

            {/* Loading indicator */}
            {loading && <p>Loading rooms...</p>}

            {/* List of rooms */}
            {!loading && rooms.length > 0 && (
              <div className="room-list">
                {rooms.map((room) => (
                  <div key={room._id} className="room-card">
                    <h3>Room {room.roomNumber}</h3>
                    <p>Type: {room.roomType}</p>
                    <p>Capacity: {room.capacity}</p>
                    <p>Price: ${room.price}</p>
                    <p>Status: {room.isAvailable ? 'Available' : 'Occupied'}</p>
                    {room.images.length > 0 && (
                      <div className="room-images">
                        {room.images.map((img, idx) => (
                          <img key={idx} src={img} alt={`Room ${room.roomNumber}`} />
                        ))}
                      </div>
                    )}
                    <p>Amenities: {room.amenities.join(', ')}</p>
                    <button onClick={() => handleEdit(room)}>Edit</button>
                    <button onClick={() => handleDelete(room._id)}>Delete</button>
                    <button onClick={() => toggleAvailability(room._id, room.isAvailable)}>
                      {room.isAvailable ? 'Mark Occupied' : 'Mark Available'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!loading && rooms.length === 0 && <p>No rooms available.</p>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminRooms;