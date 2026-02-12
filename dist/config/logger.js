"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logStream = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Use /tmp for serverless environments, fallback to logs for local development
const logDir = process.env.NODE_ENV === 'production' ? '/tmp/logs' : 'logs';
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
// Console format for development
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
}));
// Determine if we can write to file system (for serverless/readonly environments)
let canWriteToFileSystem = process.env.NODE_ENV !== 'serverless' &&
    process.env.AWS_LAMBDA_FUNCTION_NAME === undefined;
// Test if we can actually write to the filesystem
if (canWriteToFileSystem) {
    try {
        // Try to create the logs directory
        if (!fs_1.default.existsSync(logDir)) {
            fs_1.default.mkdirSync(logDir, { recursive: true });
        }
        // Test write by creating a temp file
        const testFile = path_1.default.join(logDir, 'test.log');
        fs_1.default.writeFileSync(testFile, 'test');
        fs_1.default.unlinkSync(testFile);
    }
    catch (error) {
        // If we can't write to filesystem, disable file logging
        canWriteToFileSystem = false;
        console.warn('Filesystem is read-only, disabling file logging. Using console only.');
    }
}
// Create transports based on environment
const transports = [];
if (canWriteToFileSystem) {
    // Add file transports only if we can write to file system
    transports.push(
    // Write all logs with level 'error' and below to error.log
    new winston_daily_rotate_file_1.default({
        filename: `${logDir}/error-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        handleExceptions: true,
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true
    }), 
    // Write all logs with level 'info' and below to combined.log
    new winston_daily_rotate_file_1.default({
        filename: `${logDir}/combined-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        handleExceptions: true,
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true
    }));
}
// Always add console transport
transports.push(new winston_1.default.transports.Console({
    format: consoleFormat
}));
// Create logger
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'docappsys' },
    transports,
    // Handle uncaught exceptions and rejections
    exceptionHandlers: canWriteToFileSystem ? [
        new winston_1.default.transports.File({ filename: `${logDir}/exceptions.log` })
    ] : [
        new winston_1.default.transports.Console({
            format: consoleFormat
        })
    ],
    rejectionHandlers: canWriteToFileSystem ? [
        new winston_1.default.transports.File({ filename: `${logDir}/rejections.log` })
    ] : [
        new winston_1.default.transports.Console({
            format: consoleFormat
        })
    ]
});
// Create a stream object for Morgan HTTP logging
exports.logStream = {
    write: (message) => {
        logger.info(message.trim());
    }
};
exports.default = logger;
