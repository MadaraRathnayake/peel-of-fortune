import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

export function getUserFromRequest(req: NextRequest): JWTPayload | null {
  const token = req.cookies.get('pof_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
