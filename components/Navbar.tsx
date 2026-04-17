'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface NavbarProps { username?: string; }

export default function Navbar({ username }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(3,5,13,0.88)',
      borderBottom: '1px solid rgba(245,197,24,0.12)',
      padding: '0 1.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '64px',
      backdropFilter: 'blur(36px)',
      WebkitBackdropFilter: 'blur(36px)',
      boxShadow: '0 1px 0 rgba(245,197,24,0.06), 0 8px 40px rgba(0,0,0,0.7)',
      animation: 'slideDown 0.4s ease both',
    }}>
      {/* Underline glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(245,197,24,0.4) 25%, rgba(0,240,255,0.25) 65%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      {/* Top shimmer line */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }}/>

      {/* ── Logo ── */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 38, height: 38, borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(245,197,24,0.2) 0%, rgba(245,197,24,0.06) 100%)',
          border: '1.5px solid rgba(245,197,24,0.38)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.25rem',
          boxShadow: '0 0 20px rgba(245,197,24,0.22)',
          animation: 'floatGentle 3s ease-in-out infinite',
          flexShrink: 0, position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,rgba(245,197,24,0.6),transparent)' }}/>
          🍌
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-d)',
            fontSize: '1.25rem', letterSpacing: '3px', lineHeight: 1,
            background: 'linear-gradient(135deg, #fff8d0 0%, #ffd84d 40%, #f5c518 70%, #c88a00 100%)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'shimmer 4.5s linear infinite',
          }}>PEEL OF FORTUNE</div>
          <div style={{
            fontFamily: 'var(--font-hud)', fontSize: '0.42rem',
            color: 'rgba(255,255,255,0.2)', fontWeight: 600,
            letterSpacing: '3px', textTransform: 'uppercase', marginTop: '1px',
          }}>Banana Puzzle Game</div>
        </div>
      </Link>

      {/* ── Nav Links ── */}
      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
        {username ? (
          <>
            <Link href="/leaderboard" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.44rem 0.95rem', borderRadius: '10px',
                fontSize: '0.84rem', fontWeight: 700,
                color: isActive('/leaderboard') ? 'var(--y)' : 'rgba(255,255,255,0.45)',
                background: isActive('/leaderboard') ? 'rgba(245,197,24,0.1)' : 'transparent',
                border: `1px solid ${isActive('/leaderboard') ? 'rgba(245,197,24,0.3)' : 'transparent'}`,
                transition: 'all 0.2s', cursor: 'pointer',
              }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.color='var(--y)'; el.style.background='rgba(245,197,24,0.07)'; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.color=isActive('/leaderboard')?'var(--y)':'rgba(255,255,255,0.45)'; el.style.background=isActive('/leaderboard')?'rgba(245,197,24,0.1)':'transparent'; }}
              >
                <span>🏆</span><span className="nav-text">Board</span>
              </div>
            </Link>

            <Link href="/game" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.5rem 1.2rem', borderRadius: '10px',
                fontSize: '0.88rem', fontWeight: 800,
                background: 'linear-gradient(135deg, rgba(245,197,24,0.18) 0%, rgba(210,152,0,0.12) 100%)',
                color: 'var(--y)',
                border: '1.5px solid rgba(245,197,24,0.38)',
                boxShadow: '0 0 24px rgba(245,197,24,0.14), inset 0 1px 0 rgba(255,255,255,0.08)',
                transition: 'all 0.2s', cursor: 'pointer', position:'relative', overflow:'hidden',
              }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.boxShadow='0 0 36px rgba(245,197,24,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'; el.style.transform='translateY(-1px)'; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.boxShadow='0 0 24px rgba(245,197,24,0.14), inset 0 1px 0 rgba(255,255,255,0.08)'; el.style.transform='none'; }}
              >
                <span>🎮</span><span className="nav-text">Play</span>
              </div>
            </Link>

            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.44rem 0.95rem', borderRadius: '10px',
                fontSize: '0.84rem', fontWeight: 700,
                color: isActive('/profile') ? 'var(--y)' : 'rgba(255,255,255,0.5)',
                background: isActive('/profile') ? 'rgba(245,197,24,0.08)' : 'transparent',
                border: `1px solid ${isActive('/profile') ? 'rgba(245,197,24,0.3)' : 'transparent'}`,
                transition: 'all 0.2s', cursor: 'pointer',
              }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.color='var(--y)'; el.style.background='rgba(245,197,24,0.07)'; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.color=isActive('/profile')?'var(--y)':'rgba(255,255,255,0.5)'; el.style.background=isActive('/profile')?'rgba(245,197,24,0.08)':'transparent'; }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(245,197,24,0.28), rgba(245,197,24,0.08))',
                  border: '1.5px solid rgba(245,197,24,0.45)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', flexShrink: 0,
                }}>👤</div>
                <span className="nav-text" style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</span>
              </div>
            </Link>

            <button onClick={handleLogout} style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '10px', padding: '0.44rem 0.95rem',
              color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
              fontSize: '0.8rem', fontFamily: 'var(--font-b)', fontWeight: 700,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e=>{ const b=e.currentTarget; b.style.color='#ff6b6b'; b.style.borderColor='rgba(255,107,107,0.38)'; b.style.background='rgba(255,71,87,0.07)'; }}
            onMouseLeave={e=>{ const b=e.currentTarget; b.style.color='rgba(255,255,255,0.3)'; b.style.borderColor='rgba(255,255,255,0.09)'; b.style.background='transparent'; }}
            >Sign out</button>
          </>
        ) : (
          <>
            <Link href="/leaderboard" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.44rem 0.95rem', borderRadius: '10px',
                fontSize: '0.84rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)',
                transition: 'all 0.2s', cursor: 'pointer',
              }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.75)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.45)'}
              >🏆 <span className="nav-text">Board</span></div>
            </Link>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '0.44rem 0.95rem', borderRadius: '10px',
                fontSize: '0.84rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s', cursor: 'pointer',
              }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.color='rgba(255,255,255,0.8)'; el.style.borderColor='rgba(255,255,255,0.22)'; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.color='rgba(255,255,255,0.5)'; el.style.borderColor='rgba(255,255,255,0.1)'; }}
              >Login</div>
            </Link>
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.88rem', borderRadius: '10px' }}>
                Register
              </button>
            </Link>
          </>
        )}
      </div>

      <style>{`
        .nav-text { display: inline; }
        @media (max-width: 500px) { .nav-text { display: none; } }
        @keyframes slideDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatGentle { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes shimmer { 0%{background-position:-400% center} 100%{background-position:400% center} }
      `}</style>
    </nav>
  );
}
