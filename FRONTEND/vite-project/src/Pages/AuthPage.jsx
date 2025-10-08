import { useState,useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function AuthPage() {
  const navigate = useNavigate(); // for redirect after signup

  const [formData, setFormData] = useState({
    role: 'student',
    firstName: '',
    lastName: '',
    registrationNumber: '',
    hostelName: '',
    hostelId: '',
    email: '',
    phoneNumber: '',
    password: ''
  });

  const [hostels, setHostels] = useState([]);

  useEffect(() => {
  axios.get('http://localhost:5000/api/hostels')
       .then(res => setHostels(res.data))
       .catch(err => console.error(err));
}, []);

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };  

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      role,
      registrationNumber: '',
      hostelName: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', formData);
      alert(res.data.message);

      // Redirect to login page after successful signup
      navigate('/');

    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || 'Error signing up');
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>Hostel Management System</h1>
          <p>Create an Account<br />Choose your role and fill in your details.</p>
        </header>

        <form onSubmit={handleSubmit}>
          {/* Role selection */}
          <div className="role-selection">
            <button 
              type="button" 
              className={`role-btn ${formData.role === 'student' ? 'active' : ''}`} 
              onClick={() => handleRoleChange('student')}
            >
              Student
            </button>
            <button 
              type="button" 
              className={`role-btn ${formData.role === 'admin' ? 'active' : ''}`} 
              onClick={() => handleRoleChange('admin')}
            >
              Admin
            </button>
          </div>

          {/* Name fields */}
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="firstName">First Name</label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required />
            </div>
            <div className="input-group">
              <label htmlFor="lastName">Last Name</label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required />
            </div>
          </div>

          {/* Conditional field based on role */}
          {formData.role === 'student' ? (
            <div className="input-group">
              <label htmlFor="registrationNumber">Registration Number</label>
              <input type="text" id="registrationNumber" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="U2020/12345" required />
            </div>
          ) : (
            <div className="input-group">
            <label htmlFor="hostelId">Hostel</label>
          <select id="hostelId" name="hostelId" value={formData.hostelId} onChange={handleChange} required>
          <option value="">Select a hostel</option>
          {hostels.map(h => (
      <option key={h._id} value={h._id}>{h.name}</option>
    ))}
  </select>
</div>

          )}

          {/* Phone, Email, Password */}
          <div className="input-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+1 (555) 123-4567" required />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="john.doe@example.com" required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required />
          </div>

          <button type="submit" className="submit-btn">Create Account</button>
        </form>

        {/* Link to login if already have an account */}
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
