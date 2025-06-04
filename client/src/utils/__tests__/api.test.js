// src/utils/__tests__/api.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import API from '../api';

const token = 'test-token-123';
vi.stubGlobal('localStorage', {
  getItem: vi.fn(() => JSON.stringify({ token })),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
});

describe('API axios instance', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should add Authorization header when token exists in localStorage', async () => {
    // Get the interceptor directly
    const interceptor = API.interceptors.request.handlers[0].fulfilled;

    const config = await interceptor({ headers: {} });

    expect(config.headers.Authorization).toBe(`Bearer ${token}`);
  });

  it('should not add Authorization header if no token in localStorage', async () => {
    vi.spyOn(localStorage, 'getItem').mockReturnValue(null);

    const interceptor = API.interceptors.request.handlers[0].fulfilled;

    const config = await interceptor({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });

  it('should not add Authorization header if token missing in stored user', async () => {
    vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify({}));

    const interceptor = API.interceptors.request.handlers[0].fulfilled;

    const config = await interceptor({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });
});
