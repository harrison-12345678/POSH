import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function LoginPage() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);

         // ✅ Log the entire response from backend
    console.log('Login response:', res.data);

      alert(res.data.message);

        // ✅ Store JWT token in localStorage
    localStorage.setItem('token', res.data.token);

    // ✅ Store user info if needed
    localStorage.setItem('user', JSON.stringify(res.data.user));

      // Redirect based on role
      if (res.data.user.role === 'student') {
        navigate('/home');
      } else if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || 'Error logging in');
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>Login</h1>
          <p>Enter your email and password to access your account.</p>
        </header>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="john.doe@example.com" 
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="Enter your password" 
              required 
            />
          </div>

          <button type="submit" className="submit-btn">Login</button>
        </form>

        <p>
          Don’t have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
