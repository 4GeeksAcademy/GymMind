import React from "react";
import { useNavigate } from "react-router-dom";

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1734630341082-0fec0e10126c?auto=format&fit=crop&w=1400&q=80",       // hombre con tiza
  features: "https://plus.unsplash.com/premium_photo-1661878265739-da90bc1af051?auto=format&fit=crop&w=1400&q=80",  // hombre con sudadera
  process: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80",      // red AI
  mood: "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?auto=format&fit=crop&w=1400&q=80",      // mujer gimnasio
  results: "https://images.unsplash.com/photo-1649369466246-369915cae3d6?auto=format&fit=crop&w=1400&q=80",   // pull-up
  cta: "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=1400&q=80",       // hombre levantando barra
};

export const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root { --bg: #080c10; --bg2: #0d1318; --accent: #00e5ff; --accent2: #00ff88; --text: #f0f4f8; --muted: #6b7c8f; --card: rgba(255,255,255,0.04); --border: rgba(255,255,255,0.08); }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .gm-body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

        /* NAV */
        .gm-nav { display: flex; align-items: center; height: 60px; background: rgba(8,12,16,0.95); border-bottom: 1px solid var(--border); padding: 0 32px; width: 100%; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(12px); }
        .gm-logo { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 3px; color: var(--accent); flex-shrink: 0; margin-right: 32px; cursor: pointer; }
        .gm-nav-links { display: flex; gap: 28px; flex: 1; }
        .gm-nav-links a { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; transition: color 0.2s; }
        .gm-nav-links a:hover { color: var(--text); }
        .gm-nav-cta { display: flex; gap: 10px; }
        .gm-btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text); padding: 7px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none; display: inline-block; transition: border-color 0.2s; }
        .gm-btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
        .gm-btn-primary { background: var(--accent); color: #000; padding: 7px 16px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; text-decoration: none; display: inline-block; transition: opacity 0.2s; }
        .gm-btn-primary:hover { opacity: 0.85; }

        /* HERO */
        .gm-hero { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .gm-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center top; filter: brightness(0.25); }
        .gm-hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,229,255,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,255,136,0.06) 0%, transparent 60%); }
        .gm-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size: 60px 60px; opacity: 0.4; }
        .gm-hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(8,12,16,0.2) 0%, rgba(8,12,16,0.5) 60%, rgba(8,12,16,1) 100%); }
        .gm-hero-content { position: relative; z-index: 2; text-align: center; padding: 0 24px; max-width: 900px; }
        .gm-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,229,255,0.1); border: 1px solid rgba(0,229,255,0.3); color: var(--accent); padding: 6px 16px; border-radius: 100px; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 20px; }
        .gm-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: gm-pulse 2s infinite; }
        @keyframes gm-pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
        .gm-hero h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(64px, 12vw, 130px); line-height: 0.9; letter-spacing: 4px; margin-bottom: 20px; }
        .gm-accent { color: var(--accent); }
        .gm-accent2 { color: var(--accent2); }
        .gm-hero p { font-size: 17px; color: rgba(240,244,248,0.7); line-height: 1.7; margin-bottom: 32px; max-width: 520px; margin-left: auto; margin-right: auto; }
        .gm-hero-btns { display: flex; gap: 14px; justify-content: center; margin-bottom: 56px; }
        .gm-btn-lg { padding: 14px 32px; font-size: 15px; font-weight: 700; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none; display: inline-block; letter-spacing: 0.5px; }
        .gm-btn-accent-lg { background: var(--accent); color: #000; border: none; transition: transform 0.2s, opacity 0.2s; }
        .gm-btn-accent-lg:hover { transform: translateY(-2px); opacity: 0.9; }
        .gm-btn-outline-lg { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: var(--text); transition: border-color 0.2s; }
        .gm-btn-outline-lg:hover { border-color: var(--accent); color: var(--accent); }
        .gm-hero-stats { display: flex; gap: 56px; justify-content: center; }
        .gm-stat { text-align: center; }
        .gm-stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 42px; color: var(--accent); letter-spacing: 2px; line-height: 1; }
        .gm-stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
        .gm-stat-divider { width: 1px; background: var(--border); }

        /* SECTION WITH IMAGE BG */
        .gm-img-section { position: relative; overflow: hidden; }
        .gm-img-section-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: brightness(0.15); }
        .gm-img-section-overlay { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,229,255,0.08) 0%, transparent 70%); }
        .gm-img-section-content { position: relative; z-index: 2; padding: 80px 32px; max-width: 1200px; margin: 0 auto; }

        /* FEATURES */
        .gm-section-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
        .gm-section-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px, 6vw, 72px); line-height: 0.95; letter-spacing: 2px; margin-bottom: 16px; }
        .gm-section-sub { font-size: 15px; color: var(--muted); max-width: 480px; line-height: 1.7; margin-bottom: 48px; }
        .gm-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .gm-feature-card { background: rgba(8,12,16,0.7); border: 1px solid var(--border); padding: 28px 24px; position: relative; overflow: hidden; transition: background 0.3s, border-color 0.3s; }
        .gm-feature-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,229,255,0.3); }
        .gm-feature-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--accent), transparent); opacity: 0; transition: opacity 0.3s; }
        .gm-feature-card:hover::before { opacity: 1; }
        .gm-feature-num { font-family: 'Bebas Neue', sans-serif; font-size: 52px; color: rgba(255,255,255,0.04); position: absolute; top: 10px; right: 16px; }
        .gm-feature-icon { font-size: 26px; margin-bottom: 12px; }
        .gm-feature-card h3 { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 1px; margin-bottom: 8px; }
        .gm-feature-card p { font-size: 13px; color: var(--muted); line-height: 1.6; }

        /* HOW IT WORKS */
        .gm-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .gm-step { position: relative; }
        .gm-step-num { font-family: 'Bebas Neue', sans-serif; font-size: 64px; color: rgba(0,229,255,0.08); line-height: 1; margin-bottom: 4px; }
        .gm-step h3 { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 1px; margin-bottom: 8px; }
        .gm-step p { font-size: 13px; color: var(--muted); line-height: 1.6; }
        .gm-step-line { position: absolute; top: 32px; right: -20px; width: 40px; height: 1px; background: var(--border); }

        /* MOOD */
        .gm-mood-cards { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 32px; }
        .gm-mood-card { background: rgba(8,12,16,0.7); border: 1px solid var(--border); padding: 14px 22px; border-radius: 100px; font-size: 14px; font-weight: 500; cursor: default; transition: all 0.2s; display: flex; align-items: center; gap: 10px; }
        .gm-mood-card:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-3px); }

        /* TESTIMONIALS */
        .gm-test-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 48px; }
        .gm-test-card { background: rgba(8,12,16,0.7); border: 1px solid var(--border); padding: 28px; border-radius: 12px; transition: border-color 0.3s; }
        .gm-test-card:hover { border-color: rgba(0,229,255,0.2); }
        .gm-stars { color: var(--accent2); font-size: 14px; margin-bottom: 14px; letter-spacing: 2px; }
        .gm-test-text { font-size: 14px; color: rgba(240,244,248,0.7); line-height: 1.8; margin-bottom: 20px; font-style: italic; }
        .gm-test-author { font-size: 14px; font-weight: 700; }
        .gm-test-role { font-size: 12px; color: var(--muted); margin-top: 2px; }

        /* CTA */
        .gm-cta-section { text-align: center; }
        .gm-cta-section h2 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 9vw, 100px); letter-spacing: 4px; line-height: 0.9; margin-bottom: 16px; }
        .gm-cta-section p { font-size: 16px; color: rgba(240,244,248,0.7); margin-bottom: 28px; }
        .gm-cta-section::before { content: 'GYMMIND'; position: absolute; font-family: 'Bebas Neue', sans-serif; font-size: 160px; color: rgba(255,255,255,0.02); letter-spacing: 10px; top: 50%; left: 50%; transform: translate(-50%, -50%); white-space: nowrap; pointer-events: none; }

        /* FOOTER */
        .gm-footer { border-top: 1px solid var(--border); padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; background: var(--bg); }
        .gm-footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: var(--accent); letter-spacing: 2px; }
        .gm-footer-links { display: flex; gap: 20px; }
        .gm-footer-links a { font-size: 12px; color: var(--muted); text-decoration: none; transition: color 0.2s; }
        .gm-footer-links a:hover { color: var(--text); }
        .gm-footer-copy { font-size: 12px; color: var(--muted); }

        html { scroll-behavior: smooth; }
        @keyframes gm-fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .gm-hero-content > * { animation: gm-fadeUp 0.6s ease both; }

        @media (max-width: 768px) {
          .gm-features-grid { grid-template-columns: 1fr; }
          .gm-steps { grid-template-columns: 1fr; }
          .gm-test-grid { grid-template-columns: 1fr; }
          .gm-hero-stats { gap: 24px; }
          .gm-nav-links { display: none; }
        }
      `}</style>

      <div className="gm-body">

        {/* NAV */}
        <nav className="gm-nav">
          <div className="gm-logo">GymMind AI</div>
          <div className="gm-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="gm-nav-cta">
            <a href="/login" className="gm-btn-ghost">Login</a>
            <a href="/signup" className="gm-btn-primary">Get started for free</a>
          </div>
        </nav>

        {/* HERO — hombre con tiza */}
        <div className="gm-hero">
          <img className="gm-hero-img" src={IMAGES.hero} alt="Athlete with chalk preparing to lift" />
          <div className="gm-hero-bg"></div>
          <div className="gm-hero-grid"></div>
          <div className="gm-hero-overlay"></div>
          <div className="gm-hero-content">
            <div className="gm-badge"><span className="gm-badge-dot"></span> Powered by Gemini AI</div>
            <h1>TRAIN.<br /><span className="gm-accent">EVOLVE.</span><br /><span className="gm-accent2">NO LIMITS.</span></h1>
            <p>Your personal AI fitness coach. Personalized workouts, progress tracking, and motivation whenever you need it most.</p>
            <div className="gm-hero-btns">
              <a href="/signup" className="gm-btn-lg gm-btn-accent-lg">Get started for free →</a>
              <a href="#how-it-works" className="gm-btn-lg gm-btn-outline-lg">See how it works</a>
            </div>
            <div className="gm-hero-stats">
              <div className="gm-stat"><div className="gm-stat-num">10K+</div><div className="gm-stat-label">Active users</div></div>
              <div className="gm-stat-divider"></div>
              <div className="gm-stat"><div className="gm-stat-num">50K+</div><div className="gm-stat-label">Workouts generated</div></div>
              <div className="gm-stat-divider"></div>
              <div className="gm-stat"><div className="gm-stat-num">98%</div><div className="gm-stat-label">Satisfaction rate</div></div>
            </div>
          </div>
        </div>

        {/* FEATURES — hombre con sudadera de fondo */}
        <div id="features" className="gm-img-section">
          <img className="gm-img-section-bg" src={IMAGES.features} alt="Athlete" />
          <div className="gm-img-section-overlay"></div>
          <div className="gm-img-section-content">
            <div className="gm-section-eyebrow">What GymMind AI does</div>
            <div className="gm-section-title">EVERYTHING<br />YOU NEED.</div>
            <div className="gm-section-sub">One app to train, track your emotional state, and watch your body evolve.</div>
            <div className="gm-features-grid">
              {[
                { num: "01", icon: "🏋️", title: "AI Workouts", desc: "Personalized routines generated by AI based on your fitness goal." },
                { num: "02", icon: "🧠", title: "AI Coach", desc: "Your personal coach 24/7. Messages adapted to how you feel today." },
                { num: "03", icon: "📈", title: "Progress Tracking", desc: "Log weight, count training days, and visualize your evolution." },
                { num: "04", icon: "😌", title: "Mood Check", desc: "GymMind AI adapts your experience based on your emotional state." },
                { num: "05", icon: "🥗", title: "Nutrition", desc: "Look up macros and calories. Keep a daily log aligned with your goal." },
                { num: "06", icon: "🏅", title: "Achievements", desc: "Earn badges for consistency, volume, and streaks." },
              ].map((f) => (
                <div className="gm-feature-card" key={f.num}>
                  <div className="gm-feature-num">{f.num}</div>
                  <div className="gm-feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HOW IT WORKS — red AI de fondo */}
        <div id="how-it-works" className="gm-img-section">
          <img className="gm-img-section-bg" src={IMAGES.process} alt="AI Network" />
          <div className="gm-img-section-overlay"></div>
          <div className="gm-img-section-content">
            <div className="gm-section-eyebrow">The process</div>
            <div className="gm-section-title">AS SIMPLE<br />AS THIS.</div>
            <div className="gm-steps">
              <div className="gm-step">
                <div className="gm-step-num">01</div>
                <h3>Create your profile</h3>
                <p>Enter your weight, height and fitness goal. GymMind AI learns about you from day one.</p>
                <div className="gm-step-line"></div>
              </div>
              <div className="gm-step">
                <div className="gm-step-num">02</div>
                <h3>Get your AI workout</h3>
                <p>AI generates a personalized routine. Each exercise with name, muscle group and instructions.</p>
                <div className="gm-step-line"></div>
              </div>
              <div className="gm-step">
                <div className="gm-step-num">03</div>
                <h3>Track and evolve</h3>
                <p>Log weights, mark exercises done, and prove with real data that your effort pays off.</p>
              </div>
            </div>
          </div>
        </div>

        {/* MOOD — mujer gimnasio de fondo */}
        <div className="gm-img-section" style={{ textAlign: "center" }}>
          <img className="gm-img-section-bg" src={IMAGES.mood} alt="Woman at gym" />
          <div className="gm-img-section-overlay"></div>
          <div className="gm-img-section-content">
            <div className="gm-section-eyebrow">Daily Mood Check</div>
            <div className="gm-section-title">HOW ARE YOU<br /><span className="gm-accent">FEELING TODAY?</span></div>
            <p style={{ fontSize: "15px", color: "var(--muted)", maxWidth: "440px", margin: "0 auto", lineHeight: "1.7" }}>
              Your AI Coach adapts to your emotional state. Not every day is the same — your workout shouldn't be either.
            </p>
            <div className="gm-mood-cards">
              {[
                { emoji: "🔥", label: "Full of energy" },
                { emoji: "😊", label: "Feeling good" },
                { emoji: "😐", label: "Just okay" },
                { emoji: "😴", label: "Tired" },
                { emoji: "😔", label: "Unmotivated" },
              ].map((m) => (
                <div className="gm-mood-card" key={m.label}>
                  <span>{m.emoji}</span> {m.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TESTIMONIALS — pull-up de fondo */}
        <div className="gm-img-section">
          <img className="gm-img-section-bg" src={IMAGES.results} alt="Pull-up" />
          <div className="gm-img-section-overlay"></div>
          <div className="gm-img-section-content">
            <div className="gm-section-eyebrow">What they say</div>
            <div className="gm-section-title">REAL<br />RESULTS.</div>
            <div className="gm-test-grid">
              {[
                { text: "I hadn't been consistent at the gym for months. GymMind AI gave me structure and motivation. I lost 8 kg in 3 months.", author: "Carlos M.", role: "Fat loss · 3 months" },
                { text: "The daily Mood Check is incredible. When I arrive exhausted, the AI Coach gives me exactly what I need to hear.", author: "Daniela R.", role: "Body recomposition · 5 months" },
                { text: "The AI-generated routines are brutal. Every week they're different and always aligned with my muscle-building goal.", author: "Miguel A.", role: "Muscle gain · 4 months" },
              ].map((t) => (
                <div className="gm-test-card" key={t.author}>
                  <div className="gm-stars">★★★★★</div>
                  <div className="gm-test-text">"{t.text}"</div>
                  <div className="gm-test-author">{t.author}</div>
                  <div className="gm-test-role">{t.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA — hombre levantando barra */}
        <div id="pricing" className="gm-img-section gm-cta-section" style={{ textAlign: "center" }}>
          <img className="gm-img-section-bg" src={IMAGES.cta} alt="Athlete lifting barbell" />
          <div className="gm-img-section-overlay"></div>
          <div className="gm-img-section-content">
            <div className="gm-section-eyebrow">Start today</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 9vw, 100px)", letterSpacing: "4px", lineHeight: "0.9", marginBottom: "16px" }}>
              BUILD.<br /><span className="gm-accent">START.</span><br /><span className="gm-accent2">TODAY.</span>
            </h2>
            <p style={{ fontSize: "16px", color: "rgba(240,244,248,0.7)", marginBottom: "28px" }}>
              Your transformation begins with a single step. Create your free account.
            </p>
            <a href="/signup" className="gm-btn-lg gm-btn-accent-lg">Create free account →</a>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="gm-footer">
          <div className="gm-footer-logo">GymMind AI</div>
          <div className="gm-footer-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="gm-footer-copy">© 2025 GymMind AI</div>
        </footer>

      </div>
    </>
  );
};

export default Home; 