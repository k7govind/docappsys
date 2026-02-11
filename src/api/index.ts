import dotenv from "dotenv";
import chalk from 'chalk';
import logger from "../config/logger.js";

// For Vercel serverless environment, load dotenv only if not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

import app from "../app.js";
import connectDB from "../config/db.js";

// Export for Vercel serverless
export default async function handler(req: any, res: any) {
  await connectDB();
  return app(req, res);
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = Number(process.env.PORT) || 3000;
  
  logger.info('Starting Doctor Appointment Booking System', { 
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: PORT
  });

  connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      logger.info('Server started successfully', { 
        port: PORT,
        host: '0.0.0.0'
      });
      console.log(chalk.red(`Server running on port ${PORT}`));
    });
  }).catch((error) => {
    logger.error('Failed to start server due to database connection error', { 
      error: error.message 
    });
    process.exit(1);
  });
}