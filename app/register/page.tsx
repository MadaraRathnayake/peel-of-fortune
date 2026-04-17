'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username:'', email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/game'); router.refresh();
    } catch { setError('Network error'); } finally { setLoading(false); }
  };

  const perks = ['🍌 Access all banana puzzles', '🏆 Compete on global leaderboard', '📊 Track your progress & stats', '🔥 Unlock streak multipliers'];

  return (
    <main style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem',
      backgroundColor: '#050505',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Rich Animated Background Elements */}
      <div className="bg-grid"></div>
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>

      {/* Two-Column Layout Container */}
      <div style={{ 
        width:'100%', maxWidth:1100, display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'center', gap:'4rem',
        position: 'relative', zIndex: 10
      }}>

        {/* LEFT CENTER: Brand & Perks */}
        <div style={{ flex: '1 1 400px', animation:'fadeRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
          <div style={{ textAlign:'left', marginBottom:'2.5rem' }}>
            <div style={{ fontSize:'5rem', display:'inline-block', marginBottom:'0.5rem',
              filter:'drop-shadow(0 0 30px rgba(245,197,24,0.6))',
              animation:'floatGentle 4s ease-in-out infinite' }}>🍌</div>
            <h1 style={{ fontFamily:'var(--font-d), Impact, sans-serif', fontSize:'3.2rem', letterSpacing:'4px', color:'#f5c518', marginBottom:'0.5rem', textTransform:'uppercase', textShadow:'0 0 20px rgba(245,197,24,0.4)', lineHeight: 1.1 }}>
              JOIN THE<br/>GAME
            </h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'1.1rem', fontWeight:500, letterSpacing:'0.5px', marginTop:'1rem' }}>
              Create your Peel of Fortune account
            </p>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {perks.map((p, i) => (
              <div key={p} className="perk-badge" style={{ animationDelay: `${i * 0.15}s` }}>
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CENTER: Registration Form */}
        <div style={{ flex: '1 1 400px', maxWidth: 460, width:'100%', animation:'fadeLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
          <div className="neon-card" style={{ padding:'2.5rem' }}>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.4rem' }}>
              <div>
                <label className="neon-label">Username</label>
                <input className="neon-input" name="username" value={form.username} onChange={handleChange} placeholder="BananaHunter_42" required autoFocus/>
              </div>
              <div>
                <label className="neon-label">Email Address</label>
                <input className="neon-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required/>
              </div>
              <div>
                <label className="neon-label">Password</label>
                <input className="neon-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required/>
              </div>

              {error && (
                <div style={{ padding:'0.75rem', background:'rgba(255,50,50,0.1)', border:'1px solid rgba(255,50,50,0.3)', borderRadius:'8px', color:'#ff6b6b', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'0.5rem', animation:'shake 0.4s ease' }}>
                  ⚠️ {error}
                </div>
              )}

              <button className="neon-btn" type="submit" disabled={loading}
                style={{ width:'100%', padding:'1rem', fontSize:'1.1rem', marginTop:'0.5rem' }}>
                {loading ? (
                  <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'0.75rem' }}>
                    <span style={{ width:18, height:18, border:'3px solid rgba(0,0,0,0.2)', borderTopColor:'#000', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }}/>
                    CREATING ACCOUNT...
                  </span>
                ) : '🚀 CREATE ACCOUNT — FREE'}
              </button>
            </form>

            <div style={{ display:'flex', alignItems:'center', gap:'1rem', margin:'2rem 0 1.5rem' }}>
              <div style={{ flex:1, height:'1px', background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.15))' }}/>
              <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1px' }}>OR</span>
              <div style={{ flex:1, height:'1px', background:'linear-gradient(270deg, transparent, rgba(255,255,255,0.15))' }}/>
            </div>

            <div style={{ textAlign:'center' }}>
              <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.95rem', fontWeight:500 }}>Already have an account? </span>
              <Link href="/login" className="login-link">Login →</Link>
            </div>
          </div>

          <div style={{ textAlign:'center', marginTop:'2rem' }}>
            <Link href="/" style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.85rem', textDecoration:'none', fontWeight:600, transition:'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='rgba(255,255,255,0.6)'} onMouseOut={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        /* Rich Background Styling */
        .bg-grid {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: 
            linear-gradient(rgba(245, 197, 24, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245, 197, 24, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 1;
          opacity: 0.6;
          animation: bgShift 20s linear infinite;
        }
        .ambient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          z-index: 1;
          opacity: 0.5;
        }
        .orb-1 {
          width: 500px; height: 500px;
          background: rgba(245, 197, 24, 0.15);
          top: -10%; left: -10%;
          animation: floatOrb 10s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: rgba(245, 197, 24, 0.1);
          bottom: -10%; right: -5%;
          animation: floatOrb 12s ease-in-out infinite alternate-reverse;
        }

        /* Form Components */
        .neon-card {
          background: rgba(15, 15, 20, 0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(245, 197, 24, 0.2);
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(245, 197, 24, 0.05);
          position: relative;
          overflow: hidden;
        }
        .neon-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(245,197,24,0.6), transparent);
        }
        .neon-label {
          display: block;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .neon-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 1rem 1.25rem;
          color: #fff;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
        }
        .neon-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
        .neon-input:focus {
          border-color: #f5c518;
          box-shadow: 0 0 20px rgba(245, 197, 24, 0.25), inset 0 0 10px rgba(245, 197, 24, 0.15);
          background: rgba(20, 18, 10, 0.7);
          transform: translateY(-1px);
        }
        .neon-btn {
          background: linear-gradient(135deg, #f5c518 0%, #d4a017 100%);
          color: #000;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(245, 197, 24, 0.2);
        }
        .neon-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(245, 197, 24, 0.5);
          background: linear-gradient(135deg, #ffe066 0%, #f5c518 100%);
        }
        .neon-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .neon-btn:disabled {
          background: linear-gradient(135deg, #7a630e 0%, #59440b 100%);
          color: rgba(0,0,0,0.5);
          cursor: not-allowed;
          box-shadow: none;
        }
        .perk-badge {
          padding: 1rem 1.2rem;
          background: linear-gradient(90deg, rgba(245, 197, 24, 0.08) 0%, rgba(245, 197, 24, 0.02) 100%);
          border-left: 3px solid #f5c518;
          border-radius: 0 12px 12px 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
          animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          backdrop-filter: blur(10px);
        }
        .perk-badge:hover {
          background: linear-gradient(90deg, rgba(245, 197, 24, 0.15) 0%, rgba(245, 197, 24, 0.05) 100%);
          color: #fff;
          transform: translateX(5px);
          box-shadow: 0 4px 15px rgba(245, 197, 24, 0.15);
        }
        .login-link {
          color: #f5c518;
          text-decoration: none;
          font-weight: 800;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .login-link:hover {
          color: #ffe066;
          text-shadow: 0 0 12px rgba(245,197,24,0.6);
        }

        /* Animations */
        @keyframes fadeRight { from { opacity: 0; transform: translateX(-30px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes fadeLeft { from { opacity: 0; transform: translateX(30px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes floatGentle { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes floatOrb { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(30px, 30px) scale(1.1); } }
        @keyframes bgShift { 0% { background-position: 0 0; } 100% { background-position: 40px 40px; } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes shake { 0%, 100% { transform: translateX(0) } 25% { transform: translateX(-5px) } 75% { transform: translateX(5px) } }

        /* Mobile Adjustments */
        @media (max-width: 900px) {
          .perk-badge { border-left: none; border-bottom: 3px solid #f5c518; border-radius: 12px 12px 0 0; text-align: center; }
        }
      `}</style>
    </main>
  );
}