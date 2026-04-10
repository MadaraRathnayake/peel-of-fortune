'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/game');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(245,197,24,0.06) 0%, transparent 70%)',
    }}>
      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp 0.45s ease both' }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '3.5rem',
            display: 'inline-block',
            marginBottom: '0.5rem',
            filter: 'drop-shadow(0 0 20px rgba(245,197,24,0.45))',
            animation: 'float 3s ease-in-out infinite',
          }}>🍌</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            letterSpacing: '3px',
            color: 'var(--banana-yellow)',
            marginBottom: '0.25rem',
          }}>WELCOME BACK</h1>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.88rem', fontWeight: 600 }}>
            Login to Peel of Fortune
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label className="form-label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ marginTop: '0.25rem', width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Logging in...
                </span>
              ) : 'Login'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.4rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.9rem' }}>No account? </span>
            <Link href="/register" style={{ color: 'var(--banana-yellow)', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem' }}>
              Register →
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Home
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
