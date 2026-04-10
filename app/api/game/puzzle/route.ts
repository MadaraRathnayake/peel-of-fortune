import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getSession, setPuzzle, endSession } from '@/services/gameEngine';
import { fetchBananaPuzzle } from '@/lib/bananaApi';

export async function GET(req: NextRequest) {
  const jwtUser = getUserFromRequest(req);
  if (!jwtUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

  const session = getSession(sessionId);
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  if (session.userId !== jwtUser.userId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (!session.active) {
    return NextResponse.json({ error: 'Game over', gameOver: true }, { status: 410 });
  }

  // Check server-side time (client may lag)
  if (session.timeLeft <= 0) {
    endSession(sessionId);
    return NextResponse.json({ error: 'Time up', gameOver: true }, { status: 410 });
  }

  // Interoperability: call external Banana API
  const puzzle = await fetchBananaPuzzle();

  // Store answer server-side — client never sees the solution
  setPuzzle(sessionId, puzzle.solution);

  return NextResponse.json({
    question: puzzle.question, // image URL
    timeLeft: session.timeLeft,
    score: session.score,
    streak: session.streak,
  });
}
