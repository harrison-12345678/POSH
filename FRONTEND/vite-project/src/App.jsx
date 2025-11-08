import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import pages from assets
import AuthPage from './Pages/AuthPage';
import LoginPage from './Pages/LoginPage';
import Home from './Pages/Home';
import AdminDashboard from './Pages/admin-dashboard';
import AdminRooms from './Pages/adminrooms';
import AdminBookings from './Pages/adminbookings';
import RoomsPage from './Pages/studentrooms';
import BookingHistoryPage from './Pages/studentbookings';
import ProfilePage from './Pages/studentprofile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} /> {/* Default route shows Login */}
        <Route path="/signup" element={<AuthPage />} /> {/* Signup */}
        <Route path="/home" element={<Home />} /> {/* Student Home */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} /> {/* Admin Dashboard */}
         <Route path="/admin/rooms" element={<AdminRooms />} />
         <Route path="/admin/bookings" element={<AdminBookings />} />
         <Route path="/studentrooms" element={<RoomsPage />} />
        <Route path="/studentbookings" element={<BookingHistoryPage />} />
        <Route path="/studentprofile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
