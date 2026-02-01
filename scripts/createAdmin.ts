import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../src/models/user.model.js";

const uri = process.env.MONGO_URI as string;
const password = process.env.ADMIN_PASSWORD || "AdminPass123!";
const email = process.env.ADMIN_EMAIL || "admin@example.com";
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

async function run() {
  await mongoose.connect(uri);
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  await User.create({ email, passwordHash: hash, role: "admin" });
  console.log("Admin created:", email);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});