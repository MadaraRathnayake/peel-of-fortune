import { eventBus } from './eventBus';
import { calculateScore, SCORING } from './scoringService';

export interface GameState {
  sessionId: string;
  userId: string;
  score: number;
  timeLeft: number;         // seconds
  streak: number;
  longestStreak: number;
  puzzlesSolved: number;
  currentAnswer: number | null;
  puzzleLoadedAt: number | null; // unix ms
  active: boolean;
  startedAt: number;
}

// In-memory store (per process); for prod you'd use Redis
const activeSessions = new Map<string, GameState>();

export function createSession(sessionId: string, userId: string): GameState {
  const state: GameState = {
    sessionId,
    userId,
    score: 0,
    timeLeft: SCORING.INITIAL_TIME,
    streak: 0,
    longestStreak: 0,
    puzzlesSolved: 0,
    currentAnswer: null,
    puzzleLoadedAt: null,
    active: true,
    startedAt: Date.now(),
  };
  activeSessions.set(sessionId, state);

  eventBus.emit('GAME_STARTED', { sessionId, userId });
  return state;
}

export function setPuzzle(sessionId: string, answer: number): GameState | null {
  const state = activeSessions.get(sessionId);
  if (!state || !state.active) return null;

  state.currentAnswer = answer;
  state.puzzleLoadedAt = Date.now();

  eventBus.emit('PUZZLE_LOADED', { sessionId });
  return state;
}

export function submitAnswer(
  sessionId: string,
  answer: number
): { state: GameState; correct: boolean; points: number; timeChange: number; multiplier: number } | null {
  const state = activeSessions.get(sessionId);
  if (!state || !state.active || state.currentAnswer === null) return null;

  const answerTimeSeconds = state.puzzleLoadedAt
    ? (Date.now() - state.puzzleLoadedAt) / 1000
    : 999;

  const isCorrect = answer === state.currentAnswer;

  eventBus.emit('ANSWER_SUBMITTED', { sessionId, answer, isCorrect });

  const newStreak = isCorrect ? state.streak + 1 : 0;
  const { points, timeChange, multiplier } = calculateScore(isCorrect, newStreak, answerTimeSeconds);

  state.score += points;
  state.timeLeft = Math.max(0, state.timeLeft + timeChange);
  state.streak = newStreak;
  state.longestStreak = Math.max(state.longestStreak, newStreak);

  if (isCorrect) {
    state.puzzlesSolved += 1;
    eventBus.emit('CORRECT_ANSWER', { sessionId, score: state.score, streak: state.streak });

    if ([3, 5, 10].includes(state.streak)) {
      eventBus.emit('COMBO_ACHIEVED', { sessionId, streak: state.streak, multiplier });
    }
  } else {
    eventBus.emit('WRONG_ANSWER', { sessionId, timeLeft: state.timeLeft });
  }

  // Clear puzzle; caller must load next
  state.currentAnswer = null;
  state.puzzleLoadedAt = null;

  if (state.timeLeft <= 0) {
    endSession(sessionId);
  }

  return { state, correct: isCorrect, points, timeChange, multiplier };
}

export function tickTime(sessionId: string, elapsed: number): GameState | null {
  const state = activeSessions.get(sessionId);
  if (!state || !state.active) return null;

  state.timeLeft = Math.max(0, state.timeLeft - elapsed);
  eventBus.emit('TIME_UPDATED', { sessionId, timeLeft: state.timeLeft });

  if (state.timeLeft <= 0) {
    endSession(sessionId);
  }

  return state;
}

export function endSession(sessionId: string): GameState | null {
  const state = activeSessions.get(sessionId);
  if (!state) return null;

  state.active = false;
  eventBus.emit('GAME_OVER', {
    sessionId,
    score: state.score,
    puzzlesSolved: state.puzzlesSolved,
    longestStreak: state.longestStreak,
  });

  return state;
}

export function getSession(sessionId: string): GameState | null {
  return activeSessions.get(sessionId) ?? null;
}
