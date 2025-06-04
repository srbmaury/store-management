const request = require('supertest');
const app = require('../app');
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { connectTestDb, clearDb, closeTestDb } from '../setup/testDb';
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Sale = require('../models/Sale');
const jwt = require('jsonwebtoken');

let token, storeOwnerId, item1;

beforeAll(async () => {
    await connectTestDb();
});

beforeEach(async () => {
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
    token = jwt.sign({ _id: admin._id, storeOwnerId, role: 'admin' }, process.env.JWT_SECRET);

    item1 = await Inventory.create({
        name: 'Test Item',
        category: 'TestCat',
        price: 100,
        stock: 50,
        storeOwnerId,
    });
});

afterEach(async () => await clearDb());

afterAll(async () => await closeTestDb());

describe('POST /api/sales', () => {
    it('should create a sale and reduce stock', async () => {
        const saleData = {
            customerName: 'John Doe',
            totalAmount: 200,
            items: [
                {
                    item: item1._id.toString(),
                    quantity: 2,
                    price: 100,
                },
            ],
        };

        const res = await request(app)
            .post('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .send(saleData);

        expect(res.statusCode).toBe(201);
        expect(res.body.customerName).toBe('John Doe');
        expect(res.body.items.length).toBe(1);

        const updatedItem = await Inventory.findById(item1._id);
        expect(updatedItem.stock).toBe(48); // 50 - 2
    });

    it('should return error if item stock is insufficient', async () => {
        const res = await request(app)
            .post('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .send({
                customerName: 'Jane',
                totalAmount: 100,
                items: [{ item: item1._id.toString(), quantity: 9999, price: 100 }],
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/Not enough stock/i);
    });

    it('should return 401 if no token', async () => {
        const res = await request(app).post('/api/sales').send({});
        expect(res.statusCode).toBe(401);
    });
});
