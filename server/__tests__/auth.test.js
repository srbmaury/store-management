process.env.JWT_SECRET = 'test_jwt_secret';

import request from 'supertest';
import app from '../app'; // Your Express backend app
import { connectTestDb, clearDb, closeTestDb } from '../setup/testDb';
import { beforeAll, afterEach, afterAll, describe, it, expect } from 'vitest';
import { adminPayload, loginAsAdmin, staffPayload } from '../setup/testUtils';

describe('Auth Routes', () => {
    beforeAll(connectTestDb);
    afterEach(clearDb);
    afterAll(closeTestDb);

    it('should register a new admin user', async () => {
        const res = await request(app).post('/api/auth/register').send(adminPayload);

        expect(res.statusCode).toBe(201);
        expect(res.body.token).toBeDefined();
        expect(res.body.email).toBe(adminPayload.email);
        expect(res.body.role).toBe('admin');
        expect(res.body.name).toBe(adminPayload.name);
    });

    it('should register a new staff user', async () => {
        const res = await request(app).post('/api/auth/register').send(staffPayload);

        expect(res.statusCode).toBe(201);
        expect(res.body.token).toBeDefined();
        expect(res.body.email).toBe(staffPayload.email);
        expect(res.body.role).toBe('staff');
    });

    it('should not register user with missing fields', async () => {
        const res = await request(app).post('/api/auth/register').send({
            name: 'Incomplete User',
            email: 'incomplete@example.com',
            // missing password, phone, role, confirmPassword
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
        await request(app).post('/api/auth/register').send(adminPayload); // First register

        const res = await request(app).post('/api/auth/register').send(adminPayload); // Try duplicate

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('User already exists');
    });

    it('should login an existing user', async () => {
        await request(app).post('/api/auth/register').send(adminPayload);

        const res = await loginAsAdmin();

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.email).toBe(adminPayload.email);
        expect(res.body.role).toBe('admin');
    });

    it('should reject login with wrong password', async () => {
        await request(app).post('/api/auth/register').send(adminPayload);

        const res = await request(app).post('/api/auth/login').send({
            email: adminPayload.email,
            password: 'wrongpassword',
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'nouser@example.com',
            password: 'whatever',
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Invalid credentials');
    });
});
