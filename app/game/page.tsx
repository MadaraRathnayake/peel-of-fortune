'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Client-side game events mirror the server-side EventBus
type ClientEvent =
  | { type: 'GAME_STARTED' }
  | { type: 'PUZZLE_LOADED'; imageUrl: string }
  | { type: 'ANSWER_SUBMITTED'; answer: number }
  | { type: 'CORRECT_ANSWER'; points: number; multiplier: number }
  | { type: 'WRONG_ANSWER' }
  | { type: 'COMBO_ACHIEVED'; streak: number }
  | { type: 'GAME_OVER'; score: number; puzzlesSolved: number; longestStreak: number };

interface GameResult {
  score: number;
  puzzlesSolved: number;
  longestStreak: number;
  duration: number;
}

type Phase = 'idle' | 'playing' | 'over';

interface FeedbackState {
  kind: 'correct' | 'wrong' | 'combo' | 'info';
  headline: string;
  sub: string;
  key: number;
}

export default function GamePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [sessionId, setSessionId] = useState('');
  const [puzzleUrl, setPuzzleUrl] = useState('');
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [loadingPuzzle, setLoadingPuzzle] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef('');
  const feedbackKeyRef = useRef(0);

  const emit = useCallback((event: ClientEvent) => {
    console.log('[GameEvent]', event.type, event);
  }, []);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const showFeedback = (kind: FeedbackState['kind'], headline: string, sub: string) => {
    feedbackKeyRef.current += 1;
    setFeedback({ kind, headline, sub, key: feedbackKeyRef.current });
    if (feedbackRef.current) clearTimeout(feedbackRef.current);
    feedbackRef.current = setTimeout(() => setFeedback(null), kind === 'combo' ? 1800 : 1400);
  };

  const endGame = useCallback(async (sid: string, finalScore: number) => {
    clearTimer();
    try {
      const res = await fetch('/api/game/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid }),
      });
      const data = await res.json();
      setResult({
        score: data.score ?? finalScore,
        puzzlesSolved: data.puzzlesSolved ?? 0,
        longestStreak: data.longestStreak ?? 0,
        duration: data.duration ?? 0,
      });
    } catch {
      setResult({ score: finalScore, puzzlesSolved: 0, longestStreak: 0, duration: 0 });
    }
    setPhase('over');
    emit({ type: 'GAME_OVER', score: finalScore, puzzlesSolved: 0, longestStreak: 0 });
  }, [emit]);

  const loadPuzzle = useCallback(async (sid: string) => {
    setLoadingPuzzle(true);
    setPuzzleUrl('');
    setAnswer('');
    try {
      const res = await fetch(`/api/game/puzzle?sessionId=${sid}`);
      const data = await res.json();
      if (data.gameOver || res.status === 410) {
        endGame(sid, score);
        return;
      }
      if (!res.ok) { return; }
      setPuzzleUrl(data.question);
      setScore(data.score);
      setTimeLeft(data.timeLeft);
      setStreak(data.streak);
      emit({ type: 'PUZZLE_LOADED', imageUrl: data.question });
      setTimeout(() => answerInputRef.current?.focus(), 100);
    } catch {
      // silently handle
    } finally {
      setLoadingPuzzle(false);
    }
  }, [score, endGame, emit]);

  const startGame = async () => {
    setAuthError(false);
    const res = await fetch('/api/game/start', { method: 'POST' });
    if (res.status === 401) { setAuthError(true); return; }
    const data = await res.json();
    const sid = data.sessionId;
    setSessionId(sid);
    sessionRef.current = sid;
    setScore(0);
    setTimeLeft(data.timeLeft);
    setStreak(0);
    setResult(null);
    setFeedback(null);
    setPhase('playing');
    emit({ type: 'GAME_STARTED' });

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          endGame(sessionRef.current, score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    loadPuzzle(sid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || submitting) return;
    const num = Number(answer.trim());
    if (isNaN(num)) { showFeedback('info', 'Hmm!', 'Enter a valid number'); return; }

    setSubmitting(true);
    emit({ type: 'ANSWER_SUBMITTED', answer: num });

    try {
      const res = await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answer: num }),
      });
      const data = await res.json();

      if (data.gameOver || res.status === 410) {
        endGame(sessionId, data.score ?? score);
        return;
      }

      setScore(data.score);
      setTimeLeft(data.timeLeft);
      setStreak(data.streak);

      if (data.correct) {
        emit({ type: 'CORRECT_ANSWER', points: data.points, multiplier: data.multiplier });
        if ([3, 5, 10].includes(data.streak)) {
          emit({ type: 'COMBO_ACHIEVED', streak: data.streak });
          showFeedback('combo', `COMBO x${data.multiplier}!`, `+${data.points} pts  •  ${data.streak} streak 🔥`);
        } else {
          const sub = data.multiplier > 1
            ? `+${data.points} pts  •  x${data.multiplier} multiplier`
            : `+${data.points} pts  •  +5 seconds`;
          showFeedback('correct', 'CORRECT!', sub);
        }
        loadPuzzle(sessionId);
      } else {
        emit({ type: 'WRONG_ANSWER' });
        showFeedback('wrong', 'WRONG!', '−5 seconds');
        setAnswer('');
        answerInputRef.current?.focus();
        if (data.timeLeft <= 0) {
          endGame(sessionId, data.score);
        }
      }
    } catch {
      showFeedback('info', 'Error', 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => () => { clearTimer(); }, []);

  const timerColor = timeLeft <= 5 ? '#ff4d6d' : timeLeft <= 10 ? '#ff9f43' : '#f5c518';
  const timerPulse = timeLeft <= 5;
  const timerPct = Math.min(timeLeft / 30, 1);

  // ── AUTH ERROR ──
  if (authError) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔒</div>
          <p style={{ color: '#ff6b6b', fontWeight: 700, marginBottom: '1.25rem' }}>You must be logged in to play.</p>
          <Link href="/login"><button className="btn-primary">Login to Play</button></Link>
        </div>
      </main>
    );
  }

  // ── IDLE ──
  if (phase === 'idle') {
    return (
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(245,197,24,0.07) 0%, transparent 70%)',
      }}>
        <div style={{ textAlign: 'center', animation: 'fadeUp 0.45s ease both', maxWidth: 420, width: '100%' }}>
          <div style={{
            fontSize: '5rem',
            display: 'inline-block',
            marginBottom: '1rem',
            filter: 'drop-shadow(0 0 30px rgba(245,197,24,0.55))',
            animation: 'float 2.5s ease-in-out infinite',
          }}>🍌</div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.6rem',
            letterSpacing: '3px',
            color: 'var(--banana-yellow)',
            marginBottom: '0.5rem',
            textShadow: '0 0 30px rgba(245,197,24,0.4)',
          }}>READY TO PLAY?</h1>

          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem', fontSize: '0.98rem', fontWeight: 600 }}>
            30 seconds on the clock — solve as many banana puzzles as you can!
          </p>

          <div className="card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {[
                { icon: '⏱', label: 'Time limit', val: '30 sec' },
                { icon: '✅', label: 'Correct', val: '+10 pts & +5s' },
                { icon: '⚡', label: 'Quick answer', val: '+20 bonus' },
                { icon: '🔥', label: 'Max streak', val: '×3 multiplier' },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{
                  padding: '0.65rem 0.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: '1.1rem', marginBottom: '0.1rem' }}>{icon}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#e8eaf0' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={startGame}
            style={{ fontSize: '1.15rem', padding: '0.9rem 3rem', borderRadius: '16px', width: '100%', marginBottom: '1rem' }}
          >
            🎮 Start Game
          </button>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>← Home</Link>
            <Link href="/leaderboard" style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>🏆 Leaderboard</Link>
          </div>
        </div>

        <style>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes float { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
        `}</style>
      </main>
    );
  }

  // ── GAME OVER ──
  if (phase === 'over' && result) {
    const isHighScore = result.score > 0;
    return (
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(245,197,24,0.07) 0%, transparent 70%)',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 460, width: '100%', animation: 'gameOverEnter 0.6s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem', display: 'inline-block' }}>
            {result.score >= 300 ? '🏆' : result.score >= 150 ? '🥈' : '🏁'}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3rem',
            letterSpacing: '4px',
            background: 'linear-gradient(135deg, #ffd84d, #f5c518, #e8a800)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.25rem',
          }}>GAME OVER</h1>

          <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '2rem', fontWeight: 600, fontSize: '0.9rem' }}>
            {isHighScore ? 'Great run! Check your stats below.' : 'Better luck next time!'}
          </p>

          {/* Score hero */}
          <div className="card" style={{ marginBottom: '1rem', padding: '1.5rem 2rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Final Score
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '4rem',
              letterSpacing: '3px',
              color: 'var(--banana-yellow)',
              lineHeight: 1,
              textShadow: '0 0 40px rgba(245,197,24,0.5)',
            }}>
              {result.score.toLocaleString()}
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
            {[
              { label: 'Puzzles', value: result.puzzlesSolved, icon: '🧩' },
              { label: 'Best Streak', value: result.longestStreak, icon: '🔥' },
              { label: 'Duration', value: `${result.duration}s`, icon: '⏱' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="stat-chip">
                <span className="stat-chip-icon">{icon}</span>
                <span className="stat-chip-value">{value}</span>
                <span className="stat-chip-label">{label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={startGame} style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
              🎮 Play Again
            </button>
            <Link href="/leaderboard">
              <button className="btn-ghost" style={{ padding: '0.75rem 1.5rem' }}>🏆 Leaderboard</button>
            </Link>
            <Link href="/profile">
              <button className="btn-ghost" style={{ padding: '0.75rem 1.5rem' }}>👤 Profile</button>
            </Link>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</Link>
          </div>
        </div>

        <style>{`
          @keyframes gameOverEnter { from { opacity: 0; transform: scale(0.88) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        `}</style>
      </main>
    );
  }

  // ── PLAYING ──
  // Circular timer SVG values
  const RADIUS = 22;
  const CIRC = 2 * Math.PI * RADIUS;
  const dashOffset = CIRC * (1 - timerPct);

  return (
    <main style={{ minHeight: '100vh', padding: '0.75rem', maxWidth: 620, margin: '0 auto' }}>

      {/* ── HUD ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr auto 1fr',
        gap: '0.5rem',
        alignItems: 'stretch',
        marginBottom: '0.75rem',
      }}>
        {/* Back */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex' }}>
          <button title="Back to Home" style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            fontSize: '1rem',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}>←</button>
        </Link>

        {/* Score */}
        <div className="hud-box">
          <div className="hud-label">Score</div>
          <div className="hud-value" style={{ color: 'var(--banana-yellow)' }}>{score.toLocaleString()}</div>
        </div>

        {/* Timer — circular */}
        <div style={{
          position: 'relative',
          width: '76px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, rgba(19,29,46,0.96) 0%, rgba(10,15,24,0.99) 100%)',
          border: `1px solid ${timerPulse ? timerColor : 'rgba(245,197,24,0.18)'}`,
          borderRadius: '14px',
          boxShadow: timerPulse ? `0 0 20px ${timerColor}55` : '0 2px 14px rgba(0,0,0,0.45)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
          padding: '0.4rem',
        }}>
          <div className="hud-label">Time</div>
          <div style={{ position: 'relative', width: 52, height: 52 }}>
            <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
              {/* Track */}
              <circle cx="26" cy="26" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
              {/* Progress */}
              <circle
                cx="26" cy="26" r={RADIUS}
                fill="none"
                stroke={timerColor}
                strokeWidth="3"
                strokeDasharray={CIRC}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s',
                  filter: `drop-shadow(0 0 4px ${timerColor})`,
                }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              fontWeight: 900,
              color: timerColor,
              fontVariantNumeric: 'tabular-nums',
              animation: timerPulse ? 'timerPulse 0.6s ease-in-out infinite' : 'none',
            }}>
              {timeLeft}
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="hud-box" style={{
          borderColor: streak >= 3 ? 'rgba(255,159,67,0.4)' : undefined,
          boxShadow: streak >= 3 ? '0 0 16px rgba(255,159,67,0.2)' : undefined,
        }}>
          <div className="hud-label">Streak</div>
          <div className="hud-value" style={{
            color: streak >= 5 ? '#ff9f43' : streak >= 3 ? '#ffc26a' : '#e8eaf0',
            animation: streak >= 3 ? 'streak-fire 1s ease infinite' : 'none',
          }}>
            {streak >= 1 ? `${streak}🔥` : '—'}
          </div>
        </div>
      </div>

      {/* ── FEEDBACK ── */}
      <div style={{ position: 'relative', height: 72, marginBottom: '0.6rem' }}>
        {feedback && (
          <div
            key={feedback.key}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '14px',
              background:
                feedback.kind === 'correct' ? 'rgba(34,213,90,0.1)' :
                feedback.kind === 'wrong'   ? 'rgba(255,77,109,0.1)' :
                feedback.kind === 'combo'   ? 'rgba(245,197,24,0.12)' :
                                              'rgba(255,159,67,0.1)',
              border: `1px solid ${
                feedback.kind === 'correct' ? 'rgba(34,213,90,0.35)' :
                feedback.kind === 'wrong'   ? 'rgba(255,77,109,0.35)' :
                feedback.kind === 'combo'   ? 'rgba(245,197,24,0.45)' :
                                              'rgba(255,159,67,0.3)'
              }`,
              boxShadow:
                feedback.kind === 'correct' ? '0 0 20px rgba(34,213,90,0.15)' :
                feedback.kind === 'wrong'   ? '0 0 20px rgba(255,77,109,0.15)' :
                feedback.kind === 'combo'   ? '0 0 28px rgba(245,197,24,0.2)' : 'none',
              animation: feedback.kind === 'combo'
                ? 'feedbackPop 0.3s cubic-bezier(0.34,1.56,0.64,1), combo-shake 0.5s 0.3s ease'
                : 'feedbackPop 0.28s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-display)',
              fontSize: feedback.kind === 'combo' ? '1.6rem' : '1.35rem',
              letterSpacing: '2px',
              color:
                feedback.kind === 'correct' ? '#22d55a' :
                feedback.kind === 'wrong'   ? '#ff4d6d' :
                feedback.kind === 'combo'   ? '#f5c518' :
                                              '#ff9f43',
            }}>
              {feedback.kind === 'correct' && '✅'}
              {feedback.kind === 'wrong'   && '❌'}
              {feedback.kind === 'combo'   && '⚡'}
              {feedback.kind === 'info'    && '💬'}
              {feedback.headline}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: '0.5px' }}>
              {feedback.sub}
            </div>
          </div>
        )}
      </div>

      {/* ── PUZZLE ── */}
      <div className="card" style={{
        marginBottom: '0.85rem',
        minHeight: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        background: loadingPuzzle
          ? 'linear-gradient(135deg, rgba(19,29,46,0.92) 0%, rgba(13,18,30,0.97) 100%)'
          : undefined,
      }}>
        {loadingPuzzle ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
            <span style={{ fontSize: '2rem', display: 'inline-block', animation: 'spin 0.9s linear infinite' }}>🍌</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.5px' }}>Loading puzzle...</span>
          </div>
        ) : puzzleUrl ? (
          <img
            src={puzzleUrl}
            alt="Banana puzzle"
            style={{
              maxWidth: '100%',
              borderRadius: '10px',
              display: 'block',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
            onError={() => setPuzzleUrl('')}
          />
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>No puzzle loaded</div>
        )}
      </div>

      {/* ── ANSWER FORM ── */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.65rem' }}>
        <input
          ref={answerInputRef}
          className="input"
          type="number"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Enter the missing number..."
          disabled={loadingPuzzle || submitting}
          autoComplete="off"
          style={{ flex: 1, fontSize: '1.05rem', height: '52px' }}
        />
        <button
          className="btn-primary"
          type="submit"
          disabled={loadingPuzzle || submitting || !answer.trim()}
          style={{ whiteSpace: 'nowrap', height: '52px', padding: '0 1.6rem', fontSize: '0.98rem' }}
        >
          {submitting ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 13, height: 13, border: '2px solid rgba(0,0,0,0.25)', borderTopColor: '#000', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            </span>
          ) : 'Submit →'}
        </button>
      </form>

      <style>{`
        @keyframes feedbackPop { from { opacity: 0; transform: scale(0.72) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes combo-shake { 0%,100%{transform:translateX(0) rotate(0)} 20%{transform:translateX(-4px) rotate(-1deg)} 40%{transform:translateX(4px) rotate(1deg)} 60%{transform:translateX(-3px) rotate(-0.5deg)} 80%{transform:translateX(3px) rotate(0.5deg)} }
        @keyframes timerPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.14); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes streak-fire { 0%, 100% { filter: hue-rotate(0deg) brightness(1); } 50% { filter: hue-rotate(15deg) brightness(1.25); } }
      `}</style>
    </main>
  );
}
