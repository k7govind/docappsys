import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role?: string;
  refreshTokenHash?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "user" },
    refreshTokenHash: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model<IUser>("User", userSchema);

export default User;