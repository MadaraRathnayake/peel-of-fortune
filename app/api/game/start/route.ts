import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createSession } from '@/services/gameEngine';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const jwtUser = getUserFromRequest(req);
  if (!jwtUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sessionId = randomUUID();
  const state = createSession(sessionId, jwtUser.userId);

  return NextResponse.json({
    sessionId: state.sessionId,
    timeLeft: state.timeLeft,
    score: state.score,
    streak: state.streak,
  });
}
