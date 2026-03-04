/**
 * Structured Logging Utilities
 * 
 * Provides consistent, structured logging for the application.
 * Supports different log levels, formatting, and optional transport.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Log level priorities (lower = more severe)
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Current minimum log level
 */
let minimumLogLevel: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

/**
 * Sets the minimum log level
 */
export function setLogLevel(level: LogLevel): void {
  minimumLogLevel = level;
}

/**
 * Formats a log entry as JSON
 */
function formatLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context && { context }),
  };

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return entry;
}

/**
 * Outputs a log entry
 */
function outputLog(entry: LogEntry): void {
  // In production, output as JSON for log aggregation
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(entry));
    return;
  }

  // In development, output in human-readable format
  const { timestamp, level, message, context, error, ...rest } = entry;
  
  const prefix = `[${timestamp}] ${level.toUpperCase().padEnd(5)}`;
  
  switch (level) {
    case 'debug':
      console.debug(prefix, message, context || '', rest);
      break;
    case 'info':
      console.info(prefix, message, context || '', rest);
      break;
    case 'warn':
      console.warn(prefix, message, context || '', rest);
      break;
    case 'error':
      console.error(prefix, message, error || '', context || '', rest);
      break;
  }
}

/**
 * Checks if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minimumLogLevel];
}

/**
 * Creates a logger with predefined context
 */
export function createLogger(defaultContext?: LogContext) {
  return {
    debug(message: string, context?: LogContext): void {
      if (shouldLog('debug')) {
        const mergedContext = { ...defaultContext, ...context };
        outputLog(formatLogEntry('debug', message, mergedContext));
      }
    },

    info(message: string, context?: LogContext): void {
      if (shouldLog('info')) {
        const mergedContext = { ...defaultContext, ...context };
        outputLog(formatLogEntry('info', message, mergedContext));
      }
    },

    warn(message: string, context?: LogContext): void {
      if (shouldLog('warn')) {
        const mergedContext = { ...defaultContext, ...context };
        outputLog(formatLogEntry('warn', message, mergedContext));
      }
    },

    error(message: string, error?: Error, context?: LogContext): void {
      if (shouldLog('error')) {
        const mergedContext = { ...defaultContext, ...context };
        outputLog(formatLogEntry('error', message, mergedContext, error));
      }
    },
  };
}

/**
 * Default logger instance
 */
export const logger = createLogger({
  service: 'genh-premium-site',
  environment: process.env.NODE_ENV || 'development',
});

/**
 * Request logger middleware helper
 */
export function createRequestLogger(req: Request) {
  const startTime = Date.now();

  return {
    /**
     * Logs request start
     */
    start(): void {
      logger.info('Request started', {
        method: req.method,
        url: req.url,
        headers: {
          'user-agent': req.headers.get('user-agent'),
          'x-forwarded-for': req.headers.get('x-forwarded-for'),
        },
      });
    },

    /**
     * Logs request completion
     */
    complete(statusCode: number): void {
      const duration = Date.now() - startTime;
      logger.info('Request completed', {
        method: req.method,
        url: req.url,
        statusCode,
        duration: `${duration}ms`,
      });
    },

    /**
     * Logs request error
     */
    error(error: Error): void {
      const duration = Date.now() - startTime;
      logger.error('Request failed', error, {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
      });
    },
  };
}

/**
 * Performance timer helper
 */
export function createTimer(label: string) {
  const startTime = process.hrtime.bigint();

  return {
    /**
     * Ends the timer and logs the duration
     */
    end(): void {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      logger.debug(`Timer: ${label}`, { durationMs: `${durationMs.toFixed(2)}ms` });
    },
  };
}

export default logger;
