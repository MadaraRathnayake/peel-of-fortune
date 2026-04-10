import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('pof_token')?.value;
  const user = token ? verifyToken(token) : null;

  return (
    <>
      <Navbar username={user?.username} />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '3.5rem 1.25rem 4rem' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{
            fontSize: '5.5rem',
            lineHeight: 1,
            marginBottom: '1rem',
            display: 'inline-block',
            animation: 'float 3s ease-in-out infinite',
            filter: 'drop-shadow(0 0 24px rgba(245,197,24,0.5))',
          }}>🍌</div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 8vw, 4.5rem)',
            letterSpacing: '4px',
            lineHeight: 1,
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #ffd84d 0%, #f5c518 40%, #e8a800 80%, #ffd84d 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 3s linear infinite',
          }}>
            PEEL OF FORTUNE
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '1.05rem',
            fontWeight: 600,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>
            Solve banana puzzles · Beat the clock · Climb the board
          </p>
        </div>

        {/* How to Play card */}
        <div className="card" style={{ marginBottom: '2rem', animation: 'fadeUp 0.5s 0.1s ease both' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            letterSpacing: '2px',
            color: 'var(--banana-yellow)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span>📖</span> HOW TO PLAY
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {[
              { icon: '⏱', text: 'Start with', bold: '30 seconds' },
              { icon: '✅', text: 'Correct answer:', bold: '+10 pts & +5s' },
              { icon: '❌', text: 'Wrong answer:', bold: '−5 seconds' },
              { icon: '⚡', text: 'Answer in under 3s:', bold: '+20 bonus pts' },
              { icon: '🔥', text: 'Streak 3 / 5 / 10:', bold: '×1.5 / ×2 / ×3' },
            ].map(({ icon, text, bold }) => (
              <div key={bold} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.92rem' }}>
                  {text} <strong style={{ color: '#e8eaf0', fontWeight: 800 }}>{bold}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.5s 0.2s ease both' }}>
          {user ? (
            <>
              <Link href="/game">
                <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '0.85rem 2.8rem', borderRadius: '16px' }}>
                  🎮 Start Playing
                </button>
              </Link>
              <Link href="/leaderboard">
                <button className="btn-ghost" style={{ fontSize: '1rem', padding: '0.8rem 1.8rem' }}>
                  🏆 Leaderboard
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register">
                <button className="btn-primary" style={{ fontSize: '1.05rem', padding: '0.82rem 2.2rem' }}>
                  🚀 Get Started
                </button>
              </Link>
              <Link href="/login">
                <button className="btn-ghost" style={{ fontSize: '1rem', padding: '0.78rem 1.8rem' }}>
                  Login
                </button>
              </Link>
              <Link href="/leaderboard">
                <button className="btn-ghost" style={{ fontSize: '1rem', padding: '0.78rem 1.6rem' }}>
                  🏆 Leaderboard
                </button>
              </Link>
            </>
          )}
        </div>
      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </>
  );
}
