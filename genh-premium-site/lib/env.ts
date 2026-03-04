/**
 * Environment Validation Utilities
 * 
 * Validates required environment variables at startup and provides
 * runtime checks for configuration.
 */

export interface EnvVarConfig {
  name: string;
  required: boolean;
  defaultValue?: string;
  validator?: (value: string) => boolean;
  description: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Required environment variables for production
 */
export const PRODUCTION_ENV_VARS: EnvVarConfig[] = [
  {
    name: 'OPS_BASIC_USER',
    required: true,
    description: 'Username for portal authentication',
  },
  {
    name: 'OPS_BASIC_PASS',
    required: true,
    description: 'Password for portal authentication',
  },
  {
    name: 'BLOB_READ_WRITE_TOKEN',
    required: true,
    description: 'Vercel Blob storage token for persisting inquiries',
  },
  {
    name: 'INQUIRY_BLOB_PATH',
    required: false,
    defaultValue: 'genh-premium-site-inquiries-ledger',
    description: 'Blob path for storing inquiry snapshots',
  },
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    required: false,
    description: 'Public URL of the site (required for production)',
  },
];

/**
 * Optional environment variables
 */
export const OPTIONAL_ENV_VARS: EnvVarConfig[] = [
  {
    name: 'OPS_SESSION_SECRET',
    required: false,
    description: 'Secret for signing session tokens (recommended for production)',
    validator: (value: string) => value.length >= 32,
  },
  {
    name: 'RESEND_API_KEY',
    required: false,
    description: 'Resend API key for sending email notifications',
  },
  {
    name: 'ALERT_EMAIL',
    required: false,
    description: 'Email address for alert notifications',
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },
  {
    name: 'FROM_EMAIL',
    required: false,
    description: 'Sender email address for notifications',
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },
  {
    name: 'COMPANY_PHONE',
    required: false,
    description: 'Company phone number for contact form',
  },
  {
    name: 'COMPANY_EMAIL',
    required: false,
    description: 'Company email for contact form',
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },
];

/**
 * Validates all environment variables
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const config of PRODUCTION_ENV_VARS) {
    const value = process.env[config.name];

    if (!value || value.trim() === '') {
      if (config.required) {
        errors.push(`${config.name} is required but not set. ${config.description}`);
      } else if (config.defaultValue) {
        warnings.push(
          `${config.name} is not set, using default: ${config.defaultValue}`
        );
      }
    } else if (config.validator && !config.validator(value)) {
      errors.push(
        `${config.name} failed validation. ${config.description}`
      );
    }
  }

  // Check optional variables with warnings
  for (const config of OPTIONAL_ENV_VARS) {
    const value = process.env[config.name];

    if (value && value.trim() !== '') {
      if (config.validator && !config.validator(value)) {
        warnings.push(
          `${config.name} has invalid format. ${config.description}`
        );
      }
    } else if (config.required) {
      warnings.push(
        `${config.name} is recommended but not set. ${config.description}`
      );
    }
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      warnings.push(
        'NEXT_PUBLIC_SITE_URL is not set in production. Some features may not work correctly.'
      );
    }

    // Warn about weak session secret
    if (
      process.env.OPS_SESSION_SECRET &&
      process.env.OPS_SESSION_SECRET.length < 32
    ) {
      warnings.push(
        'OPS_SESSION_SECRET should be at least 32 characters for production.'
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Gets a typed environment variable with validation
 */
export function getEnvVar(
  name: string,
  required: boolean = false,
  defaultValue?: string
): string {
  const value = process.env[name]?.trim() ?? defaultValue;

  if (required && !value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }

  return value ?? '';
}

/**
 * Gets a required environment variable or throws
 */
export function getRequiredEnvVar(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }

  return value;
}

/**
 * Gets an optional environment variable
 */
export function getOptionalEnvVar(name: string, defaultValue?: string): string {
  return process.env[name]?.trim() ?? defaultValue ?? '';
}

/**
 * Checks if we're running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Checks if we're running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Logs environment validation results
 */
export function logEnvironmentStatus(): void {
  const result = validateEnvironment();

  if (result.errors.length > 0) {
    console.error('Environment validation FAILED:');
    result.errors.forEach((error) => console.error(`  - ${error}`));
  }

  if (result.warnings.length > 0) {
    console.warn('Environment validation warnings:');
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  if (result.valid && result.warnings.length === 0) {
    console.log('Environment validation PASSED');
  }
}

// Run validation on import in development
if (isDevelopment()) {
  logEnvironmentStatus();
}
