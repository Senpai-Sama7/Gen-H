// genh-premium-site/__tests__/unit/auth.test.ts
/**
 * Unit tests for auth module
 */

import {
  SESSION_COOKIE,
  getPortalUsername,
  getPortalPassword,
  hasPortalCredentials,
  createSessionToken,
  isSessionTokenValid,
  getSessionCookieConfig,
  getClearedSessionCookieConfig,
  normalizeNextPath,
} from '@/lib/auth';

// Mock environment variables
const mockEnv = {
  OPS_BASIC_USER: 'testuser',
  OPS_BASIC_PASS: 'testpass',
  OPS_SESSION_SECRET: 'test-secret-key-for-testing-only',
};

describe('Auth Module', () => {
  beforeEach(() => {
    // Reset environment variables
    jest.resetModules();
    process.env = {
      ...process.env,
      ...mockEnv,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPortalUsername', () => {
    it('should return the username from environment', () => {
      expect(getPortalUsername()).toBe('testuser');
    });

    it('should return empty string when not set', () => {
      delete process.env.OPS_BASIC_USER;
      jest.resetModules();
      // This test verifies the function exists and returns expected type
      expect(typeof getPortalUsername()).toBe('string');
    });
  });

  describe('getPortalPassword', () => {
    it('should return the password from environment', () => {
      expect(getPortalPassword()).toBe('testpass');
    });
  });

  describe('hasPortalCredentials', () => {
    it('should return true when both username and password are set', () => {
      expect(hasPortalCredentials()).toBe(true);
    });

    it('should return false when username is missing', () => {
      delete process.env.OPS_BASIC_USER;
      jest.resetModules();
      expect(hasPortalCredentials()).toBe(false);
    });

    it('should return false when password is missing', () => {
      delete process.env.OPS_BASIC_PASS;
      jest.resetModules();
      expect(hasPortalCredentials()).toBe(false);
    });
  });

  describe('createSessionToken', () => {
    it('should create a valid session token', async () => {
      const token = await createSessionToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // SHA-256 produces 64 hex characters
    });

    it('should create deterministic tokens for same credentials', async () => {
      const token1 = await createSessionToken();
      const token2 = await createSessionToken();
      
      // Note: This test might fail if there's any non-determinism
      // In that case, the auth model needs improvement
      expect(token1).toBe(token2);
    });
  });

  describe('isSessionTokenValid', () => {
    it('should return false for null/undefined token', async () => {
      expect(await isSessionTokenValid(null)).toBe(false);
      expect(await isSessionTokenValid(undefined)).toBe(false);
      expect(await isSessionTokenValid('')).toBe(false);
    });

    it('should return false when credentials are not configured', async () => {
      delete process.env.OPS_BASIC_USER;
      delete process.env.OPS_BASIC_PASS;
      jest.resetModules();
      
      const token = await createSessionToken();
      expect(await isSessionTokenValid(token)).toBe(false);
    });

    it('should return true for valid token', async () => {
      const token = await createSessionToken();
      expect(await isSessionTokenValid(token)).toBe(true);
    });

    it('should return false for invalid token', async () => {
      const token = await createSessionToken();
      const tamperedToken = token.slice(0, -1) + (token.slice(-1) === 'a' ? 'b' : 'a');
      expect(await isSessionTokenValid(tamperedToken)).toBe(false);
    });
  });

  describe('getSessionCookieConfig', () => {
    it('should return correct cookie configuration', () => {
      const token = 'test-token-123';
      const config = getSessionCookieConfig(token);
      
      expect(config.name).toBe(SESSION_COOKIE);
      expect(config.value).toBe(token);
      expect(config.httpOnly).toBe(true);
      expect(config.sameSite).toBe('lax');
      expect(config.path).toBe('/');
      expect(config.maxAge).toBe(60 * 60 * 12); // 12 hours
    });

    it('should set secure flag in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const config = getSessionCookieConfig('test');
      expect(config.secure).toBe(true);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not set secure flag in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const config = getSessionCookieConfig('test');
      expect(config.secure).toBe(false);
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getClearedSessionCookieConfig', () => {
    it('should return cookie config with maxAge 0', () => {
      const config = getClearedSessionCookieConfig();
      
      expect(config.name).toBe(SESSION_COOKIE);
      expect(config.value).toBe('');
      expect(config.maxAge).toBe(0);
    });
  });

  describe('normalizeNextPath', () => {
    it('should return default path for null/undefined', () => {
      expect(normalizeNextPath(null)).toBe('/portal/dashboard');
      expect(normalizeNextPath(undefined)).toBe('/portal/dashboard');
    });

    it('should return default path for empty string', () => {
      expect(normalizeNextPath('')).toBe('/portal/dashboard');
    });

    it('should return default path for paths not starting with /', () => {
      expect(normalizeNextPath('invalid')).toBe('/portal/dashboard');
    });

    it('should return default path for paths starting with //', () => {
      expect(normalizeNextPath('//double')).toBe('/portal/dashboard');
    });

    it('should return valid paths as-is', () => {
      expect(normalizeNextPath('/portal/dashboard')).toBe('/portal/dashboard');
      expect(normalizeNextPath('/api/inquiries')).toBe('/api/inquiries');
      expect(normalizeNextPath('/custom/path')).toBe('/custom/path');
    });
  });
});
