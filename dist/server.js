"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const chalk_1 = __importDefault(require("chalk"));
const logger_js_1 = __importDefault(require("./config/logger.js"));
dotenv_1.default.config();
const app_js_1 = __importDefault(require("./app.js"));
const db_js_1 = __importDefault(require("./config/db.js"));
const PORT = Number(process.env.PORT) || 3000;
logger_js_1.default.info('Starting Doctor Appointment Booking System', {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: PORT
});
// Connect to database first
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
