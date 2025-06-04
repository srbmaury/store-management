import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
import { connectTestDb, clearDb, closeTestDb } from '../setup/testDb';

let adminToken, staffToken, storeOwnerId;

beforeAll(async () => {
  await connectTestDb();
});

beforeEach(async () => {
  // Create admin user
  const admin = new User({
    name: 'Admin',
    email: 'admin@sales.com',
    password: 'Password123!',
    role: 'admin',
    storeName: 'SaleStore',
    address: '123 Sales St',
    phone: '9999999999',
  });
  admin.storeOwnerId = admin._id;
  await admin.save();

  storeOwnerId = admin._id;
  adminToken = jwt.sign({ _id: admin._id, storeOwnerId, role: 'admin' }, process.env.JWT_SECRET);

  // Create staff user
  const staff = new User({
    name: 'Staff',
    email: 'staff@sales.com',
    password: 'Password123!',
    role: 'staff',
    phone: '8888888888',
    storeOwnerId
  });
  await staff.save();
  staffToken = jwt.sign({ _id: staff._id, storeOwnerId, role: 'staff' }, process.env.JWT_SECRET);
});

afterEach(async () => {
  await clearDb();
});

afterAll(async () => {
  await closeTestDb();
});

describe('GET /api/stores/available authorization', () => {
  it('should allow access for staff role', async () => {
    const res = await request(app)
      .get('/api/stores/available')
      .set('Authorization', `Bearer ${staffToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should deny access for admin role', async () => {
    const res = await request(app)
      .get('/api/stores/available')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(403);  // or whatever your middleware returns for forbidden

    expect(res.body.message).toMatch(/Access restricted to Staff only/i);
  });

  it('should deny access if no token provided', async () => {
    await request(app)
      .get('/api/stores/available')
      .expect(401);
  });
});
