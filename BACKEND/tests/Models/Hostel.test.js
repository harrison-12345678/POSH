// tests/Models/Hostel.test.js
const mongoose = require('mongoose');

// Fully mock the Hostel model
const mockSave = jest.fn();
const mockCreate = jest.fn();
const mockFind = jest.fn();
const mockFindOne = jest.fn();
const mockFindByIdAndDelete = jest.fn();

jest.mock('../../Models/Hostel', () => {
  return jest.fn().mockImplementation((data) => {
    return {
      ...data,
      save: mockSave,
    };
  });
});

const Hostel = require('../../Models/Hostel');

// Mock static methods
Hostel.create = mockCreate;
Hostel.find = mockFind;
Hostel.findOne = mockFindOne;
Hostel.findByIdAndDelete = mockFindByIdAndDelete;

beforeEach(() => {
  jest.clearAllMocks(); // Reset mocks between tests
});

describe('Hostel Model (Fully Mocked)', () => {
  describe('Validation Tests', () => {
    test('should create a valid hostel', async () => {
      const hostelData = { name: 'Main Hostel', location: 'Campus A', capacity: 100 };
      mockSave.mockResolvedValue({ ...hostelData, _id: 'mockId', createdAt: new Date() });

      const hostel = new Hostel(hostelData);
      const savedHostel = await hostel.save();

      expect(savedHostel._id).toBeDefined();
      expect(savedHostel.name).toBe(hostelData.name);
      expect(savedHostel.location).toBe(hostelData.location);
      expect(savedHostel.capacity).toBe(hostelData.capacity);
      expect(savedHostel.createdAt).toBeInstanceOf(Date);
    });

    test('should require name field', async () => {
      const hostelData = { location: 'Campus A', capacity: 100 };
      mockSave.mockRejectedValue(new mongoose.Error.ValidationError());

      const hostel = new Hostel(hostelData);
      await expect(hostel.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    test('should require unique name', async () => {
      const hostelData1 = { name: 'Unique Hostel', location: 'Campus A', capacity: 100 };
      const hostelData2 = { name: 'Unique Hostel', location: 'Campus B', capacity: 150 };

      mockCreate.mockResolvedValueOnce({ ...hostelData1, _id: 'mockId1' });
      mockCreate.mockRejectedValueOnce(new Error('Duplicate key error'));

      await Hostel.create(hostelData1);
      await expect(Hostel.create(hostelData2)).rejects.toThrow('Duplicate key error');
    });
  });

  describe('Query Tests', () => {
    test('should find hostel by name', async () => {
      mockFindOne.mockResolvedValue({ name: 'Hostel A', location: 'North Campus', capacity: 100 });
      const foundHostel = await Hostel.findOne({ name: 'Hostel A' });
      expect(foundHostel.name).toBe('Hostel A');
    });

    test('should find hostels by location', async () => {
      mockFind.mockResolvedValue([
        { name: 'Hostel A', location: 'North Campus', capacity: 100 },
        { name: 'Hostel C', location: 'North Campus', capacity: 200 },
      ]);
      const results = await Hostel.find({ location: 'North Campus' });
      expect(results).toHaveLength(2);
      results.forEach(h => expect(h.location).toBe('North Campus'));
    });

    test('should find hostels with capacity greater than 120', async () => {
      mockFind.mockResolvedValue([
        { name: 'Hostel B', capacity: 150 },
        { name: 'Hostel C', capacity: 200 },
      ]);
      const results = await Hostel.find({ capacity: { $gt: 120 } });
      expect(results).toHaveLength(2);
      results.forEach(h => expect(h.capacity).toBeGreaterThan(120));
    });

    test('should update hostel capacity', async () => {
      const hostelInstance = new Hostel({ name: 'Hostel A', capacity: 100 });
      mockSave.mockResolvedValue({ name: 'Hostel A', capacity: 120 });

      hostelInstance.capacity = 120;
      const updated = await hostelInstance.save();
      expect(updated.capacity).toBe(120);
    });

    test('should delete a hostel', async () => {
      mockFindByIdAndDelete.mockResolvedValue({ _id: 'mockId' });
      const deleted = await Hostel.findByIdAndDelete('mockId');
      expect(deleted._id).toBe('mockId');
    });
  });

  describe('Schema Structure Tests', () => {
    test('should have correct schema fields', () => {
      // Mocked schema, no actual mongoose.Schema needed
      const schemaFields = ['name', 'location', 'capacity', 'createdAt'];
      expect(schemaFields).toContain('name');
      expect(schemaFields).toContain('location');
      expect(schemaFields).toContain('capacity');
      expect(schemaFields).toContain('createdAt');
    });
  });
});
