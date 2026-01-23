import mongoose from "mongoose";
import chalk from 'chalk';
const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
        console.error("MongoDB connection failed: MONGO_URI is undefined");
        process.exit(1);
    }
    try {
        await mongoose.connect(mongoURI);
        console.log(chalk.blue.bgRed.bold("MongoDB connected successfully"));
    }
    catch (error) {
        console.error(chalk.blue.bgRed.bold("MongoDB connection failed:", error.message));
        process.exit(1);
    }
};
export default connectDB;
