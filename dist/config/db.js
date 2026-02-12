"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDatabaseConnection = exports.checkDatabaseConnection = void 0;
const databaseManager_js_1 = __importDefault(require("./databaseManager.js"));
const chalk_1 = __importDefault(require("chalk"));
const logger_js_1 = __importDefault(require("./logger.js"));
const dbManager = databaseManager_js_1.default.getInstance();
const connectDB = async () => {
    try {
        await dbManager.connect();
        console.log(chalk_1.default.blue.bgRed.bold("MongoDB connected successfully"));
    }
    catch (error) {
        logger_js_1.default.error('MongoDB connection failed', {
            error: error.message,
            stack: error.stack
        });
        console.error(chalk_1.default.blue.bgRed.bold("MongoDB connection failed:", error.message));
        process.exit(1);
    }
};
// Health check function to verify database connection
const checkDatabaseConnection = async () => {
    return await dbManager.healthCheck();
};
exports.checkDatabaseConnection = checkDatabaseConnection;
// Middleware to ensure database connection before processing requests
const ensureDatabaseConnection = async (req, res, next) => {
    const isConnected = await (0, exports.checkDatabaseConnection)();
    if (!isConnected) {
        return res.status(503).json({
            success: false,
            message: 'Database connection unavailable'
        });
    }
    next();
};
exports.ensureDatabaseConnection = ensureDatabaseConnection;
exports.default = connectDB;
