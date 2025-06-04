import request from 'supertest';
import app from '../app';
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { connectTestDb, clearDb, closeTestDb } from '../setup/testDb';
const User = require('../models/User');

describe('Auth Routes', () => {
    beforeAll(async () => {
        await connectTestDb();
    });

    afterEach(async () => {
        await clearDb();
    });

    afterAll(async () => {
        await closeTestDb();
    });

    const adminPayload = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        confirmPassword: 'admin123',
        phone: '9876543210',
        storeName: 'Test Store',
        address: '123 Market Street',
        role: 'admin',
    };

    const staffPayload = {
        name: 'Staff User',
        email: 'staff@example.com',
        password: 'staff123',
        confirmPassword: 'staff123',
        phone: '9876543210',
        role: 'staff',
    };

    it('should register a new admin user', async () => {
        const res = await request(app).post('/api/auth/register').send(adminPayload);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.email).toBe(adminPayload.email);
        expect(res.body.role).toBe('admin');
    });

    it('should register a new staff user', async () => {
        const res = await request(app).post('/api/auth/register').send(staffPayload);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.email).toBe(staffPayload.email);
        expect(res.body.role).toBe('staff');
    });

    it('should not register user with missing fields', async () => {
        const res = await request(app).post('/api/auth/register').send({
            name: 'Incomplete User',
            email: 'incomplete@example.com',
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Please fill all required fields');
    });

    it('should not register user with mismatched passwords', async () => {
        const res = await request(app).post('/api/auth/register').send({
            name: 'Mismatched User',
            email: 'mismatched@example.com',
            phone: '1234567890',
            role: 'staff',
            password: 'password123',
            confirmPassword: 'differentPassword',
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Password and Confirm Password do not match');
    });

    it('should not register user with existing email', async () => {
        await request(app).post('/api/auth/register').send(adminPayload);

        const res = await request(app).post('/api/auth/register').send(adminPayload);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('User already exists');
    });

    it('should login an existing user', async () => {
        await request(app).post('/api/auth/register').send(adminPayload);

        const res = await request(app).post('/api/auth/login').send({
            email: adminPayload.email,
            password: adminPayload.password,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.email).toBe(adminPayload.email);
    });

    it('should reject login with wrong password', async () => {
        await request(app).post('/api/auth/register').send(adminPayload);

        const res = await request(app).post('/api/auth/login').send({
            email: adminPayload.email,
            password: 'wrongpass',
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Invalid credentials');
    });

    it('should reject /join route for admin user (staffOnly)', async () => {
        const adminRes = await request(app).post('/api/auth/register').send(adminPayload);

        const res = await request(app)
            .post('/api/auth/join')
            .set('Authorization', `Bearer ${adminRes.body.token}`)
            .send({}); // your controller might expect body

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Access restricted to Staff only');
    });

    it('should allow /join route for staff user', async () => {
        const staffRes = await request(app).post('/api/auth/register').send(staffPayload);

        const res = await request(app)
            .post('/api/auth/join')
            .set('Authorization', `Bearer ${staffRes.body.token}`)
            .send({}); // adjust this as per your join logic

        // Status code might be 200, 201, or 400 if the body is invalid
        expect([200, 201, 400]).toContain(res.statusCode);
    });

    it('should allow a staff user to join a store successfully', async () => {
        // Register admin (store owner)
        const adminRes = await request(app).post('/api/auth/register').send(adminPayload);
        const storeOwnerId = adminRes.body._id;

        // Register staff
        const staffRes = await request(app).post('/api/auth/register').send(staffPayload);
        const staffToken = staffRes.body.token;

        // Staff joins the store
        const res = await request(app)
            .post('/api/auth/join')
            .set('Authorization', `Bearer ${staffToken}`)
            .send({ storeOwnerId });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Successfully joined the store');
    });

    it('should return 400 if the user is already part of the store', async () => {
        // Register an admin (store owner)
        const adminRes = await request(app).post('/api/auth/register').send(adminPayload);
        const storeOwnerId = adminRes.body._id;

        // Register a staff and manually assign them to the store
        const staffRes = await request(app).post('/api/auth/register').send(staffPayload);
        const staffUser = await User.findOne({ email: staffPayload.email });
        staffUser.storeOwnerId = storeOwnerId;
        await staffUser.save();

        // Try to join the same store again
        const res = await request(app)
            .post('/api/auth/join')
            .set('Authorization', `Bearer ${staffRes.body.token}`)
            .send({ storeOwnerId });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('You are already part of this store');
    });
});
