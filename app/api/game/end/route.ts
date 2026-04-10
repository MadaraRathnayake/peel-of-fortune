import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getSession, endSession } from '@/services/gameEngine';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import GameSession from '@/models/GameSession';

export async function POST(req: NextRequest) {
  const jwtUser = getUserFromRequest(req);
  if (!jwtUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

  const session = getSession(sessionId);
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  if (session.userId !== jwtUser.userId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // End the session in-memory
  endSession(sessionId);

  const durationSeconds = Math.round((Date.now() - session.startedAt) / 1000);

  await connectDB();

  // Save game session to DB
  await GameSession.create({
    userId: jwtUser.userId,
    score: session.score,
    puzzlesSolved: session.puzzlesSolved,
    longestStreak: session.longestStreak,
    duration: durationSeconds,
  });

  // Update virtual identity stats on User
  await User.findByIdAndUpdate(jwtUser.userId, {
    $inc: { totalGames: 1 },
    $max: { highScore: session.score, bestStreak: session.longestStreak },
  });

  const updatedUser = await User.findById(jwtUser.userId).select(
    'username highScore bestStreak totalGames'
  );

  return NextResponse.json({
    score: session.score,
    puzzlesSolved: session.puzzlesSolved,
    longestStreak: session.longestStreak,
    duration: durationSeconds,
    user: updatedUser,
  });
}
