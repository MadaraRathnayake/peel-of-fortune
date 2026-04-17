'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ClientEvent =
  | { type: 'GAME_STARTED' }
  | { type: 'PUZZLE_LOADED'; imageUrl: string }
  | { type: 'ANSWER_SUBMITTED'; answer: number }
  | { type: 'CORRECT_ANSWER'; points: number; multiplier: number }
  | { type: 'WRONG_ANSWER' }
  | { type: 'COMBO_ACHIEVED'; streak: number }
  | { type: 'GAME_OVER'; score: number; puzzlesSolved: number; longestStreak: number };

interface GameResult { score: number; puzzlesSolved: number; longestStreak: number; duration: number; }
type Phase = 'idle' | 'playing' | 'over';
interface FeedbackState { kind: 'correct' | 'wrong' | 'combo' | 'info'; headline: string; sub: string; key: number; }

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
  const [scoreFlash, setScoreFlash] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef('');
  const feedbackKeyRef = useRef(0);
  const scoreRef = useRef(0);

  useEffect(() => { scoreRef.current = score; }, [score]);

  const emit = useCallback((event: ClientEvent) => { console.log('[GameEvent]', event.type, event); }, []);
  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; };

  const showFeedback = (kind: FeedbackState['kind'], headline: string, sub: string) => {
    feedbackKeyRef.current += 1;
    setFeedback({ kind, headline, sub, key: feedbackKeyRef.current });
    if (feedbackRef.current) clearTimeout(feedbackRef.current);
    feedbackRef.current = setTimeout(() => setFeedback(null), kind === 'combo' ? 1900 : 1450);
  };

  const endGame = useCallback(async (sid: string, finalScore: number) => {
    clearTimer();
    try {
      const res = await fetch('/api/game/end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: sid }) });
      const data = await res.json();
      setResult({ score: data.score ?? finalScore, puzzlesSolved: data.puzzlesSolved ?? 0, longestStreak: data.longestStreak ?? 0, duration: data.duration ?? 0 });
    } catch { setResult({ score: finalScore, puzzlesSolved: 0, longestStreak: 0, duration: 0 }); }
    setPhase('over');
    emit({ type: 'GAME_OVER', score: finalScore, puzzlesSolved: 0, longestStreak: 0 });
  }, [emit]);

  const loadPuzzle = useCallback(async (sid: string) => {
    setLoadingPuzzle(true); setPuzzleUrl(''); setAnswer('');
    try {
      const res = await fetch(`/api/game/puzzle?sessionId=${sid}`);
      const data = await res.json();
      if (data.gameOver || res.status === 410) { endGame(sid, score); return; }
      if (!res.ok) return;
      setPuzzleUrl(data.question); setScore(data.score); setTimeLeft(data.timeLeft); setStreak(data.streak);
      emit({ type: 'PUZZLE_LOADED', imageUrl: data.question });
      setTimeout(() => answerInputRef.current?.focus(), 100);
    } catch {} finally { setLoadingPuzzle(false); }
  }, [score, endGame, emit]);

  const startGame = async () => {
    setAuthError(false);
    const res = await fetch('/api/game/start', { method: 'POST' });
    if (res.status === 401) { setAuthError(true); return; }
    const data = await res.json();
    const sid = data.sessionId;
    setSessionId(sid); sessionRef.current = sid;
    setScore(0); setTimeLeft(data.timeLeft); setStreak(0); setResult(null); setFeedback(null);
    setPhase('playing');
    emit({ type: 'GAME_STARTED' });
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearTimer(); endGame(sessionRef.current, score); return 0; }
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
      const res = await fetch('/api/game/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, answer: num }) });
      const data = await res.json();
      if (data.gameOver || res.status === 410) { endGame(sessionId, data.score ?? score); return; }
      setScore(data.score); setTimeLeft(data.timeLeft); setStreak(data.streak);
      setScoreFlash(true); setTimeout(() => setScoreFlash(false), 400);
      if (data.correct) {
        emit({ type: 'CORRECT_ANSWER', points: data.points, multiplier: data.multiplier });
        if ([3, 5, 10].includes(data.streak)) {
          emit({ type: 'COMBO_ACHIEVED', streak: data.streak });
          showFeedback('combo', `COMBO ×${data.multiplier}!`, `+${data.points} pts  •  ${data.streak} streak 🔥`);
        } else {
          const sub = data.multiplier > 1 ? `+${data.points} pts  •  ×${data.multiplier} multiplier` : `+${data.points} pts  •  +5 seconds ⏱`;
          showFeedback('correct', 'CORRECT!', sub);
        }
        loadPuzzle(sessionId);
      } else {
        emit({ type: 'WRONG_ANSWER' });
        showFeedback('wrong', 'WRONG!', '−5 seconds penalty');
        setAnswer(''); answerInputRef.current?.focus();
        if (data.timeLeft <= 0) endGame(sessionId, data.score);
      }
    } catch { showFeedback('info', 'Error', 'Submission failed'); }
    finally { setSubmitting(false); }
  };

  useEffect(() => () => { clearTimer(); }, []);

  const timerColor = timeLeft <= 5 ? '#ff1744' : timeLeft <= 10 ? '#ff7b00' : '#f5c518';
  const timerPulse = timeLeft <= 5;
  const timerPct = Math.min(timeLeft / 30, 1);
  const RADIUS = 24; const CIRC = 2 * Math.PI * RADIUS;

  /* ── AUTH ERROR ── */
  if (authError) return (
    <main style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div className="card" style={{ textAlign:'center', maxWidth:360, position:'relative' }}>
        <div className="corner-tl"/><div className="corner-tr"/><div className="corner-bl"/><div className="corner-br"/>
        <div style={{ fontSize:'3.2rem', marginBottom:'0.75rem', filter:'drop-shadow(0 0 20px rgba(255,71,87,0.6))' }}>🔒</div>
        <p style={{ color:'#ff6b6b', fontWeight:700, marginBottom:'1.5rem', fontSize:'1.05rem' }}>You must be logged in to play.</p>
        <Link href="/login"><button className="btn-primary" style={{ width:'100%' }}>Login to Play</button></Link>
      </div>
    </main>
  );

  /* ─────────────── IDLE ─────────────── */
  if (phase === 'idle') return (
    <main style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      padding:'1.5rem', position:'relative', overflow:'hidden',
    }}>
      {/* Ambient orbs */}
      <div style={{ position:'fixed', top:'10%', left:'5%', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,197,24,0.08) 0%, transparent 70%)', pointerEvents:'none', zIndex:0, animation:'orbDrift 10s ease-in-out infinite' }}/>
      <div style={{ position:'fixed', bottom:'15%', right:'5%', width:250, height:250, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)', pointerEvents:'none', zIndex:0, animation:'orbDrift 13s ease-in-out infinite reverse' }}/>
      {/* Decorative stars */}
      {[{x:'15%',y:'20%',d:'0s'},{x:'85%',y:'15%',d:'0.8s'},{x:'8%',y:'70%',d:'1.4s'},{x:'92%',y:'65%',d:'0.3s'},{x:'50%',y:'88%',d:'1.1s'}].map(({x,y,d},i) => (
        <div key={i} style={{ position:'fixed', left:x, top:y, width:4, height:4, borderRadius:'50%', background:'rgba(245,197,24,0.8)', pointerEvents:'none', zIndex:0, animation:`starTwinkle ${2.2+i*0.4}s ease-in-out infinite`, animationDelay:d, filter:'blur(0.5px)' }}/>
      ))}

      <div style={{ textAlign:'center', animation:'fadeUp 0.45s ease both', maxWidth:540, width:'100%', position:'relative', zIndex:1 }}>
        {/* Banana hero */}
        <div style={{ position:'relative', display:'inline-block', marginBottom:'1rem' }}>
          <div style={{ position:'absolute', inset:'-40px', borderRadius:'50%', background:'radial-gradient(circle, rgba(245,197,24,0.15) 0%, rgba(245,197,24,0.04) 55%, transparent 75%)', animation:'glowPulse 3s ease-in-out infinite' }}/>
          <div style={{ fontSize:'6rem', display:'inline-block', filter:'drop-shadow(0 0 40px rgba(245,197,24,0.75)) drop-shadow(0 0 80px rgba(245,197,24,0.3))', animation:'heroFloat 3.2s ease-in-out infinite', position:'relative', zIndex:1, userSelect:'none' }}>🍌</div>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily:'var(--font-d)', fontSize:'clamp(2.8rem,9vw,4rem)', letterSpacing:'5px',
          lineHeight:1, marginBottom:'0.3rem',
          background:'linear-gradient(135deg,#fff8d0 0%,#ffd84d 35%,#f5c518 65%,#c88a00 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          backgroundClip:'text',
          filter:'drop-shadow(0 0 30px rgba(245,197,24,0.5))',
          animation:'titleReveal 0.6s ease both',
        }}>
          PEEL OF FORTUNE
        </h1>
        <div style={{ fontFamily:'var(--font-hud)', fontSize:'0.68rem', color:'rgba(255,255,255,0.3)', letterSpacing:'5px', textTransform:'uppercase', fontWeight:700, marginBottom:'0.6rem' }}>
          ◆ BANANA PUZZLE SURVIVAL ◆
        </div>
        <p style={{ color:'rgba(255,255,255,0.45)', marginBottom:'2rem', fontSize:'0.96rem', fontWeight:600, lineHeight:1.5 }}>
          Count the bananas. Beat the clock.<br/>
          <span style={{ color:'rgba(245,197,24,0.65)' }}>30 seconds</span> — survive as long as you can.
        </p>

        {/* Rules grid */}
        <div className="card" style={{ marginBottom:'1.5rem', padding:'1.4rem' }}>
          <div className="corner-tl"/><div className="corner-tr"/><div className="corner-bl"/><div className="corner-br"/>
          <div style={{ fontFamily:'var(--font-hud)', fontSize:'0.58rem', color:'rgba(255,255,255,0.25)', letterSpacing:'3px', textTransform:'uppercase', fontWeight:700, marginBottom:'1rem' }}>How to Play</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'0.6rem' }}>
            {[
              { icon:'⏱', label:'Time limit',   val:'30 sec start',   color:'#f5c518', bg:'rgba(245,197,24,0.06)' },
              { icon:'✅', label:'Correct answer', val:'+10 pts · +5s',  color:'#00e676', bg:'rgba(0,230,118,0.04)' },
              { icon:'⚡', label:'Quick answer',  val:'+20 bonus pts',  color:'#00f0ff', bg:'rgba(0,240,255,0.04)' },
              { icon:'🔥', label:'Streak combo',  val:'up to ×3 multi', color:'#ff7b00', bg:'rgba(255,123,0,0.04)' },
            ].map(({ icon, label, val, color, bg }) => (
              <div key={label} style={{
                padding:'0.85rem 0.9rem', borderRadius:'10px',
                background: bg, border:`1px solid ${color}20`,
                display:'flex', flexDirection:'column', gap:'0.28rem',
                transition:'border-color 0.2s, transform 0.2s',
                cursor:'default',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = color+'44'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = color+'20'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
              >
                <span style={{ fontSize:'1.3rem' }}>{icon}</span>
                <span style={{ fontFamily:'var(--font-hud)', fontSize:'0.52rem', fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'1.5px' }}>{label}</span>
                <span style={{ fontFamily:'var(--font-hud)', fontSize:'0.84rem', fontWeight:800, color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button className="btn-primary" onClick={startGame}
          style={{ fontSize:'1.25rem', padding:'1.15rem 0', borderRadius:'16px', width:'100%', marginBottom:'0.9rem', letterSpacing:'1px', boxShadow:'0 8px 50px rgba(245,197,24,0.7)' }}>
          🎮 &nbsp;START GAME
        </button>

        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/leaderboard" style={{ textDecoration:'none' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.55rem 1.2rem', borderRadius:'10px', background:'rgba(245,197,24,0.05)', border:'1px solid rgba(245,197,24,0.18)', color:'rgba(255,255,255,0.45)', fontSize:'0.84rem', fontWeight:700, transition:'all 0.2s', cursor:'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--y)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,197,24,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,197,24,0.18)'; }}
            >🏆 Leaderboard</div>
          </Link>
          <Link href="/profile" style={{ textDecoration:'none' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.55rem 1.2rem', borderRadius:'10px', background:'rgba(0,240,255,0.03)', border:'1px solid rgba(0,240,255,0.15)', color:'rgba(255,255,255,0.35)', fontSize:'0.84rem', fontWeight:700, transition:'all 0.2s', cursor:'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--cyan)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,240,255,0.35)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,240,255,0.15)'; }}
            >👤 Profile</div>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes heroFloat{0%,100%{transform:translateY(0) rotate(-4deg)}30%{transform:translateY(-18px) rotate(3deg)}70%{transform:translateY(-8px) rotate(-2deg)}}
        @keyframes glowPulse{0%,100%{opacity:0.7}50%{opacity:1}}
        @keyframes titleReveal{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes orbDrift{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-15px)}}
        @keyframes starTwinkle{0%,100%{opacity:0.12;transform:scale(1)}50%{opacity:0.8;transform:scale(1.6)}}
      `}</style>
    </main>
  );

  /* ─────────────── GAME OVER ─────────────── */
  if (phase === 'over' && result) {
    const tier =
      result.score >= 500 ? { icon:'💎', label:'DIAMOND', color:'#74c0fc', msg:"LEGENDARY. You're in a class of your own.", glow:'rgba(116,192,252,0.4)' } :
      result.score >= 300 ? { icon:'🥇', label:'GOLD',    color:'#f5c518', msg:'Incredible run! You are a top player.',   glow:'rgba(245,197,24,0.45)' } :
      result.score >= 150 ? { icon:'🥈', label:'SILVER',  color:'#adb5bd', msg:'Great effort! Keep climbing the ranks.', glow:'rgba(173,181,189,0.35)' } :
                            { icon:'🥉', label:'BRONZE',  color:'#cd7f32', msg:'Good start! Keep practicing.',           glow:'rgba(205,127,50,0.35)' };

    return (
      <main style={{
        minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.25rem',
        background:`radial-gradient(ellipse 70% 60% at 50% 45%, rgba(245,197,24,0.07) 0%, transparent 62%)`,
        position:'relative', overflow:'hidden',
      }}>
        {/* Ambient glow behind score */}
        <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, borderRadius:'50%', background:`radial-gradient(circle, ${tier.glow}20 0%, transparent 70%)`, pointerEvents:'none', zIndex:0 }}/>
        <div style={{ textAlign:'center', maxWidth:520, width:'100%', animation:'enterScale 0.6s cubic-bezier(0.34,1.56,0.64,1) both', position:'relative', zIndex:1 }}>

          {/* Trophy + tier badge */}
          <div style={{ position:'relative', display:'inline-block', marginBottom:'0.6rem' }}>
            <div style={{ position:'absolute', inset:'-24px', borderRadius:'50%', background:`radial-gradient(circle, ${tier.glow}25 0%, transparent 70%)`, animation:'glowPulseOrb 2.5s ease-in-out infinite' }}/>
            <div style={{ fontSize:'4.5rem', filter:`drop-shadow(0 0 32px ${tier.color}99)`, display:'inline-block', animation:'badgePop 0.7s cubic-bezier(0.34,1.56,0.64,1) both', position:'relative', zIndex:1 }}>{tier.icon}</div>
          </div>

          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.28rem 1.1rem', borderRadius:'999px', marginBottom:'0.7rem', background:`rgba(0,0,0,0.5)`, border:`1px solid ${tier.color}44`, backdropFilter:'blur(12px)' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:tier.color, boxShadow:`0 0 8px ${tier.color}`, display:'inline-block' }}/>
            <span style={{ fontFamily:'var(--font-hud)', fontSize:'0.7rem', fontWeight:700, color:tier.color, letterSpacing:'2.5px' }}>{tier.label} RANK</span>
          </div>

          <h1 style={{
            fontFamily:'var(--font-d)', fontSize:'3.8rem', letterSpacing:'7px',
            background:'linear-gradient(135deg,#fff8d0 0%,#ffd84d 40%,#f5c518 70%,#c88a00 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            marginBottom:'0.25rem', lineHeight:1,
            filter:'drop-shadow(0 0 20px rgba(245,197,24,0.4))',
          }}>GAME OVER</h1>
          <p style={{ color:'rgba(255,255,255,0.38)', marginBottom:'1.75rem', fontWeight:600, fontSize:'0.9rem' }}>{tier.msg}</p>

          {/* Score hero */}
          <div className="card" style={{
            marginBottom:'1rem', padding:'2rem', position:'relative',
            background:'linear-gradient(145deg, rgba(24,18,0,0.92), rgba(10,8,0,0.97))',
            border:`1.5px solid rgba(245,197,24,0.4)`,
            boxShadow:'0 0 80px rgba(245,197,24,0.2), 0 12px 64px rgba(0,0,0,0.8)',
            animation:'glowPulse 2.5s ease infinite',
          }}>
            <div className="corner-tl"/><div className="corner-tr"/><div className="corner-bl"/><div className="corner-br"/>
            <div style={{ fontFamily:'var(--font-hud)', fontSize:'0.58rem', color:'rgba(255,255,255,0.3)', fontWeight:700, letterSpacing:'3.5px', textTransform:'uppercase', marginBottom:'0.5rem' }}>Final Score</div>
            <div style={{ fontFamily:'var(--font-hud)', fontSize:'4.8rem', letterSpacing:'3px', color:'var(--y)', lineHeight:1, textShadow:'0 0 60px rgba(245,197,24,0.8)', fontVariantNumeric:'tabular-nums', animation:'countUp 0.6s ease both' }}>
              {result.score.toLocaleString()}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.75rem', marginBottom:'1.75rem' }}>
            {[
              { label:'Puzzles', value:result.puzzlesSolved, icon:'🧩', color:'#00f0ff' },
              { label:'Best Streak', value:result.longestStreak, icon:'🔥', color:'#ff7b00' },
              { label:'Duration', value:`${result.duration}s`, icon:'⏱', color:'#f5c518' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="stat-chip" style={{ border:`1px solid ${color}18` }}>
                <span className="stat-chip-icon">{icon}</span>
                <span className="stat-chip-value" style={{ color, textShadow:`0 0 18px ${color}55` }}>{value}</span>
                <span className="stat-chip-label">{label}</span>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap', marginBottom:'1.1rem' }}>
            <button className="btn-primary" onClick={startGame} style={{ padding:'0.9rem 2.2rem', fontSize:'1rem' }}>🎮 Play Again</button>
            <Link href="/leaderboard"><button className="btn-ghost" style={{ padding:'0.82rem 1.6rem' }}>🏆 Leaderboard</button></Link>
            <Link href="/profile"><button className="btn-ghost" style={{ padding:'0.82rem 1.4rem' }}>👤 Profile</button></Link>
          </div>
          <Link href="/" style={{ color:'rgba(255,255,255,0.22)', fontSize:'0.82rem', textDecoration:'none', fontWeight:700 }}>← Back to Home</Link>
        </div>

        <style>{`
          @keyframes enterScale{from{opacity:0;transform:scale(0.85) translateY(24px)}to{opacity:1;transform:scale(1) translateY(0)}}
          @keyframes glowPulse{0%,100%{box-shadow:0 0 40px rgba(245,197,24,0.18),0 12px 64px rgba(0,0,0,0.8)}50%{box-shadow:0 0 80px rgba(245,197,24,0.4),0 12px 64px rgba(0,0,0,0.8)}}
          @keyframes glowPulseOrb{0%,100%{opacity:0.6}50%{opacity:1}}
          @keyframes badgePop{0%{opacity:0;transform:scale(0.4) rotate(-10deg)}70%{transform:scale(1.1) rotate(2deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
          @keyframes countUp{from{opacity:0;transform:translateY(12px) scale(0.85)}to{opacity:1;transform:translateY(0) scale(1)}}
        `}</style>
      </main>
    );
  }

  /* ─────────────── PLAYING ─────────────── */
  const dashOffset = CIRC * (1 - timerPct);
  const multiplier = streak >= 10 ? 3 : streak >= 5 ? 2 : streak >= 3 ? 1.5 : 1;

  const feedbackColors = {
    correct: { bg:'rgba(0,230,118,0.09)', border:'rgba(0,230,118,0.45)', text:'#00e676', glow:'rgba(0,230,118,0.18)' },
    wrong:   { bg:'rgba(255,23,68,0.09)',  border:'rgba(255,23,68,0.45)',  text:'#ff1744', glow:'rgba(255,23,68,0.18)' },
    combo:   { bg:'rgba(245,197,24,0.11)', border:'rgba(245,197,24,0.55)', text:'#f5c518', glow:'rgba(245,197,24,0.22)' },
    info:    { bg:'rgba(0,240,255,0.06)',  border:'rgba(0,240,255,0.3)',   text:'#00f0ff', glow:'none' },
  };

  /* background flash color for correct/wrong */
  const arenaFlash =
    feedback?.kind === 'correct' ? 'rgba(0,230,118,0.025)' :
    feedback?.kind === 'wrong'   ? 'rgba(255,23,68,0.025)'  :
    feedback?.kind === 'combo'   ? 'rgba(245,197,24,0.03)' : 'transparent';

  return (
    <main style={{
      minHeight:'100vh', padding:'0.65rem', maxWidth:660, margin:'0 auto',
      display:'flex', flexDirection:'column', gap:'0.55rem',
      position:'relative',
      background: arenaFlash,
      transition:'background 0.3s',
    }}>
      {/* Scanline overlay */}
      <div style={{ position:'fixed', inset:0, backgroundImage:'repeating-linear-gradient(0deg,rgba(0,0,0,0.04) 0px,rgba(0,0,0,0.04) 1px,transparent 1px,transparent 4px)', pointerEvents:'none', zIndex:9, opacity:0.7 }}/>

      {/* Ambient top glow */}
      <div style={{ position:'fixed', top:0, left:'50%', transform:'translateX(-50%)', width:400, height:200, background:'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(245,197,24,0.07) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }}/>

      {/* ── GAME HEADER STRIP ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0.45rem 0.75rem',
        background:'rgba(3,5,13,0.7)',
        border:'1px solid rgba(245,197,24,0.1)',
        borderRadius:'var(--r-md)',
        backdropFilter:'blur(16px)',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,rgba(245,197,24,0.4),transparent)' }}/>
        <Link href="/" style={{ textDecoration:'none' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.45rem', color:'rgba(255,255,255,0.3)', fontSize:'0.82rem', fontWeight:700, transition:'color 0.2s', cursor:'pointer' }}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.7)'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.3)'}
          >← <span>Home</span></div>
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <span style={{ fontSize:'1rem' }}>🍌</span>
          <span style={{ fontFamily:'var(--font-d)', fontSize:'1.1rem', letterSpacing:'3px', color:'var(--y)', textShadow:'0 0 20px rgba(245,197,24,0.5)' }}>PEEL OF FORTUNE</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#00e676', boxShadow:'0 0 8px #00e676', animation:'pulse 1.5s ease-in-out infinite' }}/>
          <span style={{ fontFamily:'var(--font-hud)', fontSize:'0.58rem', color:'rgba(255,255,255,0.3)', fontWeight:600, letterSpacing:'1px' }}>LIVE</span>
        </div>
      </div>

      {/* ── HUD ROW ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 90px 1fr', gap:'0.5rem', alignItems:'stretch' }}>

        {/* Score */}
        <div className="hud-box" style={{
          borderColor: scoreFlash ? 'rgba(245,197,24,0.6)' : undefined,
          boxShadow: scoreFlash ? '0 0 40px rgba(245,197,24,0.35), inset 0 1px 0 rgba(255,255,255,0.06)' : undefined,
          transition: 'all 0.2s',
        }}>
          <div className="corner-tl" style={{ width:12, height:12, top:5, left:5 }}/><div className="corner-br" style={{ width:12, height:12, bottom:5, right:5 }}/>
          <div className="hud-label">Score</div>
          <div className="hud-value" style={{ animation: scoreFlash ? 'scoreFlash 0.35s ease' : 'none' }}>{score.toLocaleString()}</div>
        </div>

        {/* Circular Timer */}
        <div style={{
          position:'relative', display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          background:'linear-gradient(160deg, rgba(10,17,34,0.98) 0%, rgba(4,7,18,0.99) 100%)',
          border:`1.5px solid ${timerPulse ? timerColor : 'rgba(245,197,24,0.2)'}`,
          borderRadius:'var(--r-md)',
          boxShadow: timerPulse ? `0 0 40px ${timerColor}66, 0 0 0 1px ${timerColor}22 inset` : '0 4px 24px rgba(0,0,0,0.55)',
          transition:'border-color 0.3s, box-shadow 0.3s',
          padding:'0.4rem 0.25rem',
          overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:`linear-gradient(90deg, transparent, ${timerColor}cc, transparent)` }} />
          <div className="hud-label">Time</div>
          <div style={{ position:'relative', width:56, height:56 }}>
            <svg width="56" height="56" style={{ transform:'rotate(-90deg)' }}>
              <circle cx="28" cy="28" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5"/>
              <circle cx="28" cy="28" r={RADIUS} fill="none" stroke={timerColor} strokeWidth="3.5"
                strokeDasharray={CIRC} strokeDashoffset={dashOffset} strokeLinecap="round"
                style={{ transition:'stroke-dashoffset 0.95s linear, stroke 0.3s', filter:`drop-shadow(0 0 8px ${timerColor})` }}/>
            </svg>
            <div style={{
              position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--font-hud)', fontSize:'1.3rem', fontWeight:800, color:timerColor,
              fontVariantNumeric:'tabular-nums',
              animation: timerPulse ? 'timerPulse 0.65s ease-in-out infinite' : 'none',
              textShadow: timerPulse ? `0 0 16px ${timerColor}` : 'none',
            }}>{timeLeft}</div>
          </div>
        </div>

        {/* Streak */}
        <div className="hud-box" style={{
          borderColor: streak >= 3 ? `rgba(255,123,0,0.45)` : undefined,
          boxShadow: streak >= 5 ? '0 0 28px rgba(255,123,0,0.25)' : undefined,
          transition: 'all 0.3s',
        }}>
          <div className="corner-tr" style={{ width:12, height:12, top:5, right:5 }}/><div className="corner-bl" style={{ width:12, height:12, bottom:5, left:5 }}/>
          <div className="hud-label">Streak</div>
          <div className="hud-value" style={{
            color: streak >= 10 ? '#ff7b00' : streak >= 5 ? '#ff9f43' : streak >= 3 ? '#ffb56a' : 'rgba(255,255,255,0.7)',
            animation: streak >= 3 ? 'streakFire 1.2s ease infinite' : 'none',
            fontSize: streak >= 10 ? '1.1rem' : undefined,
            textShadow: streak >= 5 ? '0 0 20px rgba(255,123,0,0.6)' : 'none',
          }}>
            {streak >= 1 ? `${streak}🔥` : '—'}
          </div>
        </div>
      </div>

      {/* ── MULTIPLIER BAR ── */}
      {multiplier > 1 && (
        <div style={{
          background:'linear-gradient(135deg, rgba(255,123,0,0.1), rgba(245,197,24,0.07))',
          border:'1px solid rgba(255,123,0,0.35)',
          borderRadius:'var(--r-sm)', padding:'0.5rem 1rem',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          animation:'feedbackPop 0.3s ease',
          boxShadow:'0 0 24px rgba(255,123,0,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.55rem' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#ff7b00', boxShadow:'0 0 10px #ff7b00', animation:'pulse 1s ease-in-out infinite' }}/>
            <span style={{ fontFamily:'var(--font-hud)', fontSize:'0.62rem', fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'1.5px', textTransform:'uppercase' }}>Multiplier Active</span>
          </div>
          <span style={{ fontFamily:'var(--font-d)', fontSize:'1.6rem', letterSpacing:'2px', color:'#ff7b00', textShadow:'0 0 28px rgba(255,123,0,0.8)' }}>×{multiplier}</span>
        </div>
      )}

      {/* ── FEEDBACK BANNER ── */}
      <div style={{ position:'relative', height:76 }}>
        {feedback && (() => {
          const fc = feedbackColors[feedback.kind];
          return (
            <div key={feedback.key} style={{
              position:'absolute', inset:0, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', borderRadius:'var(--r-md)',
              background: fc.bg, border: `1.5px solid ${fc.border}`,
              boxShadow: `0 0 44px ${fc.glow}, inset 0 1px 0 rgba(255,255,255,0.07)`,
              animation: feedback.kind === 'combo'
                ? 'feedbackPop 0.3s cubic-bezier(0.34,1.56,0.64,1), comboShake 0.5s 0.3s ease'
                : 'feedbackPop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              overflow:'hidden',
            }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:`linear-gradient(90deg,transparent,${fc.border},transparent)` }}/>
              <div style={{
                display:'flex', alignItems:'center', gap:'0.5rem',
                fontFamily:'var(--font-d)',
                fontSize: feedback.kind === 'combo' ? '1.9rem' : '1.55rem',
                letterSpacing:'3px', color: fc.text,
                textShadow: `0 0 24px ${fc.text}cc`,
              }}>
                {feedback.kind === 'correct' && '✅'}
                {feedback.kind === 'wrong'   && '❌'}
                {feedback.kind === 'combo'   && '⚡'}
                {feedback.kind === 'info'    && '💬'}
                {feedback.headline}
              </div>
              <div style={{ fontFamily:'var(--font-hud)', fontSize:'0.72rem', color:'rgba(255,255,255,0.5)', fontWeight:600, letterSpacing:'0.5px', marginTop:'2px' }}>{feedback.sub}</div>
            </div>
          );
        })()}
      </div>

      {/* ── PUZZLE IMAGE ── */}
      <div style={{
        flex:1, minHeight:220, borderRadius:'var(--r-lg)', position:'relative', overflow:'hidden',
        background:'linear-gradient(150deg, rgba(12,20,40,0.96) 0%, rgba(5,8,20,0.99) 100%)',
        border: feedback?.kind === 'correct' ? '1.5px solid rgba(0,230,118,0.4)' :
                feedback?.kind === 'wrong'   ? '1.5px solid rgba(255,23,68,0.4)'  :
                '1.5px solid rgba(245,197,24,0.2)',
        boxShadow: feedback?.kind === 'correct' ? '0 0 50px rgba(0,230,118,0.12), 0 10px 70px rgba(0,0,0,0.8)' :
                   feedback?.kind === 'wrong'   ? '0 0 50px rgba(255,23,68,0.12), 0 10px 70px rgba(0,0,0,0.8)'  :
                   '0 10px 70px rgba(0,0,0,0.8)',
        transition:'border-color 0.35s, box-shadow 0.35s',
        display:'flex', alignItems:'center', justifyContent:'center', padding:'1.25rem',
      }}>
        {/* Top shimmer */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,rgba(245,197,24,0.5),rgba(0,240,255,0.3),transparent)', zIndex:1 }}/>
        {/* Corner brackets */}
        <div className="corner-tl"/><div className="corner-tr"/><div className="corner-bl"/><div className="corner-br"/>
        {/* Scanlines */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg,rgba(0,0,0,0.05) 0px,rgba(0,0,0,0.05) 1px,transparent 1px,transparent 4px)', pointerEvents:'none', zIndex:2 }}/>

        {loadingPuzzle ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.9rem', color:'rgba(255,255,255,0.28)', zIndex:3 }}>
            <div style={{ position:'relative', width:60, height:60 }}>
              <svg width="60" height="60" style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }}>
                <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(245,197,24,0.1)" strokeWidth="3"/>
                <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(245,197,24,0.5)" strokeWidth="3" strokeDasharray="163" strokeDashoffset="40" strokeLinecap="round" style={{ animation:'spin 1.2s linear infinite' }}/>
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', animation:'pulse 1s ease-in-out infinite' }}>🍌</div>
            </div>
            <span style={{ fontFamily:'var(--font-hud)', fontSize:'0.68rem', fontWeight:600, letterSpacing:'3px', textTransform:'uppercase' }}>Loading puzzle...</span>
          </div>
        ) : puzzleUrl ? (
          <img src={puzzleUrl} alt="Banana puzzle"
            style={{ maxWidth:'100%', maxHeight:'270px', borderRadius:'10px', display:'block', boxShadow:'0 8px 40px rgba(0,0,0,0.7)', transition:'opacity 0.3s', position:'relative', zIndex:3 }}
            onError={() => setPuzzleUrl('')}/>
        ) : (
          <div style={{ color:'rgba(255,255,255,0.18)', fontWeight:600, fontFamily:'var(--font-hud)', fontSize:'0.78rem', zIndex:3 }}>No puzzle loaded</div>
        )}
      </div>

      {/* ── ANSWER FORM ── */}
      <form onSubmit={handleSubmit} style={{ display:'flex', gap:'0.6rem' }}>
        <div style={{ flex:1, position:'relative' }}>
          <input
            ref={answerInputRef}
            className="input"
            type="number"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type the missing number..."
            disabled={loadingPuzzle || submitting}
            autoComplete="off"
            style={{ fontSize:'1.1rem', height:'58px', fontWeight:700, fontFamily:'var(--font-hud)', letterSpacing:'1px', paddingRight:'0.9rem' }}
          />
        </div>
        <button className="btn-primary" type="submit"
          disabled={loadingPuzzle || submitting || !answer.trim()}
          style={{ whiteSpace:'nowrap', height:'58px', padding:'0 2rem', fontSize:'0.95rem', letterSpacing:'0.5px', flexShrink:0, borderRadius:'var(--r-md)' }}>
          {submitting ? (
            <span style={{ display:'inline-flex', alignItems:'center', gap:'0.45rem' }}>
              <span style={{ width:14, height:14, border:'2.5px solid rgba(0,0,0,0.3)', borderTopColor:'#000', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }}/>
            </span>
          ) : 'Submit →'}
        </button>
      </form>

      <style>{`
        @keyframes feedbackPop{0%{opacity:0;transform:scale(0.5) translateY(20px)}60%{transform:scale(1.08) translateY(-3px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes comboShake{0%,100%{transform:translateX(0) rotate(0) scale(1)}20%{transform:translateX(-6px) rotate(-2deg) scale(1.04)}40%{transform:translateX(6px) rotate(2deg) scale(1.04)}60%{transform:translateX(-4px) rotate(-1deg)}80%{transform:translateX(4px) rotate(1deg)}}
        @keyframes timerPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.22)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes streakFire{0%,100%{filter:hue-rotate(0deg) brightness(1)}50%{filter:hue-rotate(22deg) brightness(1.4)}}
        @keyframes scoreFlash{0%{transform:scale(1)}40%{transform:scale(1.3);color:#ffd84d;text-shadow:0 0 30px rgba(245,197,24,1)}100%{transform:scale(1)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.88)}}
      `}</style>
    </main>
  );
}
