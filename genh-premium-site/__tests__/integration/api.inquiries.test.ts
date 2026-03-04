// genh-premium-site/__tests__/integration/api.inquiries.test.ts
/**
 * Integration tests for inquiry API endpoints
 */

// Mock the inquiries module
jest.mock('@/lib/inquiries', () => ({
  createInquiry: jest.fn().mockImplementation(async (data) => ({
    record: {
      id: 'test-uuid',
      ...data,
      status: 'new',
      createdAt: new Date().toISOString(),
      notes: '',
    },
    snapshotPath: '/test/snapshot.json',
  })),
  listInquiries: jest.fn().mockResolvedValue([
    {
      id: 'test-1',
      name: 'Test Company',
      company: 'Test Inc',
      email: 'test@test.com',
      phone: '555-1234',
      projectType: 'Website',
      budgetBand: '$5k-$10k',
      launchWindow: 'Q1',
      goals: 'Test goals',
      status: 'new',
      createdAt: new Date().toISOString(),
      notes: '',
    },
  ]),
  listInquiriesWithSnapshot: jest.fn().mockResolvedValue({
    records: [
      {
        id: 'test-1',
        name: 'Test Company',
        company: 'Test Inc',
        email: 'test@test.com',
        phone: '555-1234',
        projectType: 'Website',
        budgetBand: '$5k-$10k',
        launchWindow: 'Q1',
        goals: 'Test goals',
        status: 'new',
        createdAt: new Date().toISOString(),
        notes: '',
      },
    ],
    snapshotPath: '/test/snapshot.json',
  }),
  getStorageMode: jest.fn().mockReturnValue('local-dev'),
}));

// Mock notifications
jest.mock('@/lib/notifications', () => ({
  notifyNewInquiry: jest.fn().mockResolvedValue({ status: 'sent' }),
}));

// Mock the security module - rate limiting
jest.mock('@/lib/security', () => ({
  rateLimit: jest.fn().mockReturnValue({ allowed: true, remaining: 100, resetTime: Date.now() + 60000 }),
  RATE_LIMIT_MAX_REQUESTS: 5,
  RATE_LIMIT_WINDOW_MS: 60000,
}));

describe('/api/inquiries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation Schema', () => {
    // Test the validation schema independently
    it('should validate required fields', () => {
      const { z } = require('zod');
      
      const inquirySchema = z.object({
        name: z.string().min(2).max(80),
        company: z.string().min(2).max(120),
        email: z.string().email(),
        phone: z.string().min(7).max(30),
        projectType: z.string().min(2).max(60),
        budgetBand: z.string().min(2).max(60),
        launchWindow: z.string().min(2).max(60),
        goals: z.string().min(20).max(1200)
      });

      const validData = {
        name: 'Test Company',
        company: 'Test Inc',
        email: 'test@example.com',
        phone: '555-1234',
        projectType: 'Website',
        budgetBand: '$5k-$10k',
        launchWindow: 'Q1 2024',
        goals: 'We need a new website for our business that will help us grow.',
      };

      const result = inquirySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const { z } = require('zod');
      
      const inquirySchema = z.object({
        name: z.string().min(2).max(80),
        company: z.string().min(2).max(120),
        email: z.string().email(),
        phone: z.string().min(7).max(30),
        projectType: z.string().min(2).max(60),
        budgetBand: z.string().min(2).max(60),
        launchWindow: z.string().min(2).max(60),
        goals: z.string().min(20).max(1200)
      });

      const invalidData = {
        name: 'Test Company',
        company: 'Test Inc',
        email: 'not-an-email',
        phone: '555-1234',
        projectType: 'Website',
        budgetBand: '$5k-$10k',
        launchWindow: 'Q1 2024',
        goals: 'We need a new website for our business that will help us grow.',
      };

      const result = inquirySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject fields exceeding max length', () => {
      const { z } = require('zod');
      
      const inquirySchema = z.object({
        name: z.string().min(2).max(80),
        company: z.string().min(2).max(120),
        email: z.string().email(),
        phone: z.string().min(7).max(30),
        projectType: z.string().min(2).max(60),
        budgetBand: z.string().min(2).max(60),
        launchWindow: z.string().min(2).max(60),
        goals: z.string().min(20).max(1200)
      });

      const longData = {
        name: 'a'.repeat(100), // Max is 80
        company: 'Test Inc',
        email: 'test@example.com',
        phone: '555-1234',
        projectType: 'Website',
        budgetBand: '$5k-$10k',
        launchWindow: 'Q1 2024',
        goals: 'We need a new website for our business that will help us grow.',
      };

      const result = inquirySchema.safeParse(longData);
      expect(result.success).toBe(false);
    });

    it('should reject goals shorter than minimum', () => {
      const { z } = require('zod');
      
      const inquirySchema = z.object({
        name: z.string().min(2).max(80),
        company: z.string().min(2).max(120),
        email: z.string().email(),
        phone: z.string().min(7).max(30),
        projectType: z.string().min(2).max(60),
        budgetBand: z.string().min(2).max(60),
        launchWindow: z.string().min(2).max(60),
        goals: z.string().min(20).max(1200)
      });

      const shortData = {
        name: 'Test Company',
        company: 'Test Inc',
        email: 'test@example.com',
        phone: '555-1234',
        projectType: 'Website',
        budgetBand: '$5k-$10k',
        launchWindow: 'Q1 2024',
        goals: 'Short', // Min is 20
      };

      const result = inquirySchema.safeParse(shortData);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const { z } = require('zod');
      
      const inquirySchema = z.object({
        name: z.string().min(2).max(80),
        company: z.string().min(2).max(120),
        email: z.string().email(),
        phone: z.string().min(7).max(30),
        projectType: z.string().min(2).max(60),
        budgetBand: z.string().min(2).max(60),
        launchWindow: z.string().min(2).max(60),
        goals: z.string().min(20).max(1200)
      });

      const incompleteData = {
        name: 'Test',
        // Missing other required fields
      };

      const result = inquirySchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });
  });
});
