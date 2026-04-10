import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  await connectDB();

  const leaders = await User.find({})
    .select('username highScore bestStreak totalGames createdAt')
    .sort({ highScore: -1 })
    .limit(20)
    .lean();

  return NextResponse.json({ leaders });
}
