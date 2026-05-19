import React from "react";

export const Home = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --bg: #080c10; --bg2: #0d1318; --accent: #00e5ff; --accent2: #00ff88;
          --text: #f0f4f8; --muted: #6b7c8f; --card: rgba(255,255,255,0.04); --border: rgba(255,255,255,0.08);
        }

        .gm-body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

        /* NAV */
        .gm-nav {
          display: flex; align-items: center;
          height: 56px; background: rgba(8,12,16,0.97);
          border-bottom: 1px solid var(--border);
          padding: 0 20px; width: 100%;
        }
        .gm-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 2px; color: var(--accent); white-space: nowrap; flex-shrink: 0; margin-right: 24px; }
        .gm-nav-links { display: flex; gap: 24px; flex: 1; }
        .gm-nav-links a { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; white-space: nowrap; transition: color 0.2s; }
        .gm-nav-links a:hover { color: var(--text); }
        .gm-nav-cta { display: flex; gap: 8px; align-items: center; flex-shrink: 0; margin-left: 24px; }
        .gm-btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text); padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s, color 0.2s; }
        .gm-btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
        .gm-btn-primary-nav { background: var(--accent); color: #000; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; transition: opacity 0.2s; }
        .gm-btn-primary-nav:hover { opacity: 0.85; }

        /* HERO */
        .gm-hero { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 48px 48px 40px; position: relative; overflow: hidden; }
        .gm-hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,229,255,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,255,136,0.06) 0%, transparent 60%); }
        .gm-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size: 60px 60px; maskImage: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%); }
        .gm-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,229,255,0.1); border: 1px solid rgba(0,229,255,0.3); color: var(--accent); padding: 5px 14px; border-radius: 100px; font-size: 13px; font-weight: 500; margin-bottom: 14px; position: relative; z-index: 1; }
        .gm-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: gm-pulse 2s infinite; }
        @keyframes gm-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .gm-hero h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(56px, 10vw, 110px); line-height: 0.92; letter-spacing: 3px; margin-bottom: 16px; position: relative; z-index: 1; }
        .gm-accent { color: var(--accent); }
        .gm-accent2 { color: var(--accent2); }
        .gm-hero p { max-width: 480px; font-size: 16px; color: var(--muted); line-height: 1.6; margin-bottom: 24px; position: relative; z-index: 1; }
        .gm-hero-btns { display: flex; gap: 12px; justify-content: center; position: relative; z-index: 1; margin-bottom: 36px; }
        .gm-btn-lg { padding: 12px 28px; font-size: 15px; font-weight: 600; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .gm-btn-accent-lg { background: var(--accent); color: #000; border: none; transition: transform 0.2s; }
        .gm-btn-accent-lg:hover { transform: translateY(-2px); }
        .gm-btn-outline-lg { background: transparent; border: 1px solid var(--border); color: var(--text); }
        .gm-hero-stats { display: flex; gap: 48px; position: relative; z-index: 1; }
        .gm-stat { text-align: center; }
        .gm-stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 36px; color: var(--accent); letter-spacing: 2px; }
        .gm-stat-label { font-size: 12px; color: var(--muted); margin-top: 2px; }

        /* FEATURES */
        .gm-features-wrap { background: var(--bg); padding: 40px 32px; max-width: 1200px; margin: 0 auto; }
        .gm-section-label { font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; }
        .gm-section-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(36px, 5vw, 64px); line-height: 1; letter-spacing: 2px; margin-bottom: 12px; }
        .gm-section-sub { font-size: 15px; color: var(--muted); max-width: 500px; line-height: 1.6; }
        .gm-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-top: 32px; }
        .gm-feature-card { background: var(--card); border: 1px solid var(--border); padding: 28px 24px; position: relative; overflow: hidden; transition: background 0.3s; }
        .gm-feature-card:hover { background: rgba(255,255,255,0.07); }
        .gm-feature-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--accent), transparent); opacity: 0; transition: opacity 0.3s; }
        .gm-feature-card:hover::before { opacity: 1; }
        .gm-feature-icon { font-size: 26px; margin-bottom: 12px; }
        .gm-feature-num { font-family: 'Bebas Neue', sans-serif; font-size: 52px; color: rgba(255,255,255,0.04); position: absolute; top: 10px; right: 16px; }
        .gm-feature-card h3 { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 1px; margin-bottom: 8px; }
        .gm-feature-card p { font-size: 13px; color: var(--muted); line-height: 1.6; }

        /* HOW IT WORKS */
        .gm-how-section { background: var(--bg2); padding: 48px 0; }
        .gm-how-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
        .gm-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-top: 32px; }
        .gm-step { position: relative; }
        .gm-step-num { font-family: 'Bebas Neue', sans-serif; font-size: 64px; color: rgba(0,229,255,0.08); line-height: 1; margin-bottom: 4px; }
        .gm-step h3 { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 1px; margin-bottom: 8px; }
        .gm-step p { font-size: 13px; color: var(--muted); line-height: 1.6; }
        .gm-step-line { position: absolute; top: 32px; right: -20px; width: 40px; height: 1px; background: var(--border); }

        /* MOOD */
        .gm-mood-section { text-align: center; padding: 48px 32px; }
        .gm-mood-cards { display: flex; gap: 10px; justify-content: center; margin-top: 28px; flex-wrap: wrap; }
        .gm-mood-card { background: var(--card); border: 1px solid var(--border); padding: 14px 20px; border-radius: 12px; font-size: 13px; font-weight: 500; cursor: default; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .gm-mood-card:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-3px); }
        .gm-mood-emoji { font-size: 20px; }

        /* TESTIMONIALS */
        .gm-testimonials { background: var(--bg2); padding: 48px 0; }
        .gm-test-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
        .gm-test-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 32px; }
        .gm-test-card { background: var(--card); border: 1px solid var(--border); padding: 22px; border-radius: 4px; }
        .gm-test-text { font-size: 13px; color: var(--muted); line-height: 1.7; margin-bottom: 14px; font-style: italic; }
        .gm-test-author { font-size: 13px; font-weight: 600; }
        .gm-test-role { font-size: 12px; color: var(--muted); }
        .gm-stars { color: var(--accent2); font-size: 12px; margin-bottom: 10px; }

        /* CTA */
        .gm-cta-section { text-align: center; padding: 64px 48px; background: linear-gradient(180deg, var(--bg) 0%, rgba(0,229,255,0.04) 50%, var(--bg) 100%); position: relative; overflow: hidden; }
        .gm-cta-section::before { content: 'GYMMIND'; position: absolute; font-family: 'Bebas Neue', sans-serif; font-size: 160px; color: rgba(255,255,255,0.02); letter-spacing: 10px; top: 50%; left: 50%; transform: translate(-50%, -50%); white-space: nowrap; }
        .gm-cta-section h2 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(44px, 7vw, 84px); letter-spacing: 3px; margin-bottom: 14px; position: relative; }
        .gm-cta-section p { font-size: 16px; color: var(--muted); margin-bottom: 28px; position: relative; }

        /* FOOTER */
        .gm-footer { border-top: 1px solid var(--border); padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; }
        .gm-footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: var(--accent); letter-spacing: 2px; }
        .gm-footer-links { display: flex; gap: 20px; }
        .gm-footer-links a { font-size: 12px; color: var(--muted); text-decoration: none; }
        .gm-footer-copy { font-size: 12px; color: var(--muted); }

        @keyframes gm-fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .gm-hero > * { animation: gm-fadeUp 0.6s ease both; }
      `}</style>

      <div className="gm-body">

        {/* NAVBAR */}
        <nav className="gm-nav">
          <div className="gm-logo">GymMind AI</div>
          <div className="gm-nav-links">
            <a href="#">Features</a>
            <a href="#">How it works</a>
            <a href="#">Pricing</a>
          </div>
          <div className="gm-nav-cta">
            <button className="gm-btn-ghost">Login</button>
            <button className="gm-btn-primary-nav">Get started free</button>
          </div>
        </nav>

        {/* HERO */}
        <div className="gm-hero">
          <div className="gm-hero-bg"></div>
          <div className="gm-hero-grid"></div>
          <div className="gm-badge"><span className="gm-badge-dot"></span> Powered by OpenAI</div>
          <h1>TRAIN.<br /><span className="gm-accent">EVOLVE.</span><br /><span className="gm-accent2">NO LIMITS.</span></h1>
          <p>Your personal AI fitness coach. Personalized workouts, progress tracking, and motivation whenever you need it most.</p>
          <div className="gm-hero-btns">
            <button className="gm-btn-lg gm-btn-accent-lg">Get started free</button>
            <button className="gm-btn-lg gm-btn-outline-lg">See how it works</button>
          </div>
          <div className="gm-hero-stats">
            <div className="gm-stat"><div className="gm-stat-num">10K+</div><div className="gm-stat-label">Active users</div></div>
            <div className="gm-stat"><div className="gm-stat-num">50K+</div><div className="gm-stat-label">Workouts generated</div></div>
            <div className="gm-stat"><div className="gm-stat-num">98%</div><div className="gm-stat-label">Satisfaction rate</div></div>
          </div>
        </div>

        {/* FEATURES */}
        <div className="gm-features-wrap">
          <div className="gm-section-label">What GymMind AI does</div>
          <div className="gm-section-title">EVERYTHING<br />YOU NEED.</div>
          <div className="gm-section-sub">One app to train, track your emotional state, and watch your body evolve.</div>
          <div className="gm-features-grid">
            {[
              { num: "01", icon: "🏋️", title: "AI Workouts", desc: "Personalized routines generated by AI based on your fitness goal." },
              { num: "02", icon: "🧠", title: "AI Coach", desc: "Your personal coach 24/7. Messages adapted to how you feel today." },
              { num: "03", icon: "📈", title: "Progress Tracking", desc: "Log weight, count training days, and visualize your evolution." },
              { num: "04", icon: "😌", title: "Mood Check", desc: "GymMind AI adapts your experience based on your emotional state." },
              { num: "05", icon: "🥗", title: "Nutrition", desc: "Look up macros and calories. Keep a daily log aligned with your goal." },
              { num: "06", icon: "🎯", title: "Custom Profile", desc: "Set your goal and let GymMind AI build an experience just for you." },
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

        {/* HOW IT WORKS */}
        <div className="gm-how-section">
          <div className="gm-how-inner">
            <div className="gm-section-label">The process</div>
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
                <h3>Get your workout</h3>
                <p>AI generates a personalized routine. Each exercise with name, muscle group and image.</p>
                <div className="gm-step-line"></div>
              </div>
              <div className="gm-step">
                <div className="gm-step-num">03</div>
                <h3>Track and evolve</h3>
                <p>Mark exercises, log your weight, and prove with real data that your effort pays off.</p>
              </div>
            </div>
          </div>
        </div>

        {/* MOOD CHECK */}
        <div className="gm-mood-section">
          <div className="gm-section-label">Daily Mood Check</div>
          <div className="gm-section-title">HOW ARE YOU<br />FEELING TODAY?</div>
          <p style={{ color: "var(--muted)", fontSize: "15px", maxWidth: "440px", margin: "0 auto", lineHeight: "1.6" }}>
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
                <span className="gm-mood-emoji">{m.emoji}</span> {m.label}
              </div>
            ))}
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="gm-testimonials">
          <div className="gm-test-inner">
            <div className="gm-section-label">What they say</div>
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

        {/* CTA */}
        <div className="gm-cta-section">
          <h2>START<br /><span className="gm-accent">TODAY.</span></h2>
          <p>Your transformation begins with a single step. Create your free account.</p>
          <button className="gm-btn-lg gm-btn-accent-lg">Create free account →</button>
        </div>

        {/* FOOTER */}
        <footer className="gm-footer">
          <div className="gm-footer-logo">GymMind AI</div>
          <div className="gm-footer-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Contact</a>
          </div>
          <div className="gm-footer-copy">© 2025 GymMind AI</div>
        </footer>

      </div>
    </>
  );
};

export { Home }; 