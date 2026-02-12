"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_js_1 = __importDefault(require("./logger.js"));
class DatabaseManager {
    constructor() {
        this.connectionAttempts = 0;
        this.maxRetries = 3;
        this.retryDelay = 5000;
    }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    async connect() {
        if (mongoose_1.default.connection.readyState === 1) {
            logger_js_1.default.info('MongoDB already connected');
            return;
        }
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MongoDB connection failed: MONGO_URI is undefined');
        }
        await this.connectWithRetry(mongoURI);
    }
    async connectWithRetry(mongoURI) {
        try {
            logger_js_1.default.info(`Attempting MongoDB connection (attempt ${this.connectionAttempts + 1}/${this.maxRetries})`);
            await mongoose_1.default.connect(mongoURI, {
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 60000,
                bufferCommands: false,
                connectTimeoutMS: 30000,
                maxPoolSize: 10,
                minPoolSize: 5,
                maxIdleTimeMS: 30000,
                retryWrites: true,
                retryReads: true
            });
            this.setupConnectionListeners();
            this.connectionAttempts = 0; // Reset on successful connection
            logger_js_1.default.info('MongoDB connected successfully', {
                host: mongoose_1.default.connection.host,
                port: mongoose_1.default.connection.port,
                database: mongoose_1.default.connection.name
            });
        }
        catch (error) {
            this.connectionAttempts++;
            logger_js_1.default.error('MongoDB connection failed', {
                error: error.message,
                attempt: `${this.connectionAttempts}/${this.maxRetries}`
            });
            if (this.connectionAttempts < this.maxRetries) {
                const delay = this.retryDelay * this.connectionAttempts; // Exponential backoff
                logger_js_1.default.info(`Retrying connection in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.connectWithRetry(mongoURI);
            }
            else {
                throw new Error(`Failed to connect to MongoDB after ${this.maxRetries} attempts: ${error.message}`);
            }
        }
    }
    setupConnectionListeners() {
        mongoose_1.default.connection.on('error', (err) => {
            logger_js_1.default.error('MongoDB connection error', { error: err.message });
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_js_1.default.warn('MongoDB disconnected');
        });
        mongoose_1.default.connection.on('reconnected', () => {
            logger_js_1.default.info('MongoDB reconnected');
        });
        mongoose_1.default.connection.on('close', () => {
            logger_js_1.default.info('MongoDB connection closed');
        });
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await this.disconnect();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            await this.disconnect();
            process.exit(0);
        });
    }
    async disconnect() {
        if (mongoose_1.default.connection.readyState === 1) {
            await mongoose_1.default.connection.close();
            logger_js_1.default.info('MongoDB connection closed gracefully');
        }
    }
    async healthCheck() {
        try {
            if (mongoose_1.default.connection.readyState !== 1) {
                return false;
            }
            if (mongoose_1.default.connection.db) {
                await mongoose_1.default.connection.db.admin().ping();
                return true;
            }
            return false;
        }
        catch (error) {
            logger_js_1.default.error('Database health check failed', { error: error.message });
            return false;
        }
    }
    getConnectionState() {
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        return states[mongoose_1.default.connection.readyState] || 'unknown';
    }
}
exports.default = DatabaseManager;
