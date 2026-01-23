import dotenv from "dotenv";
import chalk from 'chalk';
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = Number(process.env.PORT) || 3000;

connectDB();

app.listen(PORT, '0.0.0.0', () => {
  console.log(chalk.red(`Server running on port ${PORT}`));
});
