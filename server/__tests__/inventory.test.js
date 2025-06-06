process.env.JWT_SECRET = 'test_jwt_secret';

import request from 'supertest';
import app from '../app';
import { connectTestDb, clearDb, closeTestDb } from '../setup/testDb';
import { beforeEach, beforeAll, afterEach, afterAll, describe, it, expect } from 'vitest';
import { adminPayload, staffPayload, itemPayload, loginAsAdmin } from '../setup/testUtils';
import User from '../models/User';
import Store from '../models/Store';

describe('Inventory Routes', () => {
	beforeAll(connectTestDb);
	afterEach(clearDb);
	afterAll(closeTestDb);

	let adminToken, staffToken, storeId;

	beforeEach(async () => {
		// Register admin and staff
		await request(app).post('/api/auth/register').send(adminPayload);
		await request(app).post('/api/auth/register').send(staffPayload);

		const adminRes = await loginAsAdmin();
		adminToken = adminRes.body.token;

		const staffRes = await request(app).post('/api/auth/login').send({
			email: staffPayload.email,
			password: staffPayload.password,
		});
		staffToken = staffRes.body.token;

		// Create store with admin as owner and staff added
		const adminUser = await User.findOne({ email: adminPayload.email });
		const staffUser = await User.findOne({ email: staffPayload.email });

		const store = await Store.create({
			name: 'Test Store',
			owner: adminUser._id,
            address: 'Test Address',
			staff: [staffUser._id],
		});
		storeId = store._id;
	});

	it('should allow admin to create an inventory item', async () => {
		const res = await request(app)
			.post('/api/inventory')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ ...itemPayload, storeId });

		expect(res.statusCode).toBe(201);
		expect(res.body.name).toBe(itemPayload.name);
	});

	it('should not allow staff to create an inventory item', async () => {
		const res = await request(app)
			.post('/api/inventory')
			.set('Authorization', `Bearer ${staffToken}`)
			.send({ ...itemPayload, storeId });

		expect(res.statusCode).toBe(403); // Forbidden
	});

	it('should allow admin and staff to get inventory items', async () => {
		await request(app)
			.post('/api/inventory')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ ...itemPayload, storeId });

		const resAdmin = await request(app)
			.get('/api/inventory')
			.set('Authorization', `Bearer ${adminToken}`)
			.query({ storeId });

		expect(resAdmin.statusCode).toBe(200);
		expect(resAdmin.body.items.length).toBe(1);

		const resStaff = await request(app)
			.get('/api/inventory')
			.set('Authorization', `Bearer ${staffToken}`)
			.query({ storeId });

		expect(resStaff.statusCode).toBe(200);
		expect(resStaff.body.items.length).toBe(1);
	});

	it('should allow admin to update an inventory item', async () => {
		const itemRes = await request(app)
			.post('/api/inventory')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ ...itemPayload, storeId });

		const res = await request(app)
			.put(`/api/inventory/${itemRes.body._id}`)
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ price: 200 });

		expect(res.statusCode).toBe(200);
		expect(res.body.price).toBe(200);
	});

	it('should not allow staff to update an inventory item', async () => {
		const itemRes = await request(app)
			.post('/api/inventory')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ ...itemPayload, storeId });

		const res = await request(app)
			.put(`/api/inventory/${itemRes.body._id}`)
			.set('Authorization', `Bearer ${staffToken}`)
			.send({ price: 999 });

		expect(res.statusCode).toBe(403); // Forbidden
	});

	it('should allow admin to delete an inventory item', async () => {
		const itemRes = await request(app)
			.post('/api/inventory')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ ...itemPayload, storeId });

		const res = await request(app)
			.delete(`/api/inventory/${itemRes.body._id}`)
			.set('Authorization', `Bearer ${adminToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body.message).toBe('Item deleted');
	});

	it('should not allow staff to delete an inventory item', async () => {
		const itemRes = await request(app)
			.post('/api/inventory')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ ...itemPayload, storeId });

		const res = await request(app)
			.delete(`/api/inventory/${itemRes.body._id}`)
			.set('Authorization', `Bearer ${staffToken}`);

		expect(res.statusCode).toBe(403);
	});
});
