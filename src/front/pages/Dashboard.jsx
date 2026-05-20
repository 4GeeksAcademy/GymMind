import React, { useState } from "react";

export const Dashboard = () => {
  const [selectedMood, setSelectedMood] = useState("good");
  const [aiMessage, setAiMessage] = useState("Feeling good is the perfect foundation. Stay focused and consistent — every rep today brings you closer to your goal. Let's make it count!");

  const moods = [
    { id: "great", emoji: "🔥", label: "Great", message: "You're on fire today! Your AI Coach has an intense workout ready. Channel that energy and go all in — today is your day to set a new personal record!" },
    { id: "good", emoji: "😊", label: "Good", message: "Feeling good is the perfect foundation. Stay focused and consistent — every rep today brings you closer to your goal. Let's make it count!" },
    { id: "okay", emoji: "😐", label: "Okay", message: "Even on okay days, showing up is what separates those who reach their goals from those who don't. A moderate session today will keep your momentum going." },
    { id: "tired", emoji: "😴", label: "Tired", message: "Rest is part of the process. Consider a light recovery session or stretching today. Pushing through exhaustion can lead to injury — listen to your body." },
    { id: "low", emoji: "😔", label: "Low", message: "It's okay to have off days — everyone does. Your AI Coach believes in you. Start with just 5 minutes. Once you begin, momentum will carry you through." },
  ];

  const weekDays = [
    { name: "Mon", trained: true },
    { name: "Tue", trained: true },
    { name: "Wed", trained: true },
    { name: "Thu", trained: false },
    { name: "Fri", today: true },
    { name: "Sat", trained: false },
    { name: "Sun", trained: false },
  ];

  const exercises = [
    { icon: "🦵", name: "Barbell Squat", muscle: "Quadriceps", sets: "4 sets × 10 reps", done: true },
    { icon: "🫁", name: "Romanian Deadlift", muscle: "Hamstrings", sets: "3 sets × 12 reps", done: true },
    { icon: "🦴", name: "Leg Press", muscle: "Quadriceps", sets: "4 sets × 12 reps", done: false },
    { icon: "💪", name: "Calf Raises", muscle: "Calves", sets: "3 sets × 15 reps", done: false },
  ];

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.id);
    setAiMessage(mood.message);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --bg: #080c10; --bg2: #0d1318; --accent: #00e5ff; --accent2: #00ff88;
          --text: #f0f4f8; --muted: #6b7c8f; --card: rgba(255,255,255,0.04); --border: rgba(255,255,255,0.08);
        }

        .db-body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; }

        /* NAV */
        .db-nav { display: flex; align-items: center; height: 56px; background: rgba(8,12,16,0.97); border-bottom: 1px solid var(--border); padding: 0 20px; width: 100%; }
        .db-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 2px; color: var(--accent); white-space: nowrap; flex-shrink: 0; margin-right: 24px; }
        .db-nav-links { display: flex; gap: 24px; flex: 1; }
        .db-nav-links a { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; white-space: nowrap; transition: color 0.2s; }
        .db-nav-links a.active { color: var(--accent); }
        .db-nav-cta { display: flex; gap: 8px; align-items: center; flex-shrink: 0; margin-left: 24px; }
        .db-btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text); padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .db-btn-danger { background: transparent; border: 1px solid rgba(255,80,80,0.3); color: #ff6b6b; padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }

        /* PAGE */
        .db-page { flex: 1; padding: 28px 24px; max-width: 1000px; margin: 0 auto; width: 100%; }
        .db-section-label { font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); margin-bottom: 4px; }
        .db-page-title { font-family: 'Bebas Neue', sans-serif; font-size: 36px; letter-spacing: 2px; margin-bottom: 24px; }

        /* STATS */
        .db-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .db-stat-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; }
        .db-stat-icon { font-size: 18px; margin-bottom: 6px; }
        .db-stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--accent); letter-spacing: 1px; }
        .db-stat-num.green { color: var(--accent2); }
        .db-stat-label { font-size: 11px; color: var(--muted); margin-top: 2px; }

        /* CARD */
        .db-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .db-card-title { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 1px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }

        /* WEEK */
        .db-week-row { display: flex; gap: 6px; }
        .db-day-chip { flex: 1; text-align: center; padding: 10px 4px; border-radius: 8px; border: 1px solid var(--border); font-size: 11px; }
        .db-day-chip.trained { background: rgba(0,255,136,0.08); border-color: rgba(0,255,136,0.3); color: var(--accent2); }
        .db-day-chip.today { border-color: var(--accent); color: var(--accent); }
        .db-day-name { font-weight: 600; margin-bottom: 2px; }
        .db-day-status { font-size: 10px; }

        /* GRID */
        .db-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }

        /* MOOD */
        .db-mood-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
        .db-mood-chip { background: var(--card); border: 1px solid var(--border); padding: 8px 14px; border-radius: 20px; font-size: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; color: var(--text); }
        .db-mood-chip:hover { border-color: var(--accent); color: var(--accent); }
        .db-mood-chip.selected { border-color: var(--accent); background: rgba(0,229,255,0.08); color: var(--accent); }
        .db-ai-message { background: rgba(0,229,255,0.06); border: 1px solid rgba(0,229,255,0.2); border-radius: 10px; padding: 14px; font-size: 13px; color: var(--text); line-height: 1.6; }
        .db-ai-badge { font-size: 11px; color: var(--accent); font-weight: 600; margin-bottom: 6px; }

        /* EXERCISES */
        .db-exercise-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .db-exercise-row:last-child { border-bottom: none; }
        .db-exercise-img { width: 36px; height: 36px; border-radius: 6px; background: rgba(0,229,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .db-exercise-name { font-size: 13px; font-weight: 500; }
        .db-exercise-name.done { text-decoration: line-through; color: var(--muted); }
        .db-exercise-muscle { font-size: 11px; color: var(--muted); }
        .db-exercise-check { margin-left: auto; accent-color: var(--accent); width: 16px; height: 16px; cursor: pointer; }
        .db-btn-sm { background: var(--accent); color: #000; padding: 5px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; }
        .db-btn-sm-outline { background: transparent; border: 1px solid var(--border); color: var(--text); padding: 5px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; }

        /* PROGRESS */
        .db-progress-entry { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
        .db-progress-entry:last-child { border-bottom: none; }
        .db-progress-date { color: var(--muted); }
        .db-progress-weight { color: var(--accent); font-weight: 600; }

        @keyframes db-fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .db-stats-row { animation: db-fadeUp 0.4s ease both; }
        .db-grid-2 { animation: db-fadeUp 0.4s ease 0.1s both; }
      `}</style>

      <div className="db-body">

        {/* NAVBAR */}
        <nav className="db-nav">
          <div className="db-logo">GymMind AI</div>
          <div className="db-nav-links">
            <a href="#" className="active">Dashboard</a>
            <a href="#">My Workout</a>
            <a href="#">Progress</a>
            <a href="#">Profile</a>
          </div>
          <div className="db-nav-cta">
            <button className="db-btn-ghost">Edit profile</button>
            <button className="db-btn-danger">Sign out</button>
          </div>
        </nav>

        <div className="db-page">

          <div className="db-section-label">Welcome back</div>
          <div className="db-page-title">GOOD MORNING, JESSICA 👋</div>

          {/* STATS */}
          <div className="db-stats-row">
            <div className="db-stat-card">
              <div className="db-stat-icon">🔥</div>
              <div className="db-stat-num">12</div>
              <div className="db-stat-label">Days trained this month</div>
            </div>
            <div className="db-stat-card">
              <div className="db-stat-icon">📉</div>
              <div className="db-stat-num green">-2.4</div>
              <div className="db-stat-label">kg lost this month</div>
            </div>
            <div className="db-stat-card">
              <div className="db-stat-icon">🏋️</div>
              <div className="db-stat-num">5</div>
              <div className="db-stat-label">Workouts this week</div>
            </div>
            <div className="db-stat-card">
              <div className="db-stat-icon">🎯</div>
              <div className="db-stat-num" style={{ fontSize: "18px", paddingTop: "4px" }}>Gain muscle</div>
              <div className="db-stat-label">Current goal</div>
            </div>
          </div>

          {/* WEEK TRACKER */}
          <div className="db-card">
            <div className="db-card-title">📅 This week</div>
            <div className="db-week-row">
              {weekDays.map((day) => (
                <div key={day.name} className={`db-day-chip ${day.trained ? "trained" : ""} ${day.today ? "today" : ""}`}>
                  <div className="db-day-name">{day.name}</div>
                  <div className="db-day-status">{day.trained ? "✅" : day.today ? "Today" : "—"}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="db-grid-2">

            {/* MOOD CHECK */}
            <div className="db-card">
              <div className="db-card-title">😌 Daily Mood Check</div>
              <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "12px" }}>How are you feeling today?</p>
              <div className="db-mood-row">
                {moods.map((mood) => (
                  <div
                    key={mood.id}
                    className={`db-mood-chip ${selectedMood === mood.id ? "selected" : ""}`}
                    onClick={() => handleMoodSelect(mood)}
                  >
                    {mood.emoji} {mood.label}
                  </div>
                ))}
              </div>
              <div className="db-ai-message">
                <div className="db-ai-badge">🤖 AI Coach</div>
                {aiMessage}
              </div>
            </div>

            {/* TODAY'S WORKOUT */}
            <div className="db-card">
              <div className="db-card-title">
                <span>🏋️ Today's Workout</span>
                <button className="db-btn-sm">Start workout</button>
              </div>
              {exercises.map((ex) => (
                <div key={ex.name} className="db-exercise-row">
                  <div className="db-exercise-img">{ex.icon}</div>
                  <div>
                    <div className={`db-exercise-name ${ex.done ? "done" : ""}`}>{ex.name}</div>
                    <div className="db-exercise-muscle">{ex.muscle} · {ex.sets}</div>
                  </div>
                  <input type="checkbox" className="db-exercise-check" defaultChecked={ex.done} />
                </div>
              ))}
            </div>

          </div>

          {/* PROGRESS MINI */}
          <div className="db-card">
            <div className="db-card-title">
              <span>📈 Recent Progress</span>
              <button className="db-btn-sm-outline">View all</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                {[
                  { date: "Today", weight: "62.0 kg" },
                  { date: "Yesterday", weight: "62.2 kg" },
                  { date: "3 days ago", weight: "62.5 kg" },
                  { date: "4 days ago", weight: "62.8 kg" },
                ].map((entry) => (
                  <div key={entry.date} className="db-progress-entry">
                    <span className="db-progress-date">{entry.date}</span>
                    <span className="db-progress-weight">{entry.weight}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "rgba(0,229,255,0.04)", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "40px", color: "var(--accent2)" }}>-0.8</div>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>kg lost this week</div>
                <div style={{ fontSize: "11px", color: "var(--accent2)", marginTop: "4px" }}>↓ On track with your goal</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard; 
