const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');
const JoinRequest = require('../models/JoinRequest');
const Inventory = require('../models/Inventory');
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { connectTestDb, clearDb, closeTestDb } from '../setup/testDb';

let admin, staff, storeOwnerId, adminToken, staffToken;

beforeAll(async () => {
    await connectTestDb();
});

beforeEach(async () => {
    // Create admin user (store owner)
    admin = new User({
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
    staff = new User({
        name: 'Staff',
        email: 'staff@sales.com',
        password: 'Password123!',
        role: 'staff',
        phone: '8888888888',
        storeOwnerId
    });
    await staff.save();
    staffToken = jwt.sign({ _id: staff._id, storeOwnerId, role: 'staff' }, process.env.JWT_SECRET);

    // Create inventory for the store owner (optional, if needed for your flow)
    await Inventory.create({
        name: 'Test Item',
        category: 'TestCat',
        price: 100,
        stock: 50,
        storeOwnerId,
    });
});

afterEach(async () => {
    await clearDb();
});

afterAll(async () => {
    await closeTestDb();
});

describe('JoinRequest API', () => {
    describe('POST /api/join-requests', () => {
        it('should send a new join request from staff to store owner', async () => {
            const res = await request(app)
                .post('/api/join-requests')
                .set('Authorization', `Bearer ${staffToken}`)
                .send({ storeOwnerId: storeOwnerId.toString() });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Request sent successfully');

            const saved = await JoinRequest.findOne({ staffId: staff._id, storeOwnerId });
            expect(saved).toBeTruthy();
            expect(saved.status).toBe('pending');
        });

        it('should not allow sending duplicate pending requests', async () => {
            // Send first request
            await JoinRequest.create({ staffId: staff._id, storeOwnerId, status: 'pending' });

            const res = await request(app)
                .post('/api/join-requests')
                .set('Authorization', `Bearer ${staffToken}`)
                .send({ storeOwnerId: storeOwnerId.toString() });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/already sent a request/i);
        });
    });

    describe('GET /api/join-requests/my-requests', () => {
        it('should get all join requests sent by staff', async () => {
            await JoinRequest.create({ staffId: staff._id, storeOwnerId, status: 'pending' });

            const res = await request(app)
                .get('/api/join-requests/my-requests')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
            expect(res.body[0].storeOwnerId.storeName).toBe('SaleStore');
        });
    });

    describe('GET /api/join-requests/pending', () => {
        it('should get all pending join requests for the store owner', async () => {
            await JoinRequest.create({ staffId: staff._id, storeOwnerId: admin._id, status: 'pending' });

            const res = await request(app)
                .get('/api/join-requests/pending')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
            expect(res.body[0].staffId.email).toBe('staff@sales.com');
        });
    });

    describe('PUT /api/join-requests/:requestId/status', () => {
        it('should update join request status to approved by store owner', async () => {
            const joinReq = await JoinRequest.create({ staffId: staff._id, storeOwnerId: admin._id, status: 'pending' });

            const res = await request(app)
                .put(`/api/join-requests/${joinReq._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'approved' });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Request approved');

            const updated = await JoinRequest.findById(joinReq._id);
            expect(updated.status).toBe('approved');
        });

        it('should not allow non-store-owner to update request status', async () => {
            const joinReq = await JoinRequest.create({ staffId: staff._id, storeOwnerId: admin._id, status: 'pending' });

            const res = await request(app)
                .put(`/api/join-requests/${joinReq._id}/status`)
                .set('Authorization', `Bearer ${staffToken}`) // staff tries to approve
                .send({ status: 'approved' });

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toMatch(/Access restricted to Admins only/i);
        });

        it('should return 400 for invalid status update', async () => {
            const joinReq = await JoinRequest.create({ staffId: staff._id, storeOwnerId: admin._id, status: 'pending' });

            const res = await request(app)
                .put(`/api/join-requests/${joinReq._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'invalidstatus' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/invalid status/i);
        });

        it('should return 404 if join request not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .put(`/api/join-requests/${fakeId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'approved' });

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toMatch(/not found/i);
        });

        it('should not allow staff from another store to send join request to unrelated storeOwnerId', async () => {
            const otherAdmin = new User({
                name: 'Other Admin',
                email: 'other@admin.com',
                password: 'Pass123!',
                phone: '7777777777',
                storeName: 'OtherStore',
                role: 'admin',
            });

            otherAdmin.storeOwnerId = otherAdmin._id;
            await otherAdmin.save();

            const joinReq = await JoinRequest.create({ staffId: staff._id, storeOwnerId: admin._id, status: 'pending' });
            const otherAdminToken = jwt.sign({ _id: otherAdmin._id, storeOwnerId: otherAdmin.storeOwnerId, role: 'admin' }, process.env.JWT_SECRET);

            const res = await request(app)
                .put(`/api/join-requests/${joinReq._id}/status`)
                .set('Authorization', `Bearer ${otherAdminToken}`)
                .send({ status: 'approved' });

            // Depending on your controller logic, might be 400 or 403
            expect(res.statusCode).toBe(403);
            expect(res.body.message).toMatch(/Not authorized/i);
        });
    });
});
