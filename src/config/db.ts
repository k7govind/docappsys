import DatabaseManager from "./databaseManager.js";
import chalk from 'chalk';
import logger from "./logger.js";
import { Request, Response, NextFunction } from 'express';

const dbManager = DatabaseManager.getInstance();

const connectDB = async (): Promise<void> => {
  try {
    await dbManager.connect();
    console.log(chalk.blue.bgRed.bold("MongoDB connected successfully"));
  } catch (error: any) {
    logger.error('MongoDB connection failed', { 
      error: error.message,
      stack: error.stack
    });
    console.error(chalk.blue.bgRed.bold("MongoDB connection failed:", error.message));
    process.exit(1);
  }
};

// Health check function to verify database connection
export const checkDatabaseConnection = async (): Promise<boolean> => {
  return await dbManager.healthCheck();
};

// Middleware to ensure database connection before processing requests
export const ensureDatabaseConnection = async (req: Request, res: Response, next: NextFunction) => {
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable'
    });
  }
  next();
};

export default connectDB;
