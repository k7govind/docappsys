"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const dotenv_1 = __importDefault(require("dotenv"));
const chalk_1 = __importDefault(require("chalk"));
const logger_js_1 = __importDefault(require("../config/logger.js"));
// For Vercel serverless environment, load dotenv only if not in production
if (process.env.NODE_ENV !== 'production') {
    dotenv_1.default.config();
}
const app_js_1 = __importDefault(require("../app.js"));
const db_js_1 = __importDefault(require("../config/db.js"));
// Ensure database is connected
let isConnected = false;
const ensureConnected = async () => {
    if (!isConnected) {
        await (0, db_js_1.default)();
        isConnected = true;
    }
};
// Export for Vercel serverless
async function handler(req, res) {
    await ensureConnected();
    return (0, app_js_1.default)(req, res);
}
// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = Number(process.env.PORT) || 3000;
    logger_js_1.default.info('Starting Doctor Appointment Booking System', {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: PORT
    });
    (0, db_js_1.default)().then(() => {
        app_js_1.default.listen(PORT, '0.0.0.0', () => {
            logger_js_1.default.info('Server started successfully', {
                port: PORT,
                host: '0.0.0.0'
            });
            console.log(chalk_1.default.red(`Server running on port ${PORT}`));
        });
    }).catch((error) => {
        logger_js_1.default.error('Failed to start server due to database connection error', {
            error: error.message
        });
        process.exit(1);
    });
}
