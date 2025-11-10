const request = require('supertest');
const express = require('express');
const bookingRoutes = require('../../Routes/bookingRoutes');

// Mock the auth middleware and controllers
jest.mock('../../Middleware/authMiddleware', () => ({
  auth: jest.fn((req, res, next) => {
    req.user = { id: 'student123', role: 'student' };
    next();
  }),
  adminAuth: jest.fn((req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  })
}));

jest.mock('../../Controllers/bookingController', () => ({
  createBooking: jest.fn((req, res) => res.status(201).json({ 
    message: 'Booking created successfully',
    booking: { _id: 'booking123', status: 'pending' }
  })),
  getBookingStatus: jest.fn((req, res) => res.json({ 
    hasActiveBooking: false,
    activeBooking: null 
  })),
  cancelBooking: jest.fn((req, res) => res.json({ 
    message: 'Booking cancelled successfully' 
  })),
  getMyBookings: jest.fn((req, res) => res.json([
    { _id: 'booking1', status: 'approved' },
    { _id: 'booking2', status: 'completed' }
  ])),
  getPendingBookings: jest.fn((req, res) => res.json([
    { _id: 'pending1', status: 'pending' },
    { _id: 'pending2', status: 'pending' }
  ])),
  updateBookingStatus: jest.fn((req, res) => {
    const status = req.params.action === 'approve' ? 'approved' : 'rejected';
    const message = `Booking ${status} successfully`;
    
    return res.json({ 
      message: message,
      booking: { _id: 'booking123', status: status }
    });
  }),
  getAllBookingsForAdmin: jest.fn((req, res) => res.json([
    { _id: 'booking1', status: 'approved' },
    { _id: 'booking2', status: 'pending' },
    { _id: 'booking3', status: 'rejected' }
  ]))
}));

const app = express();
app.use(express.json());
app.use('/api/bookings', bookingRoutes);

describe('Booking Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset auth middleware to default student
    const { auth, adminAuth } = require('../../Middleware/authMiddleware');
    auth.mockImplementation((req, res, next) => {
      req.user = { id: 'student123', role: 'student' };
      next();
    });
    
    adminAuth.mockImplementation((req, res, next) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      next();
    });
  });

  describe('Student Routes', () => {
    describe('GET /api/bookings/status', () => {
      test('should return booking status for authenticated student', async () => {
        const response = await request(app)
          .get('/api/bookings/status')
          .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          hasActiveBooking: false,
          activeBooking: null
        });
      });

      test('should require authentication', async () => {
        const { auth } = require('../../Middleware/authMiddleware');
        auth.mockImplementationOnce((req, res, next) => {
          return res.status(401).json({ message: 'Unauthorized' });
        });

        const response = await request(app)
          .get('/api/bookings/status');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: 'Unauthorized' });
      });
    });

    describe('POST /api/bookings/book/:roomId', () => {
      test('should create booking for student', async () => {
        const response = await request(app)
          .post('/api/bookings/book/room123')
          .set('Authorization', 'Bearer valid-token')
          .send({});

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          message: 'Booking created successfully',
          booking: { _id: 'booking123', status: 'pending' }
        });
      });

      test('should handle booking errors', async () => {
        const { createBooking } = require('../../Controllers/bookingController');
        createBooking.mockImplementationOnce((req, res) => 
          res.status(400).json({ message: 'Room is already occupied' })
        );

        const response = await request(app)
          .post('/api/bookings/book/room123')
          .set('Authorization', 'Bearer valid-token')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Room is already occupied' });
      });
    });

    describe('GET /api/bookings/student/me', () => {
      test('should return student bookings', async () => {
        const response = await request(app)
          .get('/api/bookings/student/me')
          .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([
          { _id: 'booking1', status: 'approved' },
          { _id: 'booking2', status: 'completed' }
        ]);
      });
    });

    describe('DELETE /api/bookings/:bookingId/cancel', () => {
      test('should cancel booking for student', async () => {
        const response = await request(app)
          .delete('/api/bookings/booking123/cancel')
          .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ 
          message: 'Booking cancelled successfully' 
        });
      });

      test('should handle cancellation errors', async () => {
        const { cancelBooking } = require('../../Controllers/bookingController');
        cancelBooking.mockImplementationOnce((req, res) => 
          res.status(404).json({ message: 'Booking not found' })
        );

        const response = await request(app)
          .delete('/api/bookings/invalid-booking/cancel')
          .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Booking not found' });
      });
    });
  });

  describe('Admin Routes', () => {
    beforeEach(() => {
      // Set up admin user for admin routes
      const { auth } = require('../../Middleware/authMiddleware');
      auth.mockImplementation((req, res, next) => {
        req.user = { id: 'admin123', role: 'admin', hostelId: 'hostel123' };
        next();
      });
    });

    describe('GET /api/bookings/admin/pending', () => {
      test('should return pending bookings for admin', async () => {
        const response = await request(app)
          .get('/api/bookings/admin/pending')
          .set('Authorization', 'Bearer admin-token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([
          { _id: 'pending1', status: 'pending' },
          { _id: 'pending2', status: 'pending' }
        ]);
      });

      test('should reject non-admin users', async () => {
        // Set up student user trying to access admin route
        const { auth } = require('../../Middleware/authMiddleware');
        auth.mockImplementationOnce((req, res, next) => {
          req.user = { id: 'student123', role: 'student' };
          next();
        });

        const response = await request(app)
          .get('/api/bookings/admin/pending')
          .set('Authorization', 'Bearer student-token');

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: 'Admin access required' });
      });
    });

    describe('GET /api/bookings/admin/all', () => {
      test('should return all bookings for admin', async () => {
        const response = await request(app)
          .get('/api/bookings/admin/all')
          .set('Authorization', 'Bearer admin-token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([
          { _id: 'booking1', status: 'approved' },
          { _id: 'booking2', status: 'pending' },
          { _id: 'booking3', status: 'rejected' }
        ]);
      });
    });

    describe('PUT /api/bookings/admin/:bookingId/:action', () => {
      test('should approve booking for admin', async () => {
        const response = await request(app)
          .put('/api/bookings/admin/booking123/approve')
          .set('Authorization', 'Bearer admin-token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: 'Booking approved successfully',
          booking: { _id: 'booking123', status: 'approved' }
        });
      });

      test('should reject booking for admin', async () => {
        const response = await request(app)
          .put('/api/bookings/admin/booking123/reject')
          .set('Authorization', 'Bearer admin-token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: 'Booking rejected successfully',
          booking: { _id: 'booking123', status: 'rejected' }
        });
      });

      test('should handle invalid action', async () => {
        const { updateBookingStatus } = require('../../Controllers/bookingController');
        updateBookingStatus.mockImplementationOnce((req, res) => 
          res.status(400).json({ message: 'Invalid action' })
        );

        const response = await request(app)
          .put('/api/bookings/admin/booking123/invalid-action')
          .set('Authorization', 'Bearer admin-token');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid action' });
      });
    });
  });

  describe('Route not found', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/bookings/non-existent-route')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
    });
  });
});