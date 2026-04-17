import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import GameSession from '@/models/GameSession';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('pof_token')?.value;
  if (!token) redirect('/login');
  const jwtUser = verifyToken(token);
  if (!jwtUser) redirect('/login');

  await connectDB();
  const user = await User.findById(jwtUser.userId).select('-passwordHash').lean();
  if (!user) redirect('/login');

  const recentSessions = await GameSession.find({ userId: jwtUser.userId }).sort({ playedAt: -1 }).limit(8).lean();

  const u = user as { username:string; email:string; highScore:number; bestStreak:number; totalGames:number; createdAt:Date };

  const rank = u.highScore >= 500 ? 'Diamond' : u.highScore >= 300 ? 'Gold' : u.highScore >= 150 ? 'Silver' : 'Bronze';
  const rankConfig = {
    Diamond: { color:'#74c0fc', bg:'rgba(116,192,252,0.1)',  border:'rgba(116,192,252,0.32)', icon:'💎', next:'Max rank!',    progress:100  },
    Gold:    { color:'#f5c518', bg:'rgba(245,197,24,0.1)',   border:'rgba(245,197,24,0.32)',  icon:'🥇', next:'500 for 💎',  progress:Math.min(((u.highScore-300)/200)*100, 100) },
    Silver:  { color:'#adb5bd', bg:'rgba(173,181,189,0.1)',  border:'rgba(173,181,189,0.28)', icon:'🥈', next:'300 for 🥇',  progress:Math.min(((u.highScore-150)/150)*100, 100) },
    Bronze:  { color:'#cd7f32', bg:'rgba(205,127,50,0.1)',   border:'rgba(205,127,50,0.28)',  icon:'🥉', next:'150 for 🥈',  progress:Math.min((u.highScore/150)*100, 100) },
  }[rank];

  const memberSince = new Date(u.createdAt).toLocaleDateString('en-US', { month:'short', year:'numeric' });

  return (
    <>
      <Navbar username={u.username} />

      {/* Ambient background */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', top:'8%', right:'5%', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,197,24,0.07) 0%, transparent 70%)', animation:'orbDrift 12s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', bottom:'12%', left:'5%', width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,240,255,0.05) 0%, transparent 70%)', animation:'orbDrift 9s ease-in-out infinite reverse' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg,rgba(0,0,0,0.032) 0px,rgba(0,0,0,0.032) 1px,transparent 1px,transparent 4px)' }}/>
      </div>

      <main style={{ maxWidth:720, margin:'0 auto', padding:'2.5rem 1.25rem 5rem', position:'relative', zIndex:1 }}>

        {/* ── Identity Hero Card ── */}
        <div className="card" style={{
          marginBottom:'1.1rem', animation:'fadeUp 0.4s ease both',
          background:'linear-gradient(150deg, rgba(14,22,42,0.95) 0%, rgba(6,10,22,0.99) 100%)',
          position:'relative',
        }}>
          <div className="corner-tl"/><div className="corner-tr"/><div className="corner-bl"/><div className="corner-br"/>

          {/* Avatar row */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:'1.5rem', marginBottom:'1.75rem' }}>
            {/* Avatar */}
            <div style={{
              width:88, height:88, borderRadius:'20px', flexShrink:0,
              background:'linear-gradient(135deg, rgba(245,197,24,0.22), rgba(245,197,24,0.06))',
              border:'2px solid rgba(245,197,24,0.45)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'2.8rem',
              boxShadow:'0 0 40px rgba(245,197,24,0.25), 0 4px 28px rgba(0,0,0,0.5)',
              animation:'glowPulse 3.5s ease-in-out infinite',
              position:'relative', overflow:'hidden',
            }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg, transparent, rgba(245,197,24,0.55), transparent)' }}/>
              🍌
            </div>

            <div style={{ flex:1, minWidth:0 }}>
              {/* Username */}
              <h2 style={{
                fontFamily:'var(--font-d)', fontSize:'2.1rem', letterSpacing:'2.5px',
                color:'var(--y)', marginBottom:'0.5rem',
                textShadow:'0 0 36px rgba(245,197,24,0.35)',
                background:'linear-gradient(135deg,#fff8d0,#ffd84d,#f5c518)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              }}>{u.username}</h2>

              {/* Rank badge + member since */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.55rem', flexWrap:'wrap' }}>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:'0.4rem',
                  padding:'0.3rem 0.95rem', borderRadius:'8px',
                  background: rankConfig.bg, border:`1.5px solid ${rankConfig.border}`,
                  color: rankConfig.color,
                  fontFamily:'var(--font-hud)', fontSize:'0.65rem', fontWeight:700, letterSpacing:'2px',
                  boxShadow:`0 0 16px ${rankConfig.border}`,
                }}>
                  <span style={{ fontSize:'0.9rem' }}>{rankConfig.icon}</span>
                  {rank.toUpperCase()} RANK
                </span>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:'0.35rem',
                  fontFamily:'var(--font-hud)', fontSize:'0.6rem',
                  color:'rgba(255,255,255,0.22)', fontWeight:600, letterSpacing:'0.5px',
                }}>
                  <span>📅</span> Member since {memberSince}
                </span>
              </div>

              <div style={{
                fontFamily:'var(--font-hud)', fontSize:'0.7rem',
                color:'rgba(255,255,255,0.25)', fontWeight:600,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                letterSpacing:'0.3px',
              }}>
                {u.email}
              </div>
            </div>
          </div>

          {/* Rank progress bar */}
          {rank !== 'Diamond' && (
            <div style={{ marginBottom:'1.75rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.55rem' }}>
                <span style={{
                  fontFamily:'var(--font-hud)', fontSize:'0.58rem', fontWeight:700,
                  color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'2px',
                  display:'inline-flex', alignItems:'center', gap:'0.35rem',
                }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:rankConfig.color, boxShadow:`0 0 8px ${rankConfig.color}`, display:'inline-block' }}/>
                  Rank Progress
                </span>
                <span style={{
                  fontFamily:'var(--font-hud)', fontSize:'0.65rem', fontWeight:800,
                  color: rankConfig.color, letterSpacing:'0.5px',
                }}>{rankConfig.next}</span>
              </div>
              {/* Track */}
              <div style={{
                height:8, background:'rgba(255,255,255,0.05)',
                borderRadius:'999px', overflow:'hidden',
                boxShadow:'inset 0 2px 4px rgba(0,0,0,0.5)',
                border:'1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{
                  height:'100%', width:`${rankConfig.progress}%`,
                  background:`linear-gradient(90deg, ${rankConfig.color}55, ${rankConfig.color})`,
                  borderRadius:'999px',
                  boxShadow:`0 0 16px ${rankConfig.color}66`,
                  transition:'width 1.2s cubic-bezier(0.25,0.46,0.45,0.94)',
                  position:'relative',
                }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:'45%', background:'rgba(255,255,255,0.2)', borderRadius:'999px' }}/>
                </div>
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.75rem' }}>
            {[
              { label:'High Score',  value: u.highScore.toLocaleString(), icon:'⭐', color:'#f5c518' },
              { label:'Best Streak', value: u.bestStreak,                  icon:'🔥', color:'#ff7b00' },
              { label:'Total Games', value: u.totalGames,                  icon:'🎮', color:'#00f0ff' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="stat-chip" style={{ border:`1px solid ${color}18` }}>
                <span className="stat-chip-icon">{icon}</span>
                <span className="stat-chip-value" style={{ color, textShadow:`0 0 18px ${color}44` }}>{value}</span>
                <span className="stat-chip-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Games ── */}
        <div className="card" style={{
          marginBottom:'1.1rem', animation:'fadeUp 0.4s 0.1s ease both',
          padding:0, overflow:'hidden', position:'relative',
        }}>
          <div className="corner-tl"/><div className="corner-tr"/>

          {/* Section header */}
          <div style={{
            padding:'1.25rem 1.75rem 1rem',
            borderBottom:'1px solid rgba(255,255,255,0.05)',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            background:'rgba(255,255,255,0.01)',
          }}>
            <h3 style={{
              fontFamily:'var(--font-d)', fontSize:'1.3rem', letterSpacing:'2.5px', color:'var(--y)',
              display:'flex', alignItems:'center', gap:'0.55rem',
              textShadow:'0 0 20px rgba(245,197,24,0.25)',
            }}>
              <span>📋</span> RECENT GAMES
            </h3>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#00e676', boxShadow:'0 0 8px #00e676', animation:'pulse 1.5s ease-in-out infinite' }}/>
              <span style={{
                fontFamily:'var(--font-hud)', fontSize:'0.58rem',
                color:'rgba(255,255,255,0.2)', fontWeight:600, letterSpacing:'1px',
              }}>LAST {Math.min(recentSessions.length, 8)} SESSIONS</span>
            </div>
          </div>

          {recentSessions.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem', color:'rgba(255,255,255,0.28)', fontWeight:600 }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'1rem', opacity:0.4 }}>🎮</div>
              No games yet.
              <br/>
              <Link href="/game"><button className="btn-primary" style={{ marginTop:'1.25rem', padding:'0.75rem 2rem' }}>🎮 Play First Game</button></Link>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div style={{
                display:'grid', gridTemplateColumns:'1fr 72px 72px 72px 104px',
                gap:'0.5rem', padding:'0.6rem 1.75rem',
                background:'rgba(255,255,255,0.018)',
                borderBottom:'1px solid rgba(255,255,255,0.04)',
              }}>
                {['Score','Solved','Streak','Time','Date'].map((h, i) => (
                  <span key={h} style={{
                    fontFamily:'var(--font-hud)',
                    fontSize:'0.53rem', fontWeight:700, color:'rgba(255,255,255,0.2)',
                    letterSpacing:'2px', textTransform:'uppercase',
                    textAlign: i === 0 ? 'left' : 'center',
                  }}>{h}</span>
                ))}
              </div>

              <div>
                {recentSessions.map((s, idx) => {
                  const sess = s as { _id:unknown; score:number; puzzlesSolved:number; longestStreak:number; duration:number; playedAt:Date };
                  const isPersonalBest = sess.score === u.highScore && sess.score > 0;
                  return (
                    <div key={String(sess._id)} className="session-row" style={{
                      display:'grid', gridTemplateColumns:'1fr 72px 72px 72px 104px',
                      gap:'0.5rem', padding:'0.9rem 1.75rem',
                      borderBottom:'1px solid rgba(255,255,255,0.035)',
                      transition:'background 0.15s, transform 0.15s',
                      background: isPersonalBest ? 'rgba(245,197,24,0.035)' : 'transparent',
                      borderLeft: isPersonalBest ? '2px solid rgba(245,197,24,0.45)' : '2px solid transparent',
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <span style={{
                          fontFamily:'var(--font-hud)', fontWeight:800, fontSize:'1rem',
                          color: isPersonalBest ? '#ffd84d' : 'var(--y)',
                          fontVariantNumeric:'tabular-nums',
                          textShadow: isPersonalBest ? '0 0 20px rgba(245,197,24,0.65)' : 'none',
                        }}>
                          {sess.score.toLocaleString()}
                        </span>
                        {isPersonalBest && (
                          <span style={{
                            fontFamily:'var(--font-hud)',
                            fontSize:'0.52rem', fontWeight:800,
                            color:'#f5c518', background:'rgba(245,197,24,0.14)',
                            padding:'0.14rem 0.55rem', borderRadius:'5px',
                            border:'1px solid rgba(245,197,24,0.32)',
                            letterSpacing:'1.5px', animation:'pulse 2s ease-in-out infinite',
                          }}>PB</span>
                        )}
                      </div>
                      <div style={{ textAlign:'center', color:'rgba(255,255,255,0.5)', fontFamily:'var(--font-hud)', fontWeight:700, fontSize:'0.85rem' }}>{sess.puzzlesSolved}</div>
                      <div style={{ textAlign:'center', fontFamily:'var(--font-hud)', color: sess.longestStreak >= 5 ? '#ff7b00' : 'rgba(255,255,255,0.5)', fontWeight:700, fontSize:'0.85rem' }}>
                        {sess.longestStreak >= 1 ? `${sess.longestStreak}🔥` : sess.longestStreak}
                      </div>
                      <div style={{ textAlign:'center', color:'rgba(255,255,255,0.35)', fontFamily:'var(--font-hud)', fontWeight:600, fontSize:'0.82rem' }}>{sess.duration}s</div>
                      <div style={{ textAlign:'center', color:'rgba(255,255,255,0.2)', fontFamily:'var(--font-hud)', fontSize:'0.7rem', fontWeight:600 }}>
                        {new Date(sess.playedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ── CTA ── */}
        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', animation:'fadeUp 0.4s 0.2s ease both' }}>
          <Link href="/game"><button className="btn-primary" style={{ padding:'0.9rem 2.5rem' }}>🎮 Play Now</button></Link>
          <Link href="/leaderboard"><button className="btn-ghost" style={{ padding:'0.85rem 1.7rem' }}>🏆 Leaderboard</button></Link>
        </div>
      </main>

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 28px rgba(245,197,24,0.22),0 4px 28px rgba(0,0,0,0.45)}50%{box-shadow:0 0 55px rgba(245,197,24,0.5),0 4px 28px rgba(0,0,0,0.45)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.85)}}
        @keyframes orbDrift{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-15px)}}
        .session-row:hover { background: rgba(255,255,255,0.025) !important; transform: translateX(3px); }
      `}</style>
    </>
  );
}
