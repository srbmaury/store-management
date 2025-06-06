// test/testUtils.js

import request from 'supertest';
import app from '../app'; // adjust path as needed

// Admin and Staff payloads
export const adminPayload = {
	name: 'Admin User',
	email: 'admin@example.com',
	password: 'admin123',
	confirmPassword: 'admin123',
	phone: '9876543210',
	role: 'admin',
};

export const staffPayload = {
	name: 'Staff User',
	email: 'staff@example.com',
	password: 'staff123',
	confirmPassword: 'staff123',
	phone: '9876543210',
	role: 'staff',
};

export const itemPayload = {
	name: 'Test Item',
	sku: 'TEST123',
	category: 'Electronics',
	price: 100,
	stock: 50,
};

// Login helper for Admin
export async function loginAsAdmin() {
	const res = await request(app).post('/api/auth/login').send({
		email: adminPayload.email,
		password: adminPayload.password,
	});

	return res;
}

// Login helper for Staff
export async function loginAsStaff() {
	const res = await request(app).post('/api/auth/login').send({
		email: staffPayload.email,
		password: staffPayload.password,
	});

	return res;
}
