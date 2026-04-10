import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IGameSession extends Document {
  userId: Types.ObjectId;
  score: number;
  puzzlesSolved: number;
  longestStreak: number;
  duration: number;
  playedAt: Date;
}

const GameSessionSchema = new Schema<IGameSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, default: 0 },
  puzzlesSolved: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  duration: { type: Number, default: 0 }, // seconds
  playedAt: { type: Date, default: Date.now },
});

const GameSession: Model<IGameSession> =
  mongoose.models.GameSession ??
  mongoose.model<IGameSession>('GameSession', GameSessionSchema);

export default GameSession;
