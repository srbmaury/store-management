process.env.JWT_SECRET = 'test_jwt_secret';

import request from 'supertest';
import app from '../app'; // Your Express app entry point
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { connectTestDb, clearDb, closeTestDb } from '../setup/testDb';
import Inventory from '../models/Inventory';
import { adminPayload } from '../setup/testUtils';

let token, storeOwnerId, storeId, item1;

beforeAll(async () => {
    await connectTestDb();
});

beforeEach(async () => {
    // Clear DB collections before each test
    await clearDb();

    // 1. Register and login admin
    const adminRes = await request(app).post('/api/auth/register').send(adminPayload);
    storeOwnerId = adminRes.body._id;
    token = adminRes.body.token;

    // 2. Define store payload (no owner, no staff)
    const storePayload = {
        name: 'Test Store',
        address: 'Test Address',
    };

    // 3. Send POST request with Bearer token
    const storeRes = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${token}`)
        .send(storePayload);

    // 4. Get store ID
    storeId = storeRes.body._id.toString();

    // Step 5: Define inventory payload (DO NOT include req.user manually)
    const inventoryPayload = {
        name: 'Test Item 1',
        category: 'Category 1',
        stock: 10,
        price: 100,
        storeId: storeId,
    };

    // Step 6: Make POST request with Authorization header
    const itemRes = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${token}`)
        .send(inventoryPayload);

    // Step 7: set item
    item1 = itemRes.body;
});

afterEach(async () => {
    await clearDb();
});

afterAll(async () => {
    await closeTestDb();
});

describe('POST /api/sales', () => {
    it('should create a sale and reduce stock', async () => {
        const saleData = {
            storeId,
            customerName: 'John Doe',
            items: [
                {
                    item: item1._id.toString(),
                    quantity: 3,
                    price: 100,
                },
            ],
            totalAmount: 300,
        };

        const res = await request(app)
            .post('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .send(saleData);

        expect(res.statusCode).toBe(201);
        expect(res.body.customerName).toBe('John Doe');
        expect(res.body.items.length).toBe(1);

        // Check that stock reduced by 3
        const updatedItem = await Inventory.findById(item1._id);
        expect(updatedItem.stock).toBe(7);
    });

    it('should return 400 if item stock is insufficient', async () => {
        const saleData = {
            storeId,
            customerName: 'Jane Doe',
            items: [
                {
                    item: item1._id.toString(),
                    quantity: 20, // more than available stock
                    price: 100,
                },
            ],
            totalAmount: 2000,
        };

        const res = await request(app)
            .post('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .send(saleData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/not enough stock/i);
    });

    it('should return 400 if items array is empty', async () => {
        const saleData = {
            storeId,
            customerName: 'No Items',
            items: [],
            totalAmount: 0,
        };

        const res = await request(app)
            .post('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .send(saleData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/at least one item/i);
    });

    it('should return 401 if no token provided', async () => {
        const saleData = {
            storeId,
            customerName: 'Unauthorized',
            items: [
                {
                    item: item1._id.toString(),
                    quantity: 1,
                    price: 100,
                },
            ],
            totalAmount: 100,
        };

        const res = await request(app).post('/api/sales').send(saleData);

        expect(res.statusCode).toBe(401);
    });
});
