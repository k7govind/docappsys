import mongoose from 'mongoose';
import logger from './logger.js';

class DatabaseManager {
  private static instance: DatabaseManager;
  private connectionAttempts = 0;
  private maxRetries = 3;
  private retryDelay = 5000;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async connect(): Promise<void> {
    if (mongoose.connection.readyState === 1) {
      logger.info('MongoDB already connected');
      return;
    }

    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MongoDB connection failed: MONGO_URI is undefined');
    }

    await this.connectWithRetry(mongoURI);
  }

  private async connectWithRetry(mongoURI: string): Promise<void> {
    try {
      logger.info(`Attempting MongoDB connection (attempt ${this.connectionAttempts + 1}/${this.maxRetries})`);
      
      await mongoose.connect(mongoURI, {
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
      
      logger.info('MongoDB connected successfully', {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        database: mongoose.connection.name
      });

    } catch (error: any) {
      this.connectionAttempts++;
      
      logger.error('MongoDB connection failed', {
        error: error.message,
        attempt: `${this.connectionAttempts}/${this.maxRetries}`
      });

      if (this.connectionAttempts < this.maxRetries) {
        const delay = this.retryDelay * this.connectionAttempts; // Exponential backoff
        logger.info(`Retrying connection in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.connectWithRetry(mongoURI);
      } else {
        throw new Error(`Failed to connect to MongoDB after ${this.maxRetries} attempts: ${error.message}`);
      }
    }
  }

  private setupConnectionListeners(): void {
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    mongoose.connection.on('close', () => {
      logger.info('MongoDB connection closed');
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

  public async disconnect(): Promise<void> {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed gracefully');
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (mongoose.connection.readyState !== 1) {
        return false;
      }

      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
        return true;
      }
      return false;
    } catch (error: any) {
      logger.error('Database health check failed', { error: error.message });
      return false;
    }
  }

  public getConnectionState(): string {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return states[mongoose.connection.readyState] || 'unknown';
  }
}

export default DatabaseManager;