import request from 'supertest';
import app from '../index.js'; // your Express app

export const loginAsAdmin = async () => {
  await request(app).post('/api/auth/register').send({
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin',
  });

  const res = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com',
    password: 'admin123',
  });

  return res.body.token;
};
