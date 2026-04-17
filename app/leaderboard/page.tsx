'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Leader { _id: string; username: string; highScore: number; bestStreak: number; totalGames: number; }

const TOP3 = {
  1: { bg:'linear-gradient(145deg, rgba(70,50,0,0.94) 0%, rgba(28,20,0,0.98) 100%)',  border:'rgba(245,197,24,0.65)',  icon:'🥇', glow:'rgba(245,197,24,0.4)', nc:'#ffd84d', sc:'#f5c518', rank:'1ST', accentBg:'rgba(245,197,24,0.12)' },
  2: { bg:'linear-gradient(145deg, rgba(28,38,60,0.94) 0%, rgba(12,18,38,0.98) 100%)', border:'rgba(160,180,210,0.5)', icon:'🥈', glow:'rgba(160,180,210,0.22)', nc:'#c8d8ec', sc:'#adb5bd', rank:'2ND', accentBg:'rgba(160,180,210,0.08)' },
  3: { bg:'linear-gradient(145deg, rgba(46,24,0,0.94) 0%, rgba(20,10,0,0.98) 100%)',   border:'rgba(205,127,50,0.5)',  icon:'🥉', glow:'rgba(205,127,50,0.22)', nc:'#e8a060', sc:'#cd7f32', rank:'3RD', accentBg:'rgba(205,127,50,0.08)' },
} as Record<number, { bg:string; border:string; icon:string; glow:string; nc:string; sc:string; rank:string; accentBg:string }>;

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animatedIn, setAnimatedIn] = useState(false);

  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json())
      .then(d => { setLeaders(d.leaders ?? []); setLoading(false); setTimeout(() => setAnimatedIn(true), 60); })
      .catch(() => { setError('Failed to load leaderboard.'); setLoading(false); });
  }, []);

  return (
    <>
      {/* Ambient background */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', top:'5%', left:'10%', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,197,24,0.07) 0%, transparent 70%)', animation:'orbDrift 12s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', bottom:'10%', right:'8%', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,240,255,0.05) 0%, transparent 70%)', animation:'orbDrift 9s ease-in-out infinite reverse' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg,rgba(0,0,0,0.035) 0px,rgba(0,0,0,0.035) 1px,transparent 1px,transparent 4px)', zIndex:0 }}/>
      </div>

      <main style={{ minHeight:'100vh', padding:'2.5rem 1.25rem 5rem', maxWidth:820, margin:'0 auto', position:'relative', zIndex:1 }}>

        {/* ── Header ── */}
        <div style={{ textAlign:'center', marginBottom:'2.5rem', animation:'fadeUp 0.45s ease both' }}>
          <div style={{ position:'relative', display:'inline-block', marginBottom:'1rem' }}>
            <div style={{ position:'absolute', inset:'-24px', borderRadius:'50%', background:'radial-gradient(circle, rgba(245,197,24,0.18) 0%, transparent 70%)', animation:'glowPulseOrb 2.8s ease-in-out infinite' }} />
            <div style={{ fontSize:'4rem', filter:'drop-shadow(0 0 32px rgba(245,197,24,0.7))', animation:'floatGentle 3s ease-in-out infinite', position:'relative', zIndex:1 }}>🏆</div>
          </div>
          <h1 style={{
            fontFamily:'var(--font-d)', fontSize:'clamp(2.6rem,7vw,4.2rem)', letterSpacing:'7px',
            background:'linear-gradient(135deg,#fff8d0 0%,#ffd84d 40%,#f5c518 70%,#c88a00 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            marginBottom:'0.4rem', lineHeight:1, filter:'drop-shadow(0 0 20px rgba(245,197,24,0.3))',
          }}>LEADERBOARD</h1>
          <p style={{ fontFamily:'var(--font-hud)', color:'rgba(255,255,255,0.25)', fontSize:'0.68rem', fontWeight:600, letterSpacing:'4px', textTransform:'uppercase' }}>
            ◆ Top Banana Solvers · Global Rankings ◆
          </p>
        </div>

        {/* ── Nav row ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem', flexWrap:'wrap', gap:'0.75rem' }}>
          <Link href="/" style={{ color:'rgba(255,255,255,0.3)', textDecoration:'none', fontSize:'0.86rem', fontWeight:700, display:'flex', alignItems:'center', gap:'0.35rem', transition:'color 0.2s' }}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.65)'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.3)'}
          >← Home</Link>
          <Link href="/game" style={{ textDecoration:'none' }}>
            <button className="btn-primary" style={{ padding:'0.62rem 1.7rem', fontSize:'0.9rem' }}>🎮 Play Now</button>
          </Link>
        </div>

        {loading && (
          <div style={{ textAlign:'center', padding:'5rem 1rem' }}>
            <div style={{ position:'relative', width:64, height:64, margin:'0 auto 1rem' }}>
              <svg width="64" height="64" style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }}>
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(245,197,24,0.1)" strokeWidth="3"/>
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(245,197,24,0.55)" strokeWidth="3" strokeDasharray="176" strokeDashoffset="44" strokeLinecap="round" style={{ animation:'spin 1.2s linear infinite' }}/>
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.75rem', animation:'pulse 1s ease-in-out infinite' }}>🍌</div>
            </div>
            <div style={{ fontFamily:'var(--font-hud)', fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', fontSize:'0.72rem', color:'rgba(255,255,255,0.25)' }}>Loading rankings...</div>
          </div>
        )}
        {error && <div className="card" style={{ textAlign:'center', color:'#ff6b6b', fontWeight:700 }}>{error}</div>}
        {!loading && !error && leaders.length === 0 && (
          <div className="card" style={{ textAlign:'center', padding:'3rem', position:'relative' }}>
            <div className="corner-tl"/><div className="corner-tr"/><div className="corner-bl"/><div className="corner-br"/>
            <div style={{ fontSize:'3.2rem', marginBottom:'1rem' }}>😶</div>
            <p style={{ color:'rgba(255,255,255,0.4)', marginBottom:'1.5rem', fontWeight:600 }}>No scores yet. Be the first to play!</p>
            <Link href="/game"><button className="btn-primary">🎮 Play Now</button></Link>
          </div>
        )}

        {!loading && leaders.length > 0 && (<>

          {/* ── Top 3 podium ── */}
          {leaders.length >= 3 && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1.12fr 1fr', gap:'0.85rem', marginBottom:'1.5rem', alignItems:'end' }}>
              {[leaders[1], leaders[0], leaders[2]].map((l, i) => {
                const rankIdx = i === 0 ? 2 : i === 1 ? 1 : 3;
                const s = TOP3[rankIdx];
                const isFirst = rankIdx === 1;
                return (
                  <div key={l._id} style={{
                    background: s.bg, border: `1.5px solid ${s.border}`,
                    borderRadius: 'var(--r-lg)',
                    padding: isFirst ? '1.7rem 1rem 1.4rem' : '1.2rem 0.9rem 1.1rem',
                    textAlign:'center',
                    boxShadow: `0 0 40px ${s.glow}, 0 10px 50px rgba(0,0,0,0.7)`,
                    opacity: animatedIn ? 1 : 0,
                    transform: animatedIn ? 'translateY(0)' : `translateY(22px)`,
                    transition: `opacity 0.55s ease ${i * 0.12}s, transform 0.55s ease ${i * 0.12}s`,
                    position:'relative', overflow:'hidden',
                  }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:'1.5px', background:`linear-gradient(90deg, transparent, ${s.border}, transparent)` }}/>
                    <div style={{ fontFamily:'var(--font-hud)', fontSize:'0.52rem', fontWeight:700, color:`${s.sc}88`, letterSpacing:'3.5px', marginBottom:'0.4rem' }}>{s.rank}</div>
                    <div style={{ fontSize: isFirst ? '2.8rem' : '2.1rem', marginBottom:'0.35rem', filter:`drop-shadow(0 0 20px ${s.glow})` }}>{s.icon}</div>
                    <div style={{ fontWeight:900, fontSize: isFirst ? '1.05rem' : '0.9rem', color:s.nc, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'0.4rem', padding:'0 0.25rem' }}>{l.username}</div>
                    <div style={{ fontFamily:'var(--font-hud)', fontSize: isFirst ? '1.85rem' : '1.45rem', color:s.sc, letterSpacing:'2px', textShadow:`0 0 24px ${s.sc}77`, fontVariantNumeric:'tabular-nums' }}>{l.highScore.toLocaleString()}</div>
                    <div style={{ fontFamily:'var(--font-hud)', fontSize:'0.55rem', color:'rgba(255,255,255,0.25)', fontWeight:600, marginTop:'0.28rem', letterSpacing:'1px' }}>{l.totalGames} games</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Full table ── */}
          <div className="card" style={{ padding:'0', overflow:'hidden', marginBottom:'2rem' }}>
            <div className="corner-tl"/><div className="corner-tr"/>
            {/* Header */}
            <div style={{
              display:'grid', gridTemplateColumns:'56px 1fr 130px 90px 72px',
              gap:'0.5rem', padding:'0.85rem 1.4rem',
              background:'rgba(255,255,255,0.02)',
              borderBottom:'1px solid rgba(245,197,24,0.1)',
            }}>
              {['#','Player','High Score','Streak','Games'].map((h, idx) => (
                <span key={h} style={{
                  fontFamily:'var(--font-hud)', fontSize:'0.53rem', fontWeight:700, color:'rgba(255,255,255,0.22)',
                  letterSpacing:'2.5px', textTransform:'uppercase',
                  textAlign: idx === 0 ? 'center' : idx > 1 ? 'right' : 'left',
                }}>{h}</span>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column' }}>
              {leaders.map((l, i) => {
                const rank = i + 1;
                const s = TOP3[rank];
                return (
                  <div key={l._id} className="lb-row" style={{
                    gridTemplateColumns:'56px 1fr 130px 90px 72px',
                    background: s ? s.bg : i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                    borderBottom:'1px solid rgba(255,255,255,0.04)',
                    boxShadow: s ? `inset 3px 0 0 ${s.border}` : 'none',
                    opacity: animatedIn ? 1 : 0,
                    transform: animatedIn ? 'translateX(0)' : 'translateX(-26px)',
                    transition: `opacity 0.42s ease ${i * 0.05}s, transform 0.42s ease ${i * 0.05}s`,
                  }}>
                    <div style={{ textAlign:'center', fontSize: s ? '1.5rem' : '0.7rem', fontFamily: s ? 'inherit' : 'var(--font-hud)', fontWeight:900, color: s ? 'inherit' : 'rgba(255,255,255,0.18)', lineHeight:1 }}>
                      {s ? s.icon : `#${rank}`}
                    </div>
                    <div style={{ fontWeight:800, fontSize: rank <= 3 ? '0.96rem' : '0.88rem', color: s ? s.nc : 'rgba(255,255,255,0.68)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.username}</div>
                    <div style={{ textAlign:'right', fontWeight:900, fontFamily:'var(--font-hud)', fontSize: rank <= 3 ? '1rem' : '0.9rem', color: rank === 1 ? '#ffd84d' : rank <= 3 ? '#f5c518' : 'rgba(255,255,255,0.55)', fontVariantNumeric:'tabular-nums', textShadow: rank <= 3 ? `0 0 14px ${rank === 1 ? '#ffd84d' : '#f5c518'}55` : 'none' }}>{l.highScore.toLocaleString()}</div>
                    <div style={{ textAlign:'right', fontFamily:'var(--font-hud)', color: l.bestStreak >= 5 ? '#ff7b00' : 'rgba(255,255,255,0.32)', fontWeight:700, fontSize:'0.84rem' }}>
                      {l.bestStreak >= 1 ? `${l.bestStreak} 🔥` : l.bestStreak}
                    </div>
                    <div style={{ textAlign:'right', fontFamily:'var(--font-hud)', color:'rgba(255,255,255,0.22)', fontSize:'0.78rem', fontWeight:600 }}>{l.totalGames}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ textAlign:'center' }}>
            <Link href="/game">
              <button className="btn-primary" style={{ padding:'0.95rem 3.2rem', fontSize:'1.05rem' }}>
                🎮 Play &amp; Climb the Ranks
              </button>
            </Link>
          </div>
        </>)}

        <style>{`
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
          @keyframes floatGentle{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
          @keyframes glowPulseOrb{0%,100%{opacity:0.6}50%{opacity:1}}
          @keyframes orbDrift{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-15px)}}
          @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.88)}}
        `}</style>
      </main>
    </>
  );
}
