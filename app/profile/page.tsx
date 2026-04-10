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

  const recentSessions = await GameSession.find({ userId: jwtUser.userId })
    .sort({ playedAt: -1 })
    .limit(5)
    .lean();

  // Compute rank based on high score
  const rank =
    (user as { highScore: number }).highScore >= 500
      ? 'Diamond'
      : (user as { highScore: number }).highScore >= 300
      ? 'Gold'
      : (user as { highScore: number }).highScore >= 150
      ? 'Silver'
      : 'Bronze';

  const rankColors: Record<string, string> = {
    Diamond: '#74c0fc',
    Gold: '#f5c518',
    Silver: '#adb5bd',
    Bronze: '#cd7f32',
  };

  const rankBg: Record<string, string> = {
    Diamond: 'rgba(116,192,252,0.12)',
    Gold: 'rgba(245,197,24,0.12)',
    Silver: 'rgba(173,181,189,0.1)',
    Bronze: 'rgba(205,127,50,0.12)',
  };

  const rankIcons: Record<string, string> = {
    Diamond: '💎',
    Gold: '🥇',
    Silver: '🥈',
    Bronze: '🥉',
  };

  const u = user as {
    username: string;
    email: string;
    highScore: number;
    bestStreak: number;
    totalGames: number;
    createdAt: Date;
  };

  return (
    <>
      <Navbar username={u.username} />
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '2.5rem 1.25rem 4rem' }}>

        {/* Identity card */}
        <div className="card" style={{ marginBottom: '1.25rem', animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(245,197,24,0.12)',
              border: '2.5px solid rgba(245,197,24,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem', flexShrink: 0,
              boxShadow: '0 0 20px rgba(245,197,24,0.2)',
            }}>🍌</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.7rem',
                letterSpacing: '2px',
                color: 'var(--banana-yellow)',
                marginBottom: '0.3rem',
                textShadow: '0 0 20px rgba(245,197,24,0.3)',
              }}>{u.username}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.22rem 0.65rem', borderRadius: '999px',
                  background: rankBg[rank],
                  border: `1px solid ${rankColors[rank]}44`,
                  color: rankColors[rank],
                  fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px',
                }}>
                  {rankIcons[rank]} {rank} Rank
                </span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {u.email}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[
              { label: 'High Score', value: u.highScore.toLocaleString(), icon: '⭐' },
              { label: 'Best Streak', value: u.bestStreak, icon: '🔥' },
              { label: 'Total Games', value: u.totalGames, icon: '🎮' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="stat-chip">
                <span className="stat-chip-icon">{icon}</span>
                <span className="stat-chip-value">{value}</span>
                <span className="stat-chip-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Games */}
        <div className="card" style={{ marginBottom: '1.5rem', animation: 'fadeUp 0.4s 0.1s ease both' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            letterSpacing: '2px',
            color: 'var(--banana-yellow)',
            marginBottom: '1.25rem',
          }}>📋 RECENT GAMES</h3>

          {recentSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
              No games yet. Play your first game!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    {['Score', 'Solved', 'Streak', 'Duration', 'Date'].map(h => (
                      <th key={h} style={{
                        padding: '0.4rem 0.5rem',
                        textAlign: h === 'Score' ? 'left' : 'center',
                        color: 'rgba(255,255,255,0.32)',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((s) => {
                    const sess = s as {
                      _id: unknown;
                      score: number;
                      puzzlesSolved: number;
                      longestStreak: number;
                      duration: number;
                      playedAt: Date;
                    };
                    return (
                      <tr key={String(sess._id)} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}>
                        <td style={{ padding: '0.65rem 0.5rem', color: 'var(--banana-yellow)', fontWeight: 900, fontSize: '1rem' }}>
                          {sess.score.toLocaleString()}
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{sess.puzzlesSolved}</td>
                        <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center', color: sess.longestStreak >= 5 ? '#ff9f43' : 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
                          {sess.longestStreak >= 1 ? `${sess.longestStreak}🔥` : sess.longestStreak}
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{sess.duration}s</td>
                        <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', fontWeight: 600 }}>
                          {new Date(sess.playedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', animation: 'fadeUp 0.4s 0.2s ease both' }}>
          <Link href="/game">
            <button className="btn-primary" style={{ padding: '0.8rem 2.2rem' }}>🎮 Play Now</button>
          </Link>
          <Link href="/leaderboard">
            <button className="btn-ghost" style={{ padding: '0.75rem 1.5rem' }}>🏆 Leaderboard</button>
          </Link>
        </div>
      </main>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}
