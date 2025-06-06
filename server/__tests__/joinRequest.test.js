process.env.JWT_SECRET = 'test_jwt_secret';

import request from 'supertest';
import app from '../app';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { connectTestDb, closeTestDb } from '../setup/testDb';
import { adminPayload, staffPayload } from '../setup/testUtils';

describe('Join Request Routes', () => {
    beforeAll(connectTestDb);
    afterAll(closeTestDb);

    let adminToken, staffToken, storeId, joinRequestId;

    it('should register admin and staff, create store, and let staff send join request', async () => {
        // Register Admin
        const adminRes = await request(app).post('/api/auth/register').send(adminPayload);
        expect(adminRes.statusCode).toBe(201);
        adminToken = adminRes.body.token;

        // Register Staff
        const staffRes = await request(app).post('/api/auth/register').send(staffPayload);
        expect(staffRes.statusCode).toBe(201);
        staffToken = staffRes.body.token;

        // Admin creates a store
        const storeRes = await request(app)
            .post('/api/stores')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Test Store', address: '123 Street' });
        expect(storeRes.statusCode).toBe(201);
        storeId = storeRes.body._id;

        // Staff sends join request
        const joinReqRes = await request(app)
            .post('/api/join-requests')
            .set('Authorization', `Bearer ${staffToken}`)
            .send({ storeId });
        expect(joinReqRes.statusCode).toBe(201);
        expect(joinReqRes.body.message).toMatch(/request sent/i);
    });

    it('should not allow duplicate pending join requests', async () => {
        // Try sending join request again with same staff and store
        const res = await request(app)
            .post('/api/join-requests')
            .set('Authorization', `Bearer ${staffToken}`)
            .send({ storeId });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/already sent/i);
    });

    it('staff should get their own join requests', async () => {
        const res = await request(app)
            .get('/api/join-requests/my-requests')
            .set('Authorization', `Bearer ${staffToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('storeId');
        joinRequestId = res.body[0]._id;
    });

    it('admin should get pending join requests for their stores', async () => {
        const res = await request(app)
            .get('/api/join-requests/pending')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('status', 'pending');
    });

    it('admin should approve a join request', async () => {
        const res = await request(app)
            .put(`/api/join-requests/${joinRequestId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'approved' });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/approved/i);
    });

    it('admin should reject a join request', async () => {
        // Create another join request to test rejection
        const secondJoinReqRes = await request(app)
            .post('/api/join-requests')
            .set('Authorization', `Bearer ${staffToken}`)
            .send({ storeId });
        expect(secondJoinReqRes.statusCode).toBe(201);

        const getRequests = await request(app)
            .get('/api/join-requests/my-requests')
            .set('Authorization', `Bearer ${staffToken}`);
        const reqToReject = getRequests.body.find(req => req.status === 'pending');

        const res = await request(app)
            .put(`/api/join-requests/${reqToReject._id}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'rejected' });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/rejected/i);
    });

    it('should reject invalid status update', async () => {
        const res = await request(app)
            .put(`/api/join-requests/${joinRequestId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'invalidstatus' });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/invalid status/i);
    });

    it('non-admin should not update join request status', async () => {
        const res = await request(app)
            .put(`/api/join-requests/${joinRequestId}/status`)
            .set('Authorization', `Bearer ${staffToken}`)
            .send({ status: 'approved' });

        expect(res.statusCode).toBe(403);
    });
});
