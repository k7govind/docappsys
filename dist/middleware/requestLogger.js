"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_js_1 = __importDefault(require("../config/logger.js"));
const requestLogger = (req, res, next) => {
    const start = Date.now();
    // Store original end function
    const originalEnd = res.end;
    // Override end function to log response
    res.end = function (chunk, encoding) {
        const duration = Date.now() - start;
        logger_js_1.default.info('HTTP Request completed', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            contentLength: res.get('Content-Length') || 0
        });
        // Call original end function and return Response
        return originalEnd.call(this, chunk, encoding);
    };
    next();
};
exports.requestLogger = requestLogger;
exports.default = exports.requestLogger;
