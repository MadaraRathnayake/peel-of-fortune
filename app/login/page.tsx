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
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/game'); router.refresh();
    } catch { setError('Network error'); } finally { setLoading(false); }
  };

  return (
    <main style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      padding:'1.25rem', position:'relative', overflow:'hidden',
    }}>
      {/* Ambient blobs */}
      <div style={{ position:'fixed', top:'15%', left:'5%', width:380, height:380, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,197,24,0.08) 0%, transparent 70%)', pointerEvents:'none', zIndex:0, animation:'orbDrift 10s ease-in-out infinite' }}/>
      <div style={{ position:'fixed', bottom:'10%', right:'5%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)', pointerEvents:'none', zIndex:0, animation:'orbDrift 14s ease-in-out infinite reverse' }}/>
      {/* Stars */}
      {[{x:'12%',y:'22%',d:'0s'},{x:'88%',y:'18%',d:'0.7s'},{x:'7%',y:'75%',d:'1.3s'},{x:'93%',y:'70%',d:'0.4s'}].map(({x,y,d},i)=>(
        <div key={i} style={{ position:'fixed', left:x, top:y, width:4, height:4, borderRadius:'50%', background:'rgba(245,197,24,0.7)', pointerEvents:'none', zIndex:0, animation:`starTwinkle ${2+i*0.5}s ease-in-out infinite`, animationDelay:d, filter:'blur(0.5px)' }}/>
      ))}

      <div style={{ width:'100%', maxWidth:440, animation:'fadeUp 0.45s ease both', position:'relative', zIndex:1 }}>

        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <Link href="/" style={{ textDecoration:'none', display:'inline-block' }}>
            <div style={{ position:'relative', display:'inline-block', marginBottom:'0.9rem' }}>
              <div style={{ position:'absolute', inset:'-24px', borderRadius:'50%', background:'radial-gradient(circle, rgba(245,197,24,0.15) 0%, transparent 70%)', animation:'glowPulseOrb 3s ease-in-out infinite' }}/>
              <div style={{ fontSize:'3.8rem', display:'inline-block', filter:'drop-shadow(0 0 30px rgba(245,197,24,0.65))', animation:'floatGentle 3.2s ease-in-out infinite', position:'relative', zIndex:1 }}>🍌</div>
            </div>
          </Link>
          <h1 style={{ fontFamily:'var(--font-d)', fontSize:'2.5rem', letterSpacing:'4px', color:'var(--y)', marginBottom:'0.3rem', textShadow:'0 0 30px rgba(245,197,24,0.4)' }}>
            WELCOME BACK
          </h1>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.88rem', fontWeight:600 }}>
            Login to Peel of Fortune
          </p>
        </div>

        <div className="card" style={{ padding:'2rem', position:'relative' }}>
          <div className="corner-tl"/><div className="corner-tr"/><div className="corner-bl"/><div className="corner-br"/>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            <div>
              <label className="form-label">Email Address</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required autoFocus/>
            </div>

            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                <label className="form-label" style={{ margin:0 }}>Password</label>
              </div>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required/>
            </div>

            {error && <div className="error-msg">⚠️ {error}</div>}

            <button className="btn-primary" type="submit" disabled={loading}
              style={{ width:'100%', padding:'1rem', fontSize:'1.05rem', marginTop:'0.2rem', borderRadius:'var(--r-md)' }}>
              {loading ? (
                <span style={{ display:'inline-flex', alignItems:'center', gap:'0.55rem' }}>
                  <span style={{ width:15, height:15, border:'2.5px solid rgba(0,0,0,0.3)', borderTopColor:'#000', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }}/>
                  Logging in...
                </span>
              ) : '🎮 Login & Play'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', margin:'1.5rem 0' }}>
            <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.06)' }}/>
            <span style={{ fontFamily:'var(--font-hud)', fontSize:'0.58rem', color:'rgba(255,255,255,0.2)', fontWeight:600, letterSpacing:'1.5px' }}>OR</span>
            <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.06)' }}/>
          </div>

          <div style={{ textAlign:'center' }}>
            <span style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.9rem', fontWeight:600 }}>No account? </span>
            <Link href="/register" style={{ color:'var(--y)', textDecoration:'none', fontWeight:800, fontSize:'0.9rem' }}>
              Create one for free →
            </Link>
          </div>
        </div>

        {/* What you get strip */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.5rem', marginTop:'1rem', marginBottom:'0.5rem' }}>
          {[{icon:'🍌',label:'Real puzzles'},{icon:'🏆',label:'Leaderboard'},{icon:'🔥',label:'Streaks'},{icon:'📊',label:'Stats'}].map(({icon,label})=>(
            <div key={label} style={{ textAlign:'center', padding:'0.6rem 0.4rem', background:'rgba(245,197,24,0.03)', border:'1px solid rgba(245,197,24,0.1)', borderRadius:'10px', transition:'border-color 0.2s' }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(245,197,24,0.25)'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(245,197,24,0.1)'}
            >
              <div style={{ fontSize:'1.1rem', marginBottom:'0.2rem' }}>{icon}</div>
              <div style={{ fontFamily:'var(--font-hud)', fontSize:'0.48rem', color:'rgba(255,255,255,0.3)', fontWeight:600, letterSpacing:'0.5px', textTransform:'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:'center', marginTop:'1.1rem' }}>
          <Link href="/" style={{ color:'rgba(255,255,255,0.2)', fontSize:'0.82rem', textDecoration:'none', fontWeight:700 }}>← Back to Home</Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatGentle{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
        @keyframes glowPulseOrb{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes orbDrift{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-15px)}}
        @keyframes starTwinkle{0%,100%{opacity:0.1;transform:scale(1)}50%{opacity:0.8;transform:scale(1.6)}}
      `}</style>
    </main>
  );
}
