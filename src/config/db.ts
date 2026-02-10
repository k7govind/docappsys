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
    
    await mongoose.connect(mongoURI);
    
    logger.info('MongoDB connected successfully', { 
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.name
    });
    console.log(chalk.blue.bgRed.bold("MongoDB connected successfully"));
  } catch (error: any) {
    logger.error('MongoDB connection failed', { 
      error: error.message, 
      stack: error.stack,
      mongoURI: mongoURI.replace(/\/\/.*@/, '//***:***@')
    });
    console.error(chalk.blue.bgRed.bold("MongoDB connection failed:", error.message));
    process.exit(1);
  }
};

export default connectDB;
