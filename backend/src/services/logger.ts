import fs from 'fs';
import path from 'path';

/**
 * Enterprise Application Logger & Crash Handler
 * Standardizes log formatting, error tracking, and exception handling.
 */

const LOGS_DIR = path.join(__dirname, '../../logs');

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const ERROR_LOG_PATH = path.join(LOGS_DIR, 'error.log');
const COMBINED_LOG_PATH = path.join(LOGS_DIR, 'combined.log');

const writeToFile = (filePath: string, message: string) => {
  try {
    fs.appendFileSync(filePath, message + '\n', 'utf8');
  } catch (err) {
    console.error('Failed writing to log file:', err);
  }
};

const formatLog = (level: string, message: string, meta?: any) => {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaStr}`;
};

export const logger = {
  info: (message: string, meta?: any) => {
    const formatted = formatLog('info', message, meta);
    console.log(formatted);
    writeToFile(COMBINED_LOG_PATH, formatted);
  },

  warn: (message: string, meta?: any) => {
    const formatted = formatLog('warn', message, meta);
    console.warn(formatted);
    writeToFile(COMBINED_LOG_PATH, formatted);
  },

  error: (message: string, error?: any, meta?: any) => {
    const errDetails = error instanceof Error ? `${error.message}\nStack: ${error.stack}` : JSON.stringify(error);
    const formatted = formatLog('error', `${message} -> Details: ${errDetails}`, meta);
    console.error(formatted);
    writeToFile(ERROR_LOG_PATH, formatted);
    writeToFile(COMBINED_LOG_PATH, formatted);
  },
};

// Global uncaught exception and unhandled rejection handlers
export const initCrashTracking = () => {
  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught Exception Detected', err);
  });

  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Promise Rejection Detected', reason);
  });

  logger.info('Logger & Crash Tracking System Initialized Successfully.');
};
