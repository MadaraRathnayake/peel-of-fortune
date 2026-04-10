import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  highScore: number;
  bestStreak: number;
  totalGames: number;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    highScore: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    totalGames: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema);

export default User;
