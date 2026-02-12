import chalk from 'chalk';
import logger from './config/logger';
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db";

const PORT = Number(process.env.PORT) || 3000;

logger.info('Starting Doctor Appointment Booking System', { 
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: PORT
});

// Connect to database first
connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info('Server started successfully', { 
      port: PORT
    });
    console.log(chalk.red(`Server running on port ${PORT}`));
  });
}).catch((error) => {
  logger.error('Failed to start server due to database connection error', { 
    error: error.message 
  });
  //process.exit(1);
});
