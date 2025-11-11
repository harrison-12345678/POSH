import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import pages from assets
import AuthPage from './Pages/Authpage.jsx';
import LoginPage from './Pages/LoginPage.jsx';
import Home from './Pages/Home.jsx';
import AdminDashboard from './Pages/admin-dashboard.jsx';
import AdminRooms from './Pages/adminrooms.jsx';
import AdminBookings from './Pages/adminbookings.jsx';
import RoomsPage from './Pages/studentrooms.jsx';
import BookingHistoryPage from './Pages/studentbookings.jsx';
import ProfilePage from './Pages/studentprofile.jsx';

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
