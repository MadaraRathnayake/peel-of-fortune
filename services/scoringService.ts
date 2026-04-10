// Scoring rules as per game concept
export const SCORING = {
  CORRECT_BASE: 10,
  WRONG_TIME_PENALTY: 5,   // seconds deducted
  CORRECT_TIME_BONUS: 5,   // seconds added
  SPEED_BONUS_THRESHOLD: 3, // seconds
  SPEED_BONUS_POINTS: 20,
  COMBO_THRESHOLDS: [
    { streak: 10, multiplier: 3 },
    { streak: 5, multiplier: 2 },
    { streak: 3, multiplier: 1.5 },
  ],
  INITIAL_TIME: 30,
} as const;

export function getMultiplier(streak: number): number {
  for (const { streak: threshold, multiplier } of SCORING.COMBO_THRESHOLDS) {
    if (streak >= threshold) return multiplier;
  }
  return 1;
}

export function calculateScore(
  isCorrect: boolean,
  streak: number,
  answerTimeSeconds: number
): { points: number; timeChange: number; multiplier: number } {
  if (!isCorrect) {
    return { points: 0, timeChange: -SCORING.WRONG_TIME_PENALTY, multiplier: 1 };
  }

  const multiplier = getMultiplier(streak);
  let points = SCORING.CORRECT_BASE;

  if (answerTimeSeconds <= SCORING.SPEED_BONUS_THRESHOLD) {
    points += SCORING.SPEED_BONUS_POINTS;
  }

  points = Math.round(points * multiplier);

  return {
    points,
    timeChange: SCORING.CORRECT_TIME_BONUS,
    multiplier,
  };
}
