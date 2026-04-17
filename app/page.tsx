import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('pof_token')?.value;
  const user = token ? verifyToken(token) : null;

  const rules = [
    { icon: '⏱', label: 'Time Limit',    val: '30 seconds',    desc: 'Clock starts immediately' },
    { icon: '✅', label: 'Correct',       val: '+10 pts & +5s', desc: 'Points plus extra time' },
    { icon: '❌', label: 'Wrong Answer',  val: '−5 seconds',    desc: 'Penalty on mistakes' },
    { icon: '⚡', label: 'Speed Bonus',   val: '+20 bonus pts', desc: 'Answer under 3 seconds' },
    { icon: '🔥', label: '3-Streak',      val: '×1.5 mult',     desc: 'Chain correct answers' },
    { icon: '💥', label: '5-Streak',      val: '×2.0 mult',     desc: 'Keep the fire going' },
    { icon: '🏆', label: '10-Streak',     val: '×3.0 mult',     desc: 'Absolute legend mode' },
  ];

  const tiers = [
    { icon: '🥉', label: 'Bronze',  score: '0–149',   color: '#cd7f32', bg: 'rgba(205,127,50,0.1)',   border: 'rgba(205,127,50,0.3)' },
    { icon: '🥈', label: 'Silver',  score: '150–299', color: '#adb5bd', bg: 'rgba(173,181,189,0.1)',  border: 'rgba(173,181,189,0.3)' },
    { icon: '🥇', label: 'Gold',    score: '300–499', color: '#f5c518', bg: 'rgba(245,197,24,0.1)',   border: 'rgba(245,197,24,0.35)' },
    { icon: '💎', label: 'Diamond', score: '500+',    color: '#74c0fc', bg: 'rgba(116,192,252,0.12)', border: 'rgba(116,192,252,0.35)' },
  ];

  return (
    <div className="home-wrapper">

      {/* ── LAYERED BACKGROUND ── */}
      <div className="bg-image" />
      <div className="bg-overlay" />
      <div className="bg-noise" />
      <div className="bg-grid" />
      <div className="bg-vignette" />
      <div className="bg-gradient-orb orb-primary" />
      <div className="bg-gradient-orb orb-secondary" />
      <div className="bg-gradient-orb orb-tertiary" />

      <Navbar username={user?.username} />

      <main className="main-content">

        {/* ── HERO ── */}
        <section className="hero-section">

          {/* Particle ring behind banana */}
          <div className="hero-ring-wrapper">
            <div className="hero-ring hero-ring-1" />
            <div className="hero-ring hero-ring-2" />
            <div className="hero-ring hero-ring-3" />
            <div className="mascot-glow" />
            <div className="hero-mascot">🍌</div>
          </div>

          <div className="hero-eyebrow">
            <span className="eyebrow-line" />
            <span className="eyebrow-text">SEASON I</span>
            <span className="eyebrow-line" />
          </div>

          <h1 className="hero-title">
            <span className="title-line-1">PEEL OF</span>
            <span className="title-line-2">FORTUNE</span>
          </h1>

          <p className="hero-subtitle">
            Solve banana puzzles <span className="dot">◆</span> Beat the clock <span className="dot">◆</span> Climb the board
          </p>

          <div className="live-status">
            <span className="live-dot" />
            <span className="live-text">LIVE COMPETITION SERVER ONLINE</span>
            <span className="live-sep">|</span>
            <span className="live-players">2,847 PLAYERS ACTIVE</span>
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="cta-container">
          {user ? (
            <>
              <Link href="/game" style={{ textDecoration: 'none', width: '100%', maxWidth: 420 }}>
                <button className="game-btn game-btn-primary play-btn">
                  <span className="btn-icon">🎮</span>
                  <span className="btn-label">ENTER ARENA</span>
                  <div className="btn-glow-effect" />
                  <div className="btn-pulse-ring" />
                </button>
              </Link>
              <div className="secondary-ctas">
                <Link href="/leaderboard" style={{ textDecoration: 'none' }}>
                  <button className="game-btn game-btn-ghost">🏆 Leaderboard</button>
                </Link>
                <Link href="/profile" style={{ textDecoration: 'none' }}>
                  <button className="game-btn game-btn-ghost">👤 My Profile</button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link href="/register" style={{ textDecoration: 'none', width: '100%', maxWidth: 420 }}>
                <button className="game-btn game-btn-primary play-btn">
                  <span className="btn-icon">🚀</span>
                  <span className="btn-label">INITIALIZE — FREE</span>
                  <div className="btn-glow-effect" />
                  <div className="btn-pulse-ring" />
                </button>
              </Link>
              <div className="secondary-ctas">
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <button className="game-btn game-btn-ghost">Login</button>
                </Link>
                <Link href="/leaderboard" style={{ textDecoration: 'none' }}>
                  <button className="game-btn game-btn-ghost">🏆 Rankings</button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* ── INFO PANELS ── */}
        <div className="info-grid">

          {/* How to Play */}
          <div className="glass-panel panel-left">
            <div className="panel-top-glow panel-glow-gold" />
            <h2 className="panel-title">
              <span className="title-icon">📖</span>
              <span>MISSION BRIEFING</span>
              <span className="panel-title-badge">×7 RULES</span>
            </h2>

            <div className="rules-list">
              {rules.map(({ icon, label, val, desc }) => (
                <div key={label} className="rule-item">
                  <span className="rule-icon">{icon}</span>
                  <div className="rule-text">
                    <div className="rule-label">{label}</div>
                    <div className="rule-desc">{desc}</div>
                  </div>
                  <span className="rule-value">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="panel-right-col">

            {/* Rank Tiers */}
            <div className="glass-panel panel-right-1">
              <div className="panel-top-glow panel-glow-teal" />
              <h2 className="panel-title">
                <span className="title-icon">🏅</span>
                <span>PRESTIGE TIERS</span>
              </h2>
              <div className="tiers-grid">
                {tiers.map(({ icon, label, score, color, bg, border }) => (
                  <div key={label} className="tier-item" style={{ background: bg, borderColor: border }}>
                    <div className="tier-icon-wrapper">
                      <span className="tier-icon">{icon}</span>
                      <div className="tier-glow" style={{ background: color }} />
                    </div>
                    <span className="tier-label" style={{ color }}>{label}</span>
                    <span className="tier-score">{score} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature card */}
            <div className="glass-panel panel-right-2">
              <div className="panel-top-glow panel-glow-gold" />
              <h2 className="panel-title">
                <span className="title-icon">⚡</span>
                <span>SYSTEM FEATURES</span>
              </h2>
              <div className="features-list">
                {[
                  { icon: '🍌', text: 'Real banana math puzzles from the Banana API' },
                  { icon: '⏰', text: 'Survival timer — every wrong answer costs time' },
                  { icon: '🔥', text: 'Streak multipliers up to ×3 for chained answers' },
                  { icon: '🏆', text: 'Global leaderboard — compete against everyone' },
                  { icon: '📊', text: 'Personal profile with full game history' },
                ].map(({ icon, text }) => (
                  <div key={text} className="feature-item">
                    <span className="feature-icon">{icon}</span>
                    <span className="feature-text">{text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Bottom CTA banner ── */}
        <div className="bottom-banner">
          <div className="banner-glow-line" />
          <div className="banner-noise" />
          <div className="banner-content">
            <div className="banner-text">
              <h3 className="banner-title">READY TO PEEL? 🍌</h3>
              <p className="banner-subtitle">Jump in — a new puzzle awaits every second</p>
            </div>
            <div className="banner-action">
              <Link href={user ? '/game' : '/register'} style={{ textDecoration: 'none' }}>
                <button className="game-btn game-btn-primary banner-btn">
                  <div className="btn-glow-effect" />
                  {user ? '🎮 ENTER GAME' : '🚀 SECURE ACCESS'}
                </button>
              </Link>
            </div>
          </div>
        </div>

      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;800&family=Fira+Code:wght@400;500;600&display=swap');

        :root {
          --gold:        #F5C518;
          --gold-dim:    rgba(245,197,24,0.18);
          --gold-glow:   rgba(245,197,24,0.35);
          --teal:        #00E5FF;
          --teal-dim:    rgba(0,229,255,0.12);
          --teal-glow:   rgba(0,229,255,0.3);
          --green:       #2ECC71;
          --surface-0:   #07060A;
          --surface-1:   rgba(255,255,255,0.03);
          --surface-2:   rgba(255,255,255,0.055);
          --border:      rgba(255,255,255,0.06);
          --border-hi:   rgba(255,255,255,0.12);
          --text:        #F0EBE3;
          --text-muted:  rgba(240,235,227,0.5);
          --text-dim:    rgba(240,235,227,0.25);
          --font-d:      'Bebas Neue', 'Barlow Condensed', sans-serif;
          --font-ui:     'Barlow Condensed', sans-serif;
          --font-mono:   'Fira Code', monospace;
        }

        /* ── BASE ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .home-wrapper {
          min-height: 100vh;
          background-color: var(--surface-0);
          color: var(--text);
          font-family: var(--font-ui);
          position: relative;
          overflow-x: hidden;
        }

        /* ── BACKGROUND STACK ── */
        .bg-image {
          position: fixed;
          inset: 0;
          background-image: url('/bg-home.png');
          background-size: cover;
          background-position: center;
          z-index: 0;
          opacity: 0.12;
          filter: saturate(1.4) brightness(0.6);
        }

        .bg-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(30,20,5,0.95) 0%, rgba(7,6,10,0.98) 70%);
          z-index: 1;
        }

        .bg-noise {
          position: fixed;
          inset: 0;
          z-index: 2;
          opacity: 0.028;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .bg-grid {
          position: fixed;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background-image:
            linear-gradient(to right, rgba(245,197,24,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(245,197,24,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 15%, rgba(0,0,0,0.6) 85%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 15%, rgba(0,0,0,0.6) 85%, transparent 100%);
        }

        .bg-vignette {
          position: fixed;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%);
        }

        .bg-gradient-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
          z-index: 1;
        }

        .orb-primary {
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(245,197,24,1), transparent 70%);
          top: -280px; left: 50%;
          transform: translateX(-50%);
          opacity: 0.07;
          animation: orbDrift 10s ease-in-out infinite alternate;
        }

        .orb-secondary {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(0,229,255,1), transparent 70%);
          bottom: -100px; right: -120px;
          opacity: 0.05;
          animation: orbDrift 14s 2s ease-in-out infinite alternate-reverse;
        }

        .orb-tertiary {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(245,197,24,1), transparent 70%);
          bottom: 30%; left: -80px;
          opacity: 0.04;
          animation: orbDrift 12s 4s ease-in-out infinite alternate;
        }

        /* ── LAYOUT ── */
        .main-content {
          max-width: 1040px;
          margin: 0 auto;
          padding: 4.5rem 1.5rem 7rem;
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* ── HERO ── */
        .hero-section {
          text-align: center;
          margin-bottom: 1.5rem;
          margin-top: -3.5rem;
          animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) both;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-ring-wrapper {
          position: relative;
          width: 160px; height: 160px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 2rem;
        }

        .hero-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
        }

        .hero-ring-1 {
          width: 130px; height: 130px;
          border-color: rgba(245,197,24,0.2);
          animation: ringPulse 3s ease-in-out infinite;
        }

        .hero-ring-2 {
          width: 155px; height: 155px;
          border-color: rgba(245,197,24,0.1);
          animation: ringPulse 3s 0.5s ease-in-out infinite;
        }

        .hero-ring-3 {
          width: 180px; height: 180px;
          border-color: rgba(0,229,255,0.06);
          animation: ringPulse 3s 1s ease-in-out infinite;
        }

        .mascot-glow {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 90px; height: 90px;
          background: radial-gradient(circle, rgba(245,197,24,0.5), transparent 70%);
          border-radius: 50%;
          filter: blur(20px);
          animation: glowBreathe 3s ease-in-out infinite;
        }

        .hero-mascot {
          font-size: 5.5rem;
          line-height: 1;
          position: relative;
          z-index: 5;
          animation: float 4.5s ease-in-out infinite;
          filter: drop-shadow(0 0 30px rgba(245,197,24,0.4)) drop-shadow(0 12px 24px rgba(0,0,0,0.6));
        }

        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .eyebrow-line {
          flex: 1;
          max-width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,197,24,0.5));
        }

        .eyebrow-line:last-child {
          background: linear-gradient(90deg, rgba(245,197,24,0.5), transparent);
        }

        .eyebrow-text {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--gold);
          letter-spacing: 0.3em;
          text-transform: uppercase;
          opacity: 0.8;
        }

        .hero-title {
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 0.92;
          margin-bottom: 1.25rem;
          letter-spacing: 0.04em;
        }

        .title-line-1 {
          font-family: var(--font-d);
          font-size: clamp(4rem,10vw,7.5rem);
          color: var(--text);
          display: block;
          text-shadow: 0 2px 0 rgba(0,0,0,0.8);
        }

        .title-line-2 {
          font-family: var(--font-d);
          font-size: clamp(4rem,10vw,7.5rem);
          display: block;
          background: linear-gradient(180deg, #fff 0%, var(--gold) 45%, #B8850A 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 30px rgba(245,197,24,0.25));
          position: relative;
        }

        /* Glitch accent on title */
        .title-line-2::after {
          content: 'FORTUNE';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, var(--teal) 0%, transparent 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0;
          animation: glitchFlash 8s 3s ease infinite;
          left: 2px;
        }

        .hero-subtitle {
          color: var(--text-muted);
          font-family: var(--font-ui);
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.9rem;
          flex-wrap: wrap;
          margin-bottom: 1.75rem;
        }

        .dot {
          color: var(--gold);
          opacity: 0.6;
          font-size: 0.5rem;
        }

        .live-status {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 0.55rem 1.1rem;
          border-radius: 999px;
          border: 1px solid rgba(46,204,113,0.2);
          box-shadow: 0 0 20px rgba(46,204,113,0.08), inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .live-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 8px var(--green), 0 0 16px rgba(46,204,113,0.5);
          animation: flash 1.8s ease-in-out infinite;
          flex-shrink: 0;
        }

        .live-text {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: rgba(46,204,113,0.9);
          font-weight: 500;
          letter-spacing: 0.12em;
        }

        .live-sep {
          color: rgba(255,255,255,0.15);
          font-size: 0.65rem;
        }

        .live-players {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: rgba(255,255,255,0.35);
          font-weight: 500;
          letter-spacing: 0.1em;
        }

        /* ── CTAs ── */
        .cta-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 4.5rem;
          animation: fadeUp 0.9s 0.12s cubic-bezier(0.16,1,0.3,1) both;
          width: 100%;
        }

        .secondary-ctas {
          display: flex;
          gap: 0.85rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .game-btn {
          font-family: var(--font-d);
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
          overflow: hidden;
        }

        .game-btn-primary {
          background: linear-gradient(155deg, #F7D044 0%, #D4930A 60%, #B8750A 100%);
          color: #0A0700;
          border-radius: 14px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.15) inset,
            0 1px 0 rgba(255,255,255,0.3) inset,
            0 12px 32px -8px rgba(245,197,24,0.5),
            0 4px 12px rgba(0,0,0,0.4);
        }

        .play-btn {
          font-size: 1.3rem;
          padding: 1.2rem 3rem;
          width: 100%;
          border-radius: 16px;
        }

        .btn-label {
          position: relative;
          z-index: 2;
        }

        .btn-icon {
          font-size: 1.35rem;
          position: relative;
          z-index: 2;
        }

        .game-btn-primary:hover {
          transform: translateY(-3px) scale(1.015);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.2) inset,
            0 1px 0 rgba(255,255,255,0.4) inset,
            0 20px 44px -8px rgba(245,197,24,0.65),
            0 8px 20px rgba(0,0,0,0.5),
            0 0 60px rgba(245,197,24,0.2);
          filter: brightness(1.05);
        }

        .game-btn-primary:active {
          transform: translateY(1px) scale(0.985);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.1) inset,
            0 4px 12px -4px rgba(245,197,24,0.3);
        }

        /* Shine sweep */
        .btn-glow-effect {
          position: absolute;
          top: 0; left: -110%;
          width: 60%; height: 100%;
          background: linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%);
          transform: skewX(-18deg);
          animation: shine 5s 1s ease infinite;
          z-index: 1;
        }

        /* Pulse ring on primary button */
        .btn-pulse-ring {
          position: absolute;
          inset: -4px;
          border-radius: 18px;
          border: 2px solid rgba(245,197,24,0.5);
          animation: pulseRing 3s ease-in-out infinite;
          pointer-events: none;
        }

        .game-btn-ghost {
          background: rgba(255,255,255,0.04);
          color: var(--text-muted);
          border: 1px solid var(--border-hi);
          border-radius: 12px;
          padding: 0.85rem 1.85rem;
          font-size: 1.05rem;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          letter-spacing: 0.06em;
          transition: all 0.2s ease;
        }

        .game-btn-ghost:hover {
          background: rgba(245,197,24,0.07);
          border-color: rgba(245,197,24,0.35);
          color: var(--gold);
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(245,197,24,0.1), 0 8px 20px rgba(0,0,0,0.3);
        }

        .game-btn-ghost:active { transform: translateY(0); }

        /* ── INFO GRID ── */
        .info-grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        /* ── GLASS PANELS ── */
        .glass-panel {
          background: linear-gradient(160deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.02) 100%);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid var(--border-hi);
          border-radius: 22px;
          padding: 2rem;
          box-shadow:
            0 32px 64px -20px rgba(0,0,0,0.7),
            inset 0 1px 0 rgba(255,255,255,0.07);
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .glass-panel:hover {
          border-color: rgba(255,255,255,0.1);
          box-shadow:
            0 32px 64px -20px rgba(0,0,0,0.8),
            0 0 0 1px rgba(245,197,24,0.08),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }

        /* Colored top accent line */
        .panel-top-glow {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 22px 22px 0 0;
          z-index: 2;
        }

        .panel-glow-gold {
          background: linear-gradient(90deg, transparent 0%, rgba(245,197,24,0.7) 30%, var(--gold) 50%, rgba(245,197,24,0.7) 70%, transparent 100%);
          box-shadow: 0 0 20px rgba(245,197,24,0.4);
        }

        .panel-glow-teal {
          background: linear-gradient(90deg, transparent 0%, rgba(0,229,255,0.6) 30%, var(--teal) 50%, rgba(0,229,255,0.6) 70%, transparent 100%);
          box-shadow: 0 0 20px rgba(0,229,255,0.3);
        }

        /* Corner decoration */
        .glass-panel::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 80px; height: 80px;
          background: radial-gradient(circle at bottom right, rgba(245,197,24,0.04), transparent 70%);
          pointer-events: none;
        }

        .panel-left   { animation: fadeUp 0.9s 0.2s cubic-bezier(0.16,1,0.3,1) both; }
        .panel-right-1{ animation: fadeUp 0.9s 0.28s cubic-bezier(0.16,1,0.3,1) both; }
        .panel-right-2{ animation: fadeUp 0.9s 0.36s cubic-bezier(0.16,1,0.3,1) both; }

        .panel-right-col {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .panel-title {
          font-family: var(--font-d);
          font-size: 1.5rem;
          letter-spacing: 0.08em;
          color: var(--text);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .title-icon {
          font-size: 1.4rem;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
        }

        .panel-title-badge {
          margin-left: auto;
          font-family: var(--font-mono);
          font-size: 0.62rem;
          font-weight: 500;
          color: var(--text-dim);
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          letter-spacing: 0.1em;
        }

        /* ── RULES ── */
        .rules-list {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .rule-item {
          display: grid;
          grid-template-columns: 36px 1fr auto;
          align-items: center;
          gap: 0.9rem;
          padding: 0.85rem 1rem;
          background: rgba(0,0,0,0.28);
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.03);
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        /* Left accent flash on hover */
        .rule-item::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, var(--gold), var(--teal));
          border-radius: 14px 0 0 14px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .rule-item:hover {
          background: rgba(245,197,24,0.05);
          border-color: rgba(245,197,24,0.15);
          transform: translateX(5px);
        }

        .rule-item:hover::before {
          opacity: 1;
        }

        .rule-icon {
          font-size: 1.3rem;
          text-align: center;
          filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5));
        }

        .rule-label {
          font-family: var(--font-ui);
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 0.15rem;
        }

        .rule-desc {
          font-family: var(--font-ui);
          font-size: 0.78rem;
          color: var(--text-dim);
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .rule-value {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--gold);
          background: rgba(245,197,24,0.08);
          padding: 0.35rem 0.65rem;
          border-radius: 8px;
          border: 1px solid rgba(245,197,24,0.2);
          white-space: nowrap;
          letter-spacing: 0.04em;
        }

        /* ── TIERS ── */
        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.85rem;
        }

        .tier-item {
          padding: 1.25rem 1rem;
          border-radius: 16px;
          border: 1px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.45rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .tier-item:hover {
          transform: translateY(-4px) scale(1.025);
          box-shadow: 0 12px 28px -8px rgba(0,0,0,0.5), 0 0 30px -8px currentColor;
        }

        .tier-icon-wrapper {
          position: relative;
          margin-bottom: 0.1rem;
        }

        .tier-icon {
          font-size: 2rem;
          position: relative;
          z-index: 2;
          display: block;
        }

        .tier-glow {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 36px; height: 36px;
          border-radius: 50%;
          filter: blur(16px);
          opacity: 0.45;
          z-index: 1;
          animation: glowBreathe 3s ease-in-out infinite;
        }

        .tier-label {
          font-family: var(--font-d);
          font-size: 1.1rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .tier-score {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--text-dim);
          font-weight: 500;
          letter-spacing: 0.06em;
        }

        /* ── FEATURES ── */
        .features-list {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          padding: 0.8rem 0.9rem;
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.025);
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .feature-item:hover {
          background: rgba(0,229,255,0.04);
          border-color: rgba(0,229,255,0.12);
        }

        .feature-icon {
          font-size: 1.1rem;
          flex-shrink: 0;
          filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5));
        }

        .feature-text {
          font-family: var(--font-ui);
          font-size: 0.9rem;
          color: var(--text-muted);
          font-weight: 500;
          letter-spacing: 0.02em;
          line-height: 1.4;
        }

        /* ── BOTTOM BANNER ── */
        .bottom-banner {
          width: 100%;
          background: linear-gradient(135deg, rgba(18,14,4,0.9) 0%, rgba(7,6,10,0.95) 100%);
          border: 1px solid rgba(245,197,24,0.2);
          border-radius: 22px;
          padding: 2.5rem;
          position: relative;
          overflow: hidden;
          margin-top: 1.5rem;
          animation: fadeUp 0.9s 0.45s cubic-bezier(0.16,1,0.3,1) both;
          box-shadow: 0 24px 48px -12px rgba(0,0,0,0.7), 0 0 40px -16px rgba(245,197,24,0.15);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .banner-glow-line {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, var(--gold) 30%, var(--teal) 70%, transparent 100%);
          opacity: 0.9;
          animation: shimmerLine 4s ease-in-out infinite;
        }

        .banner-noise {
          position: absolute;
          inset: 0;
          opacity: 0.02;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .banner-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 2rem;
          position: relative;
          z-index: 2;
        }

        .banner-title {
          font-family: var(--font-d);
          font-size: 2.2rem;
          letter-spacing: 0.06em;
          color: var(--gold);
          margin-bottom: 0.4rem;
          text-shadow: 0 0 20px rgba(245,197,24,0.3);
        }

        .banner-subtitle {
          font-family: var(--font-ui);
          color: var(--text-muted);
          font-size: 1rem;
          font-weight: 500;
          letter-spacing: 0.04em;
        }

        .banner-btn {
          padding: 1.15rem 2.75rem;
          font-size: 1.15rem;
          white-space: nowrap;
          border-radius: 14px;
        }

        @media (max-width: 768px) {
          .banner-content { flex-direction: column; text-align: center; }
          .banner-action { width: 100%; }
          .banner-btn { width: 100%; }
          .info-grid { grid-template-columns: 1fr; }
          .hero-title { font-size: 3.5rem; }
        }

        /* ── KEYFRAMES ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50%       { transform: translateY(-14px) rotate(4deg); }
        }

        @keyframes orbDrift {
          0%   { opacity: 0.05; transform: translateX(-50%) scale(1); }
          100% { opacity: 0.1;  transform: translateX(-50%) scale(1.12); }
        }

        @keyframes glowBreathe {
          0%, 100% { opacity: 0.5; transform: translate(-50%,-50%) scale(1); }
          50%       { opacity: 0.85; transform: translate(-50%,-50%) scale(1.25); }
        }

        @keyframes ringPulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%,-50%) scale(1); }
          50%       { opacity: 0.25; transform: translate(-50%,-50%) scale(1.06); }
        }

        @keyframes flash {
          0%, 100% { opacity: 1;   box-shadow: 0 0 8px var(--green), 0 0 16px rgba(46,204,113,0.5); }
          50%       { opacity: 0.4; box-shadow: 0 0 4px var(--green); }
        }

        @keyframes shine {
          0%   { left: -110%; }
          20%  { left: 200%; }
          100% { left: 200%; }
        }

        @keyframes pulseRing {
          0%   { opacity: 0.7; transform: scale(1); }
          60%  { opacity: 0;   transform: scale(1.08); }
          100% { opacity: 0;   transform: scale(1.08); }
        }

        @keyframes glitchFlash {
          0%, 94%, 97%, 100% { opacity: 0; transform: translateX(0); }
          95%                 { opacity: 0.12; transform: translateX(-3px); }
          96%                 { opacity: 0.08; transform: translateX(3px); }
        }

        @keyframes shimmerLine {
          0%, 100% { opacity: 0.7; background-position: 0% 50%; }
          50%       { opacity: 1;   background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}