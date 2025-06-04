import request from 'supertest';
import app from '../app';
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { connectTestDb, clearDb, closeTestDb } from '../setup/testDb';
const User = require('../models/User');
const Inventory = require('../models/Inventory');
import jwt from 'jsonwebtoken';

let token;
let storeOwnerId;
describe('Inventory Routes', () => {
    beforeAll(async () => {
        await connectTestDb();
    });

    beforeEach(async () => {
        const adminUser = new User({
            name: 'Test Admin',
            email: 'admin@test.com',
            password: 'Password123!',
            phone: '1234567890',
            role: 'admin',
        });
        adminUser.storeOwnerId = adminUser._id;
        storeOwnerId = adminUser._id;
        await adminUser.save();

        token = jwt.sign(
            { _id: adminUser._id, storeOwnerId, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
    });

    afterEach(async () => {
        await clearDb([]);
    });

    afterAll(async () => {
        await closeTestDb();
    });

    it('should create an inventory item', async () => {
        const res = await request(app)
            .post('/api/inventory')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Item 1',
                category: 'Category A',
                price: 100,
                stock: 10,
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe('Item 1');
        expect(res.body.storeOwnerId).toBe(storeOwnerId.toString());
    });

    it('should fail creating inventory without auth', async () => {
        const res = await request(app)
            .post('/api/inventory')
            .send({
                name: 'Item 1',
                category: 'Category A',
                price: 100,
                stock: 10,
            });

        expect(res.statusCode).toBe(401);
    });

    it('should get inventory list with pagination and filters', async () => {
        // Seed multiple items
        await Inventory.insertMany([
            { name: 'Apple', sku: 'SKU1', category: 'Fruit', price: 5, stock: 100, storeOwnerId },
            { name: 'Banana', sku: 'SKU2', category: 'Fruit', price: 2, stock: 200, storeOwnerId },
            { name: 'Carrot', sku: 'SKU3', category: 'Vegetable', price: 3, stock: 50, storeOwnerId },
        ]);

        const res = await request(app)
            .get('/api/inventory')
            .set('Authorization', `Bearer ${token}`)
            .query({ page: 1, limit: 2, search: 'a', category: 'Fruit', minStock: 10, sortBy: 'price', order: 'asc' });

        expect(res.statusCode).toBe(200);
        expect(res.body.items.length).toBeLessThanOrEqual(2);
        expect(res.body.total).toBe(2);
        expect(res.body.page).toBe(1);
    });

    it('should get single inventory item', async () => {
        const item = await Inventory.create({
            name: 'Item Single',
            category: 'Test',
            price: 10,
            stock: 5,
            storeOwnerId,
        });

        const res = await request(app)
            .get(`/api/inventory/${item._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Item Single');
    });

    it('should update inventory item', async () => {
        const item = await Inventory.create({
            name: 'Item Update',
            category: 'Test',
            price: 10,
            stock: 5,
            storeOwnerId,
        });

        const res = await request(app)
            .put(`/api/inventory/${item._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ price: 15, stock: 10 });

        expect(res.statusCode).toBe(200);
        expect(res.body.price).toBe(15);
        expect(res.body.stock).toBe(10);
    });

    it('should delete inventory item', async () => {
        const item = await Inventory.create({
            name: 'Item Delete',
            category: 'Test',
            price: 10,
            stock: 5,
            storeOwnerId,
        });

        const res = await request(app)
            .delete(`/api/inventory/${item._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Item deleted');
    });

    it('should not access inventory with invalid token', async () => {
        const res = await request(app)
            .get('/api/inventory')
            .set('Authorization', `Bearer invalidtoken`);

        expect(res.statusCode).toBe(401);
    });

    it('should deny staff user from creating inventory item (adminOnly)', async () => {
        const staffUser = new User({
            name: 'Staff User',
            email: 'staff@test.com',
            password: 'Password123!',
            phone: '9876543210',
            role: 'staff',
        });
        staffUser.storeOwnerId = storeOwnerId;
        await staffUser.save();

        const staffToken = jwt.sign(
            { _id: staffUser._id, storeOwnerId, role: 'staff' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const res = await request(app)
            .post('/api/inventory')
            .set('Authorization', `Bearer ${staffToken}`)
            .send({
                name: 'Unauthorized Item',
                category: 'Fail',
                price: 99,
                stock: 1,
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Access restricted to Admins only');
    });

    it('should deny staff user from updating inventory item (adminOnly)', async () => {
        const item = await Inventory.create({
            name: 'Update Test Item',
            category: 'Test',
            price: 20,
            stock: 8,
            storeOwnerId,
        });

        const staffUser = new User({
            name: 'Staff User',
            email: 'staff2@test.com',
            password: 'Password123!',
            phone: '9876543210',
            role: 'staff',
        });
        staffUser.storeOwnerId = storeOwnerId;
        await staffUser.save();

        const staffToken = jwt.sign(
            { _id: staffUser._id, storeOwnerId, role: 'staff' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const res = await request(app)
            .put(`/api/inventory/${item._id}`)
            .set('Authorization', `Bearer ${staffToken}`)
            .send({ price: 999 });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Access restricted to Admins only');
    });
});
