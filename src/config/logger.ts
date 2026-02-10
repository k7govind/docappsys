import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';

// Use /tmp for serverless environments, fallback to logs for local development
const logDir = process.env.NODE_ENV === 'production' ? '/tmp/logs' : 'logs';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// Determine if we can write to file system (for serverless/readonly environments)
let canWriteToFileSystem = process.env.NODE_ENV !== 'serverless' && 
                            process.env.AWS_LAMBDA_FUNCTION_NAME === undefined;

// Test if we can actually write to the filesystem
if (canWriteToFileSystem) {
  try {
    // Try to create the logs directory
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    // Test write by creating a temp file
    const testFile = path.join(logDir, 'test.log');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
  } catch (error) {
    // If we can't write to filesystem, disable file logging
    canWriteToFileSystem = false;
    console.warn('Filesystem is read-only, disabling file logging. Using console only.');
  }
}

// Create transports based on environment
const transports: winston.transport[] = [];

if (canWriteToFileSystem) {
  // Add file transports only if we can write to file system
  transports.push(
    // Write all logs with level 'error' and below to error.log
    new DailyRotateFile({
      filename: `${logDir}/error-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      handleExceptions: true,
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    }),
    
    // Write all logs with level 'info' and below to combined.log
    new DailyRotateFile({
      filename: `${logDir}/combined-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      handleExceptions: true,
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    })
  );
}

// Always add console transport
transports.push(
  new winston.transports.Console({
    format: consoleFormat
  })
);

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'docappsys' },
  transports,
  
  // Handle uncaught exceptions and rejections
  exceptionHandlers: canWriteToFileSystem ? [
    new winston.transports.File({ filename: `${logDir}/exceptions.log` })
  ] : [
    new winston.transports.Console({
      format: consoleFormat
    })
  ],
  rejectionHandlers: canWriteToFileSystem ? [
    new winston.transports.File({ filename: `${logDir}/rejections.log` })
  ] : [
    new winston.transports.Console({
      format: consoleFormat
    })
  ]
});

// Create a stream object for Morgan HTTP logging
export const logStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

export default logger;