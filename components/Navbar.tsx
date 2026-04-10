'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  username?: string;
}

export default function Navbar({ username }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(8,12,20,0.85)',
      borderBottom: '1px solid rgba(245,197,24,0.14)',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🍌</span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.35rem',
          letterSpacing: '2px',
          color: 'var(--banana-yellow)',
          textShadow: '0 0 20px rgba(245,197,24,0.4)',
        }}>
          PEEL OF FORTUNE
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        {username ? (
          <>
            <Link href="/leaderboard" style={navLinkStyle}>
              <span>🏆</span><span className="nav-text">Board</span>
            </Link>
            <Link href="/game" style={{
              ...navLinkStyle,
              background: 'rgba(245,197,24,0.12)',
              color: 'var(--banana-yellow)',
              border: '1px solid rgba(245,197,24,0.3)',
              borderRadius: '10px',
              padding: '0.35rem 0.85rem',
            }}>
              <span>🎮</span><span className="nav-text">Play</span>
            </Link>
            <Link href="/profile" style={{ ...navLinkStyle, gap: '0.4rem' }}>
              <span style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: 'rgba(245,197,24,0.15)',
                border: '1.5px solid rgba(245,197,24,0.35)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem',
              }}>👤</span>
              <span className="nav-text" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c0c8d8' }}>
                {username}
              </span>
            </Link>
            <button onClick={handleLogout} style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '9px',
              padding: '0.35rem 0.85rem',
              color: 'rgba(255,255,255,0.45)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => {
                (e.target as HTMLButtonElement).style.color = '#ff6b6b';
                (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,107,107,0.35)';
              }}
              onMouseLeave={e => {
                (e.target as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)';
                (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/leaderboard" style={navLinkStyle}>🏆 <span className="nav-text">Board</span></Link>
            <Link href="/login" style={navLinkStyle}>Login</Link>
            <Link href="/register">
              <button className="btn-primary" style={{ padding: '0.4rem 1.1rem', fontSize: '0.88rem' }}>Register</button>
            </Link>
          </>
        )}
      </div>

      <style>{`
        .nav-text { display: inline; }
        @media (max-width: 480px) { .nav-text { display: none; } }
      `}</style>
    </nav>
  );
}

const navLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  color: 'rgba(255,255,255,0.55)',
  textDecoration: 'none',
  fontSize: '0.88rem',
  fontWeight: 700,
  padding: '0.35rem 0.65rem',
  borderRadius: '9px',
  transition: 'color 0.15s, background 0.15s',
};
