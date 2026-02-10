import mongoose from "mongoose";
import chalk from 'chalk';
import logger from "./logger.js";

const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    logger.error("MongoDB connection failed: MONGO_URI is undefined");
    console.error("MongoDB connection failed: MONGO_URI is undefined");
    process.exit(1);
  }

  try {
    logger.info('Attempting to connect to MongoDB', { 
      mongoURI: mongoURI.replace(/\/\/.*@/, '//***:***@') // Hide credentials
    });
    
    const connection =     await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      connectTimeoutMS: 30000 // Give up initial connection after 30 seconds
    });
    
    // Add connection event listeners
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully', { 
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        database: mongoose.connection.name
      });
      console.log(chalk.blue.bgRed.bold("MongoDB connected successfully"));
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

    // Connection successful
  } catch (error: any) {
    logger.error('MongoDB connection failed', { 
      error: error.message, 
      name: error.name,
      stack: error.stack,
      mongoURI: mongoURI.replace(/\/\/.*@/, '//***:***@'),
      errorDetails: error.reason || error
    });
    console.error(chalk.blue.bgRed.bold("MongoDB connection failed:", error.message));
    process.exit(1);
  }
};

export default connectDB;
