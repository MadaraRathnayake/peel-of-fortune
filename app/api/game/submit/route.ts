import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { submitAnswer, getSession } from '@/services/gameEngine';

export async function POST(req: NextRequest) {
  const jwtUser = getUserFromRequest(req);
  if (!jwtUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId, answer } = await req.json();
  if (!sessionId || answer === undefined)
    return NextResponse.json({ error: 'sessionId and answer required' }, { status: 400 });

  const session = getSession(sessionId);
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  if (session.userId !== jwtUser.userId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const result = submitAnswer(sessionId, Number(answer));
  if (!result) {
    return NextResponse.json({ error: 'No active puzzle or game over' }, { status: 410 });
  }

  const { state, correct, points, timeChange, multiplier } = result;

  return NextResponse.json({
    correct,
    points,
    timeChange,
    multiplier,
    score: state.score,
    timeLeft: state.timeLeft,
    streak: state.streak,
    longestStreak: state.longestStreak,
    gameOver: !state.active,
  });
}
