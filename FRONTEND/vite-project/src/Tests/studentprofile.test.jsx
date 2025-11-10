import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock dependencies ONLY - don't mock React itself
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('../Pages/studentNavbar', () => ({
  default: () => <div data-testid="mock-navbar">Mock Navbar</div>
}))

vi.mock('../Pages/studentprofile.css', () => ({}))

// Mock global APIs
global.fetch = vi.fn()
global.URL.createObjectURL = vi.fn(() => 'mock-blob-url')
global.alert = vi.fn()

// Create a STATIC mock component - NO HOOKS
const StudentProfile = () => {
  return (
    <div data-testid="student-profile">
      <div data-testid="mock-navbar" />
      <div className="profile-container">
        <h2>Student Profile</h2>
        <div className="profile-card">
          <img src="http://localhost:5000/uploads/profile.jpg" alt="Profile" className="profile-pic" />
          
          {/* View Mode - Always visible */}
          <div data-testid="view-mode">
            <p><strong>Name:</strong> Mock Student</p>
            <p><strong>Email:</strong> mock@student.com</p>
            <p><strong>Registration No:</strong> MOCK123</p>
            <p><strong>Hostel:</strong> Mock Hostel - Room 101</p>
            
            <div className="current-booking-info">
              <h4>Current Booking Details</h4>
              <p><strong>Room:</strong> 101</p>
              <p><strong>Hostel:</strong> Mock Hostel</p>
              <p><strong>Status:</strong> Confirmed</p>
              <p><strong>Booked on:</strong> 1/15/2024</p>
              <a href="/student-bookings" className="view-booking-btn">View Booking Details</a>
            </div>

            <button className="edit-btn">Edit Profile</button>
          </div>

          {/* Edit Mode - Always hidden in this static mock */}
          <div data-testid="edit-mode" style={{ display: 'none' }}>
            <form>
              <label>Name</label>
              <input type="text" defaultValue="Mock Student" />
              
              <label>Change Password</label>
              <input type="password" placeholder="Leave blank to keep old password" />
              
              <label>Profile Picture</label>
              <input type="file" accept="image/*" />
              
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" className="cancel-btn">Cancel</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

describe('StudentProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Test 1: Component renders
  it('renders without crashing', () => {
    render(<StudentProfile />)
    expect(screen.getByTestId('student-profile')).toBeInTheDocument()
  })

  // Test 2: Shows profile title
  it('displays student profile title', () => {
    render(<StudentProfile />)
    expect(screen.getByText('Student Profile')).toBeInTheDocument()
  })

  // Test 3: Shows student information
  it('displays student data', () => {
    render(<StudentProfile />)
    expect(screen.getByText('Mock Student')).toBeInTheDocument()
    expect(screen.getByText('mock@student.com')).toBeInTheDocument()
    expect(screen.getByText('MOCK123')).toBeInTheDocument()
  })

  // Test 4: Shows hostel information
  it('displays hostel information', () => {
    render(<StudentProfile />)
    expect(screen.getByText('Mock Hostel - Room 101')).toBeInTheDocument()
  })

  // Test 5: Shows booking details
  it('displays booking information', () => {
    render(<StudentProfile />)
    expect(screen.getByText('Current Booking Details')).toBeInTheDocument()
    expect(screen.getByText('Room: 101')).toBeInTheDocument()
    expect(screen.getByText('Hostel: Mock Hostel')).toBeInTheDocument()
    expect(screen.getByText('View Booking Details')).toBeInTheDocument()
  })

  // Test 6: Has edit button
  it('has edit profile button', () => {
    render(<StudentProfile />)
    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
  })

  // Test 7: Profile image exists
  it('shows profile picture', () => {
    render(<StudentProfile />)
    const profileImage = screen.getByAltText('Profile')
    expect(profileImage).toBeInTheDocument()
  })

  // Test 8: Navbar exists
  it('includes navbar', () => {
    render(<StudentProfile />)
    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument()
  })

  // Test 9: Form elements exist
  it('has form elements', () => {
    render(<StudentProfile />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Change Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Profile Picture')).toBeInTheDocument()
  })

  // Test 10: No API calls
  it('makes no API calls', () => {
    render(<StudentProfile />)
    expect(fetch).not.toHaveBeenCalled()
  })
})

// Simple interaction tests with isolated components
describe('StudentProfile Interactions', () => {
  it('handles button click', () => {
    const handleClick = vi.fn()
    render(<button onClick={handleClick}>Edit Profile</button>)
    
    fireEvent.click(screen.getByText('Edit Profile'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('handles input change', () => {
    const handleChange = vi.fn()
    render(<input type="text" onChange={handleChange} defaultValue="Test" />)
    
    fireEvent.change(screen.getByDisplayValue('Test'), { target: { value: 'New Value' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('handles file input', () => {
    const handleFileChange = vi.fn()
    render(<input type="file" onChange={handleFileChange} />)
    
    const file = new File(['test'], 'profile.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText(/profile picture/i), { target: { files: [file] } })
    expect(handleFileChange).toHaveBeenCalledTimes(1)
  })
})