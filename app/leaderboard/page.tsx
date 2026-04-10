'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Leader {
  _id: string;
  username: string;
  highScore: number;
  bestStreak: number;
  totalGames: number;
}

const RANK_STYLES: Record<number, { bg: string; border: string; icon: string; glow: string; nameColor: string }> = {
  1: { bg: 'linear-gradient(135deg, rgba(61,46,0,0.9) 0%, rgba(30,22,0,0.95) 100%)', border: 'rgba(245,197,24,0.6)', icon: '🥇', glow: '0 0 24px rgba(245,197,24,0.45)', nameColor: '#f5c518' },
  2: { bg: 'linear-gradient(135deg, rgba(30,37,53,0.9) 0%, rgba(16,20,36,0.95) 100%)', border: 'rgba(168,184,200,0.45)', icon: '🥈', glow: '0 0 18px rgba(168,184,200,0.28)', nameColor: '#c8d8e8' },
  3: { bg: 'linear-gradient(135deg, rgba(42,21,0,0.9) 0%, rgba(24,12,0,0.95) 100%)', border: 'rgba(205,127,50,0.45)', icon: '🥉', glow: '0 0 18px rgba(205,127,50,0.28)', nameColor: '#e8a060' },
};

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animatedIn, setAnimatedIn] = useState(false);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(d => {
        setLeaders(d.leaders ?? []);
        setLoading(false);
        setTimeout(() => setAnimatedIn(true), 50);
      })
      .catch(() => {
        setError('Failed to load leaderboard.');
        setLoading(false);
      });
  }, []);

  return (
    <main style={{ minHeight: '100vh', padding: '2.5rem 1.25rem 4rem', maxWidth: 720, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', animation: 'fadeUp 0.45s ease both' }}>
        <div style={{ fontSize: '3.8rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 0 20px rgba(245,197,24,0.5))' }}>🏆</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.2rem, 6vw, 3.2rem)',
          letterSpacing: '4px',
          background: 'linear-gradient(135deg, #ffd84d 0%, #f5c518 50%, #e8a800 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.4rem',
          lineHeight: 1,
        }}>
          LEADERBOARD
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>
          Top Banana Solvers
        </p>
      </div>

      {/* Back link */}
      <div style={{ marginBottom: '1.75rem' }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 700,
          transition: 'color 0.15s',
        }}>← Back to Home</Link>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'rgba(255,255,255,0.35)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', display: 'inline-block', animation: 'spin 1s linear infinite' }}>🍌</div>
          <div style={{ fontWeight: 700, letterSpacing: '0.5px' }}>Loading rankings...</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card" style={{ textAlign: 'center', color: '#ff6b6b', fontWeight: 700 }}>{error}</div>
      )}

      {/* Empty */}
      {!loading && !error && leaders.length === 0 && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>😶</div>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '1.25rem', fontWeight: 600 }}>No scores yet. Be the first to play!</p>
          <Link href="/game"><button className="btn-primary">🎮 Play Now</button></Link>
        </div>
      )}

      {/* Table */}
      {!loading && leaders.length > 0 && (
        <>
          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '52px 1fr 110px 82px 65px',
            gap: '0.5rem',
            padding: '0 1.1rem 0.6rem',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.65rem',
            fontWeight: 800,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}>
            <span style={{ textAlign: 'center' }}>#</span>
            <span>Player</span>
            <span style={{ textAlign: 'right' }}>High Score</span>
            <span style={{ textAlign: 'right' }}>Streak</span>
            <span style={{ textAlign: 'right' }}>Games</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {leaders.map((l, i) => {
              const rank = i + 1;
              const special = RANK_STYLES[rank];
              return (
                <div
                  key={l._id}
                  className="lb-row"
                  style={{
                    gridTemplateColumns: '52px 1fr 110px 82px 65px',
                    background: special ? special.bg : 'linear-gradient(135deg, rgba(19,29,46,0.85) 0%, rgba(13,18,30,0.9) 100%)',
                    border: `1px solid ${special ? special.border : 'rgba(245,197,24,0.1)'}`,
                    boxShadow: special ? special.glow : '0 2px 10px rgba(0,0,0,0.3)',
                    opacity: animatedIn ? 1 : 0,
                    transform: animatedIn ? 'translateX(0)' : 'translateX(-22px)',
                    transition: `opacity 0.4s ease ${i * 0.07}s, transform 0.4s ease ${i * 0.07}s`,
                  }}
                >
                  {/* Rank */}
                  <div style={{ textAlign: 'center', fontSize: special ? '1.6rem' : '0.82rem', fontWeight: 900, color: special ? 'inherit' : 'rgba(255,255,255,0.3)', lineHeight: 1 }}>
                    {special ? special.icon : `#${rank}`}
                  </div>

                  {/* Username */}
                  <div style={{
                    fontWeight: 800,
                    fontSize: rank <= 3 ? '1rem' : '0.92rem',
                    color: special ? special.nameColor : 'rgba(255,255,255,0.75)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {l.username}
                  </div>

                  {/* Score */}
                  <div style={{
                    textAlign: 'right',
                    fontWeight: 900,
                    fontSize: rank <= 3 ? '1.05rem' : '0.96rem',
                    color: rank === 1 ? '#f5c518' : rank <= 3 ? '#ffd566' : 'rgba(255,255,255,0.6)',
                    fontVariantNumeric: 'tabular-nums',
                    fontFamily: 'var(--font-body)',
                  }}>
                    {l.highScore.toLocaleString()}
                  </div>

                  {/* Streak */}
                  <div style={{
                    textAlign: 'right',
                    color: l.bestStreak >= 5 ? '#ff9f43' : 'rgba(255,255,255,0.4)',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                  }}>
                    {l.bestStreak >= 1 ? `${l.bestStreak} 🔥` : l.bestStreak}
                  </div>

                  {/* Games */}
                  <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', fontWeight: 700 }}>
                    {l.totalGames}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/game">
              <button className="btn-primary" style={{ padding: '0.82rem 2.8rem', fontSize: '1rem' }}>
                🎮 Play &amp; Climb
              </button>
            </Link>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}
