import mongoose, { Schema, Document, model, models } from "mongoose";

// Interface for TypeScript
interface IUser extends Document {
  email: string;
  photoURL: string;
  fullName: string;
  uid: string;
  createdAt: Date;
}

// Mongoose Schema
const UserSchema: Schema<IUser> = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  photoURL: {
    type: String,
    required: false,
    default: "",
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for faster queries
UserSchema.index({ email: 1 }, { unique: true }); // index on email
UserSchema.index({ uid: 1 }, { unique: true }); // index on uid
UserSchema.index({ fullName: 1 }); // index on fullName for search

// Create the model (check if it already exists)
const UserModel = models.User || model<IUser>("User", UserSchema);

export default UserModel;
