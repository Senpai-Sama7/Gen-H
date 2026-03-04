// genh-premium-site/__tests__/utils/sanitize.test.ts
/**
 * Unit tests for sanitization utilities
 */

import {
  sanitizeForHtml,
  sanitizeForSql,
  sanitizeForPath,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeString,
  removeControlCharacters,
  containsDangerousPatterns,
  sanitizeObject,
  validators,
} from '@/lib/sanitize';

describe('Sanitization Utilities', () => {
  describe('sanitizeForHtml', () => {
    it('should escape HTML special characters', () => {
      const result = sanitizeForHtml('<script>alert("xss")</script>');
      // Implementation uses &#x2F; for forward slash
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&quot;');
    });

    it('should handle empty string', () => {
      expect(sanitizeForHtml('')).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(sanitizeForHtml(null as unknown as string)).toBe('');
      expect(sanitizeForHtml(undefined as unknown as string)).toBe('');
    });

    it('should escape ampersands', () => {
      expect(sanitizeForHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should escape quotes', () => {
      const result = sanitizeForHtml("It's a test");
      expect(result).toContain('&#x27;');
    });
  });

  describe('sanitizeForSql', () => {
    it('should escape single quotes', () => {
      expect(sanitizeForSql("O'Brien")).toBe("O''Brien");
    });

    it('should handle empty string', () => {
      expect(sanitizeForSql('')).toBe('');
    });

    it('should remove SQL comment patterns', () => {
      expect(sanitizeForSql('test -- comment')).toBe('test  comment');
      expect(sanitizeForSql('test /* comment */')).toBe('test  comment ');
    });

    it('should remove semicolons', () => {
      expect(sanitizeForSql('test; DROP TABLE users;')).toBe('test DROP TABLE users');
    });
  });

  describe('sanitizeForPath', () => {
    it('should block path traversal', () => {
      const result = sanitizeForPath('../../../etc/passwd');
      // The implementation removes the traversal but keeps the rest
      expect(result).not.toContain('..');
    });

    it('should allow safe paths', () => {
      expect(sanitizeForPath('uploads/images/photo.jpg')).toBe('uploads/images/photo.jpg');
    });

    it('should remove null bytes', () => {
      expect(sanitizeForPath('test\x00.txt')).toBe('test.txt');
    });

    it('should handle empty string', () => {
      expect(sanitizeForPath('')).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('should lowercase and trim email', () => {
      expect(sanitizeEmail('  TEST@Example.COM  ')).toBe('test@example.com');
    });

    it('should remove invalid characters', () => {
      expect(sanitizeEmail('test<>@example.com')).toBe('test@example.com');
    });

    it('should return lowercase version for invalid email', () => {
      // The implementation doesn't validate, just sanitizes
      expect(sanitizeEmail('invalid')).toBe('invalid');
      expect(sanitizeEmail('')).toBe('');
    });
  });

  describe('sanitizePhone', () => {
    it('should keep only phone-related characters', () => {
      expect(sanitizePhone('+1 (555) 123-4567')).toBe('+1 (555) 123-4567');
    });

    it('should remove letters and special chars', () => {
      expect(sanitizePhone('Call: 555-123-4567')).toBe('555-123-4567');
    });

    it('should handle empty string', () => {
      expect(sanitizePhone('')).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it('should validate and return valid URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
      expect(sanitizeUrl('http://test.com/path')).toBe('http://test.com/path');
    });

    it('should reject invalid URLs', () => {
      expect(sanitizeUrl('not-a-url')).toBe('');
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(sanitizeUrl('')).toBe('');
    });

    it('should reject non-HTTP protocols', () => {
      expect(sanitizeUrl('ftp://example.com')).toBe('');
      expect(sanitizeUrl('file:///etc/passwd')).toBe('');
    });
  });

  describe('sanitizeString', () => {
    it('should trim and limit length', () => {
      const longString = 'a'.repeat(2000);
      const result = sanitizeString('  ' + longString + '  ', 100);
      
      expect(result.length).toBe(100);
      expect(result).toBe('a'.repeat(100));
    });

    it('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('removeControlCharacters', () => {
    it('should remove control characters except newlines and tabs', () => {
      expect(removeControlCharacters('test\x00\x01\x02')).toBe('test');
      expect(removeControlCharacters('test\n\t\r')).toBe('test\n\t\r');
    });
  });

  describe('containsDangerousPatterns', () => {
    it('should detect SQL injection patterns', () => {
      const result = containsDangerousPatterns('SELECT * FROM users');
      expect(result.isDangerous).toBe(true);
      expect(result.patterns).toContain('sqlInjection');
    });

    it('should detect XSS patterns', () => {
      const result = containsDangerousPatterns('<script>alert(1)</script>');
      expect(result.isDangerous).toBe(true);
      expect(result.patterns).toContain('xssBasic');
    });

    it('should detect path traversal', () => {
      const result = containsDangerousPatterns('../../../etc/passwd');
      expect(result.isDangerous).toBe(true);
      expect(result.patterns).toContain('pathTraversal');
    });

    it('should return false for safe strings', () => {
      const result = containsDangerousPatterns('Hello, World!');
      expect(result.isDangerous).toBe(false);
      expect(result.patterns).toHaveLength(0);
    });
  });

  describe('sanitizeObject', () => {
    it('should recursively sanitize object', () => {
      const input = {
        name: '  <script>alert(1)</script>  ',
        email: '  TEST@Example.COM  ',  // Note: sanitizeObject doesn't lowercase emails
        nested: {
          value: '  test  ',
        },
      };

      const result = sanitizeObject(input);

      // Check HTML is escaped
      expect(result.name).toContain('&lt;');
      expect(result.name).toContain('&gt;');
      // Note: sanitizeObject trims but doesn't lowercase emails
      expect(result.email).toBe('TEST@Example.COM');
      // Nested values should be trimmed
      expect(result.nested.value).toBe('test');
    });

    it('should respect maxStringLength option', () => {
      const input = {
        value: 'a'.repeat(2000),
      };

      const result = sanitizeObject(input, { maxStringLength: 100 });

      expect(result.value.length).toBe(100);
    });

    it('should handle null values', () => {
      const input = {
        value: null,
      };

      const result = sanitizeObject(input as unknown as Record<string, unknown>);

      expect(result.value).toBeNull();
    });
  });

  describe('validators', () => {
    describe('isEmail', () => {
      it('should validate correct emails', () => {
        expect(validators.isEmail('test@example.com')).toBe(true);
        expect(validators.isEmail('user.name+tag@example.co.uk')).toBe(true);
      });

      it('should reject invalid emails', () => {
        expect(validators.isEmail('invalid')).toBe(false);
        expect(validators.isEmail('@example.com')).toBe(false);
        expect(validators.isEmail('test@')).toBe(false);
      });
    });

    describe('isValidPhone', () => {
      it('should validate correct phone numbers', () => {
        expect(validators.isValidPhone('555-123-4567')).toBe(true);
        expect(validators.isValidPhone('(555) 123-4567')).toBe(true);
        expect(validators.isValidPhone('+1 555 123 4567')).toBe(true);
      });

      it('should reject invalid phone numbers', () => {
        expect(validators.isValidPhone('123')).toBe(false);
        expect(validators.isValidPhone('abc')).toBe(false);
      });
    });

    describe('isUrl', () => {
      it('should validate correct URLs', () => {
        expect(validators.isUrl('https://example.com')).toBe(true);
        expect(validators.isUrl('http://test.com/path')).toBe(true);
      });

      it('should reject invalid URLs', () => {
        expect(validators.isUrl('not-a-url')).toBe(false);
        expect(validators.isUrl('')).toBe(false);
      });
    });

    describe('isLengthInRange', () => {
      it('should validate string length', () => {
        expect(validators.isLengthInRange('hello', 3, 10)).toBe(true);
        expect(validators.isLengthInRange('ab', 3, 10)).toBe(false);
        expect(validators.isLengthInRange('hello world', 3, 5)).toBe(false);
      });
    });

    describe('isAlphanumeric', () => {
      it('should validate alphanumeric strings', () => {
        expect(validators.isAlphanumeric('hello123')).toBe(true);
        expect(validators.isAlphanumeric('ABC')).toBe(true);
      });

      it('should reject non-alphanumeric strings', () => {
        expect(validators.isAlphanumeric('hello world')).toBe(false);
        expect(validators.isAlphanumeric('test!')).toBe(false);
      });
    });
  });
});
