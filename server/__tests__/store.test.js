process.env.JWT_SECRET = 'test_jwt_secret';

import request from 'supertest';
import app from '../app';
import { connectTestDb, clearDb, closeTestDb } from '../setup/testDb';
import { beforeAll, beforeEach, afterAll, describe, it, expect } from 'vitest';
import { adminPayload, staffPayload } from '../setup/testUtils';

describe('Store Routes', () => {
	beforeAll(connectTestDb);
	afterAll(closeTestDb);

	let adminToken, staffToken, storeId;

	beforeEach(async () => {
		// Clear DB collections before each test
		await clearDb();

		// 1. Register and login admin
		const adminRes = await request(app).post('/api/auth/register').send(adminPayload);
		adminToken = adminRes.body.token;

		// 2. Register and login staff
		const staffRes = await request(app).post('/api/auth/register').send(staffPayload);
		staffToken = staffRes.body.token;

		// 3. Define store payload (no owner, no staff)
		const storePayload = {
			name: 'Test Store',
			address: 'Test Address',
		};

		// 4. Send POST request with Bearer token
		const storeRes = await request(app)
			.post('/api/stores')
			.set('Authorization', `Bearer ${adminToken}`)
			.send(storePayload);

		// 5. Get store ID
		storeId = storeRes.body._id.toString();
	});

	it('admin should be able to create a store', async () => {
		const res = await request(app)
			.post('/api/stores')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ name: 'Test Store', address: '123 Street' });

		expect(res.statusCode).toBe(201);
		expect(res.body.name).toBe('Test Store');
		expect(res.body.address).toBe('123 Street');
		expect(res.body.owner).toBeDefined();
		storeId = res.body._id;
	});

	it('staff should not be able to create a store', async () => {
		const res = await request(app)
			.post('/api/stores')
			.set('Authorization', `Bearer ${staffToken}`)
			.send({ name: 'Invalid Store', address: 'Nowhere' });

		expect(res.statusCode).toBe(403);
		expect(res.body.message).toMatch(/Access restricted to Admins only/i);
	});

	it('admin should fetch their own stores via /my-stores', async () => {
		const res = await request(app)
			.get('/api/stores/my-stores')
			.set('Authorization', `Bearer ${adminToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body.stores.length).toBeGreaterThan(0);
		expect(res.body.stores[0]._id).toBe(storeId);
	});

	it('staff should see list of all stores', async () => {
		const res = await request(app)
			.get('/api/stores')
			.set('Authorization', `Bearer ${staffToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body.length).toBeGreaterThan(0);
		expect(res.body[0].name).toBe('Test Store');
	});

	it('staff should be able to join a store', async () => {
		const res = await request(app)
			.post(`/api/stores/${storeId}/join`)
			.set('Authorization', `Bearer ${staffToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body.message).toMatch(/joined store successfully/i);
		expect(res.body.storeId).toBe(storeId);
	});

	it('should not allow staff to join same store twice', async () => {
		// First join - should succeed
		const firstJoin = await request(app)
			.post(`/api/stores/${storeId}/join`)
			.set('Authorization', `Bearer ${staffToken}`);

		expect(firstJoin.statusCode).toBe(200); // optional sanity check

		// Second join - should fail
		const res = await request(app)
			.post(`/api/stores/${storeId}/join`)
			.set('Authorization', `Bearer ${staffToken}`);

		expect(res.statusCode).toBe(400);
		expect(res.body.message).toMatch(/already joined/i);
	});

	it('should fetch individual store data with /:id', async () => {
		const res = await request(app)
			.post(`/api/stores/${storeId}`)
			.set('Authorization', `Bearer ${adminToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body.name).toBe('Test Store');
		expect(res.body.address).toBe('Test Address');
	});
});
