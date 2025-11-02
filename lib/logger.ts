// Production-ready logging utility for vercel-ai-agents
// Environment-aware structured logging without external dependencies

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.logLevel];
  }

  private formatLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    if (this.isDevelopment) {
      // Development: Use console with colors and formatting
      const colors = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
      };
      const reset = '\x1b[0m';

      console[entry.level === 'debug' ? 'log' : entry.level](
        `${colors[entry.level]}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} - ${entry.message}`,
        entry.data || ''
      );

      if (entry.error) {
        console.error(entry.error);
      }
    } else {
      // Production: Structured JSON logging
      const logData = {
        level: entry.level,
        message: entry.message,
        timestamp: entry.timestamp,
        service: 'vercel-ai-agents',
        ...(entry.data && { data: entry.data }),
        ...(entry.error && {
          error: {
            message: entry.error.message,
            stack: entry.error.stack,
          }
        }),
      };

      console.log(JSON.stringify(logData));
    }
  }

  debug(message: string, data?: any): void {
    this.formatLog({
      level: 'debug',
      message,
      timestamp: new Date().toISOString(),
      data,
    });
  }

  info(message: string, data?: any): void {
    this.formatLog({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      data,
    });
  }

  warn(message: string, data?: any): void {
    this.formatLog({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      data,
    });
  }

  error(message: string, error?: Error | any, data?: any): void {
    this.formatLog({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error : new Error(String(error)),
      data,
    });
  }
}

export const logger = new Logger();

// Client-side logging utility for browser environments
export const clientLogger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  },

  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, data || '');
    }
  },

  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '');
  },

  error: (message: string, error?: Error | any, data?: any) => {
    console.error(`[ERROR] ${message}`, error, data || '');

    // In production, could send to error tracking service
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      try {
        // Sentry.captureException(error);
      } catch (loggingError) {
        console.warn('Failed to log error to external service:', loggingError);
      }
    }
  }
};

export default logger;