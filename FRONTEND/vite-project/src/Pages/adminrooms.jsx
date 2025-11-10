// Only the API URLs below are changed from localhost → deployed backend
// Everything else remains identical

const fetchRooms = async () => {
  console.log('JWT token:', localStorage.getItem('token'));

  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/login");
      return;
    }

    const response = await fetch('https://hostel-booking-system-7970.onrender.com/api/rooms', {
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

// Image upload
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
      const response = await fetch("https://hostel-booking-system-7970.onrender.com/api/upload", {
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

// Submit room (create or update)
const handleSubmit = async (e) => {
  console.log('JWT token:', localStorage.getItem('token'));

  e.preventDefault();
  console.log('Form submit fired', formData);
  try {
    const token = localStorage.getItem('token');
    const url = editingRoom
      ? `https://hostel-booking-system-7970.onrender.com/api/rooms/${editingRoom._id}`
      : 'https://hostel-booking-system-7970.onrender.com/api/rooms';

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

// Delete room
const handleDelete = async (roomId) => {
  if (window.confirm('Are you sure you want to delete this room?')) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://hostel-booking-system-7970.onrender.com/api/rooms/${roomId}`, {
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

// Toggle availability
const toggleAvailability = async (roomId, currentStatus) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://hostel-booking-system-7970.onrender.com/api/rooms/${roomId}`, {
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
