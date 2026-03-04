/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize and validate user input
 * to prevent XSS, injection attacks, and other security issues.
 */

/**
 * Regular expressions for common attack patterns
 */
const DANGEROUS_PATTERNS = {
  // SQL Injection patterns
  sqlInjection: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)|(--)|(;)|(\/\*)|(\*\/)|(@@)|(\@)/i,
  
  // XSS patterns - basic
  xssBasic: /<script[^>]*>.*?<\/script>|<iframe[^>]*>.*?<\/iframe>|javascript:|on\w+\s*=/gi,
  
  // XSS patterns - encoded
  xssEncoded: /&lt;script|&lt;iframe|&#x[0-9a-f]+;|&#[0-9]+;/gi,
  
  // Path traversal
  pathTraversal: /(\.\.[\/\\])|([\/\\]\.\.)/g,
  
  // Command injection
  commandInjection: /[;&|`$]/,
};

/**
 * Sanitizes a string for safe display in HTML
 * Removes or escapes potentially dangerous characters
 */
export function sanitizeForHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizes a string for use in SQL queries
 * Note: Use parameterized queries instead when possible
 */
export function sanitizeForSql(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}

/**
 * Sanitizes a string for use in file paths
 * Prevents path traversal attacks
 */
export function sanitizeForPath(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove path traversal patterns
  let sanitized = input.replace(DANGEROUS_PATTERNS.pathTraversal, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*]/g, '');

  return sanitized.trim();
}

/**
 * Sanitizes an email address
 * Returns empty string if invalid
 */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Basic email validation and sanitization
  const sanitized = input.trim().toLowerCase();
  
  // Remove potentially dangerous characters
  return sanitized.replace(/[^a-z0-9@._-]/g, '');
}

/**
 * Sanitizes a phone number
 * Returns only digits and common phone characters
 */
export function sanitizePhone(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Keep only digits, spaces, dashes, parentheses, and plus sign
  return input.replace(/[^\d\s\-()+]/g, '').trim();
}

/**
 * Sanitizes a URL
 * Returns empty string if invalid
 */
export function sanitizeUrl(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  try {
    const url = new URL(input.trim());
    
    // Only allow http and https
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return '';
    }

    return url.toString();
  } catch {
    return '';
  }
}

/**
 * Trims and limits string length
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input.trim().slice(0, maxLength);
}

/**
 * Removes control characters from string
 */
export function removeControlCharacters(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove control characters except newline, tab, and carriage return
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Checks if input contains potentially dangerous patterns
 */
export function containsDangerousPatterns(input: string): {
  isDangerous: boolean;
  patterns: string[];
} {
  if (!input || typeof input !== 'string') {
    return { isDangerous: false, patterns: [] };
  }

  const foundPatterns: string[] = [];

  for (const [name, pattern] of Object.entries(DANGEROUS_PATTERNS)) {
    if (pattern.test(input)) {
      foundPatterns.push(name);
    }
    // Reset regex lastIndex
    pattern.lastIndex = 0;
  }

  return {
    isDangerous: foundPatterns.length > 0,
    patterns: foundPatterns,
  };
}

/**
 * Sanitizes an object recursively
 * Useful for sanitizing form data
 */
export interface SanitizationOptions {
  maxStringLength?: number;
  allowHtml?: boolean;
  trimStrings?: boolean;
}

export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: SanitizationOptions = {}
): T {
  const {
    maxStringLength = 1000,
    allowHtml = false,
    trimStrings = true,
  } = options;

  const sanitized = { ...obj } as Record<string, unknown>;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      let sanitizedValue = trimStrings ? value.trim() : value;
      
      // Remove control characters
      sanitizedValue = removeControlCharacters(sanitizedValue);
      
      // Limit length
      sanitizedValue = sanitizeString(sanitizedValue, maxStringLength);
      
      // Sanitize for HTML if not allowed
      if (!allowHtml) {
        sanitizedValue = sanitizeForHtml(sanitizedValue);
      }
      
      sanitized[key] = sanitizedValue;
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, options);
    }
  }

  return sanitized as T;
}

/**
 * Validation helpers
 */
export const validators = {
  /**
   * Validates email format
   */
  isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  /**
   * Validates phone number format (US)
   */
  isValidPhone(value: string): boolean {
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  },

  /**
   * Validates URL format
   */
  isUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  },

  /**
   * Validates string length
   */
  isLengthInRange(value: string, min: number, max: number): boolean {
    return value.length >= min && value.length <= max;
  },

  /**
   * Validates alphanumeric string
   */
  isAlphanumeric(value: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(value);
  },
};
