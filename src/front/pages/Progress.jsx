import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Progress = () => {
  const navigate = useNavigate();
  const [weightInput, setWeightInput] = useState("");
  const [dateInput, setDateInput] = useState("2026-05-20");
  const [showSuccess, setShowSuccess] = useState(false);
  const [logs, setLogs] = useState([
    { date: "Today", weight: "62.0 kg", change: "↓ -0.2", positive: true },
    { date: "May 16", weight: "62.2 kg", change: "↓ -0.3", positive: true },
    { date: "May 15", weight: "62.5 kg", change: "↓ -0.3", positive: true },
    { date: "May 13", weight: "62.8 kg", change: "↓ -0.4", positive: true },
    { date: "May 9", weight: "63.2 kg", change: "↓ -0.6", positive: true },
    { date: "May 5", weight: "63.8 kg", change: "↓ -0.6", positive: true },
    { date: "May 1", weight: "64.4 kg", change: "Start", positive: null },
  ]);

  const weekDays = [
    { name: "Mon", trained: true },
    { name: "Tue", trained: true },
    { name: "Wed", trained: true },
    { name: "Thu", trained: false },
    { name: "Fri", today: true },
    { name: "Sat", trained: false },
    { name: "Sun", trained: false },
  ];

  const handleLogWeight = () => {
    if (!weightInput) return;
    setShowSuccess(true);
    setLogs([{ date: "Today", weight: `${weightInput} kg`, change: "New entry", positive: null }, ...logs]);
    setWeightInput("");
    setTimeout(() => setShowSuccess(false), 2500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --bg: #080c10; --bg2: #0d1318; --accent: #00e5ff; --accent2: #00ff88;
          --text: #f0f4f8; --muted: #6b7c8f; --card: rgba(255,255,255,0.04); --border: rgba(255,255,255,0.08);
        }

        .pr-body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; }

        /* NAV */
        .pr-nav { display: flex; align-items: center; height: 56px; background: rgba(8,12,16,0.97); border-bottom: 1px solid var(--border); padding: 0 20px; width: 100%; }
        .pr-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 2px; color: var(--accent); white-space: nowrap; flex-shrink: 0; margin-right: 24px; }
        .pr-nav-links { display: flex; gap: 24px; flex: 1; }
        .pr-nav-links a { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; white-space: nowrap; transition: color 0.2s; }
        .pr-nav-links a.active { color: var(--accent); }
        .pr-nav-cta { display: flex; gap: 8px; align-items: center; flex-shrink: 0; margin-left: 24px; }
        .pr-btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text); padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .pr-btn-danger { background: transparent; border: 1px solid rgba(255,80,80,0.3); color: #ff6b6b; padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }

        /* PAGE */
        .pr-page { flex: 1; padding: 28px 24px; max-width: 1000px; margin: 0 auto; width: 100%; }
        .pr-section-label { font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); margin-bottom: 4px; }
        .pr-page-title { font-family: 'Bebas Neue', sans-serif; font-size: 36px; letter-spacing: 2px; margin-bottom: 24px; }

        /* STATS */
        .pr-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .pr-stat-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; }
        .pr-stat-icon { font-size: 18px; margin-bottom: 6px; }
        .pr-stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--accent); letter-spacing: 1px; }
        .pr-stat-num.green { color: var(--accent2); }
        .pr-stat-label { font-size: 11px; color: var(--muted); margin-top: 2px; }

        /* CARD */
        .pr-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .pr-card-title { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 1px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }

        /* FORM */
        .pr-log-form { display: flex; gap: 10px; align-items: flex-end; }
        .pr-form-group { flex: 1; }
        .pr-form-label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px; font-weight: 500; }
        .pr-form-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; font-size: 14px; color: var(--text); font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; }
        .pr-form-input:focus { border-color: var(--accent); }
        .pr-btn-accent { background: var(--accent); color: #000; padding: 9px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; white-space: nowrap; transition: opacity 0.2s; }
        .pr-btn-accent:hover { opacity: 0.85; }
        .pr-success-msg { background: rgba(0,255,136,0.08); border: 1px solid rgba(0,255,136,0.2); border-radius: 8px; padding: 8px 14px; font-size: 13px; color: var(--accent2); margin-top: 10px; }

        /* CHART */
        .pr-chart-wrap { position: relative; height: 160px; margin-bottom: 8px; }
        .pr-chart { width: 100%; height: 100%; }
        .pr-chart-labels { display: flex; justify-content: space-between; font-size: 10px; color: var(--muted); margin-top: 4px; }

        /* TABLE */
        .pr-log-table { width: 100%; border-collapse: collapse; }
        .pr-log-table th { font-size: 11px; color: var(--muted); font-weight: 500; text-align: left; padding: 8px 0; border-bottom: 1px solid var(--border); letter-spacing: 0.5px; text-transform: uppercase; }
        .pr-log-table td { font-size: 13px; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .pr-log-table tr:last-child td { border-bottom: none; }
        .pr-weight-val { color: var(--accent); font-weight: 600; }
        .pr-change-pos { color: var(--accent2); font-size: 12px; }
        .pr-change-neutral { color: var(--muted); font-size: 12px; }

        /* WEEK */
        .pr-week-row { display: flex; gap: 6px; }
        .pr-day-chip { flex: 1; text-align: center; padding: 10px 4px; border-radius: 8px; border: 1px solid var(--border); font-size: 11px; }
        .pr-day-chip.trained { background: rgba(0,255,136,0.08); border-color: rgba(0,255,136,0.3); color: var(--accent2); }
        .pr-day-chip.today { border-color: var(--accent); color: var(--accent); }
        .pr-day-name { font-weight: 600; margin-bottom: 2px; }
        .pr-day-status { font-size: 10px; }

        .pr-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }

        @keyframes pr-fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .pr-page > * { animation: pr-fadeUp 0.5s ease both; }
      `}</style>

      <div className="pr-body">

        {/* NAVBAR */}
        <nav className="pr-nav">
          <div className="pr-logo">GymMind AI</div>
          <div className="pr-nav-links">
            <a href="/dashboard">Dashboard</a>
            <a href="/workout">My Workout</a>
            <a href="/moodcheck">Mood Check</a>
            <a href="/progress" className="active">Progress</a>
            <a href="/nutrition">Nutrition</a>
            <a href="/profile">Profile</a>
          </div>
          <div className="pr-nav-cta">
            <button className="pr-btn-ghost">Edit profile</button>
            <button
              className="pr-btn-danger"
              onClick={() => {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                navigate("/login");
              }}
            >
              Sign out
            </button>
          </div>
        </nav>

        <div className="pr-page">

          <div className="pr-section-label">Your evolution</div>
          <div className="pr-page-title">PROGRESS TRACKING</div>

          {/* STATS */}
          <div className="pr-stats-row">
            <div className="pr-stat-card">
              <div className="pr-stat-icon">⚖️</div>
              <div className="pr-stat-num">62.0</div>
              <div className="pr-stat-label">Current weight (kg)</div>
            </div>
            <div className="pr-stat-card">
              <div className="pr-stat-icon">📉</div>
              <div className="pr-stat-num green">-2.4</div>
              <div className="pr-stat-label">kg lost this month</div>
            </div>
            <div className="pr-stat-card">
              <div className="pr-stat-icon">🔥</div>
              <div className="pr-stat-num">12</div>
              <div className="pr-stat-label">Days trained this month</div>
            </div>
            <div className="pr-stat-card">
              <div className="pr-stat-icon">📅</div>
              <div className="pr-stat-num">3</div>
              <div className="pr-stat-label">Days trained this week</div>
            </div>
          </div>

          {/* LOG WEIGHT */}
          <div className="pr-card">
            <div className="pr-card-title">⚖️ Log today's weight</div>
            <div className="pr-log-form">
              <div className="pr-form-group">
                <label className="pr-form-label">Weight (kg)</label>
                <input
                  className="pr-form-input"
                  type="number"
                  placeholder="e.g. 62.5"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                />
              </div>
              <div className="pr-form-group">
                <label className="pr-form-label">Date</label>
                <input
                  className="pr-form-input"
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                />
              </div>
              <button className="pr-btn-accent" onClick={handleLogWeight}>Save</button>
            </div>
            {showSuccess && <div className="pr-success-msg">✅ Weight logged successfully!</div>}
          </div>

          <div className="pr-grid-2">

            {/* CHART */}
            <div className="pr-card">
              <div className="pr-card-title">📈 Weight over time</div>
              <div className="pr-chart-wrap">
                <svg className="pr-chart" viewBox="0 0 400 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="prChartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <line x1="0" y1="75" x2="400" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <path d="M0,110 C40,105 80,100 120,90 C160,80 200,70 240,65 C280,60 320,50 360,40 L400,35 L400,150 L0,150 Z" fill="url(#prChartGrad)" />
                  <path d="M0,110 C40,105 80,100 120,90 C160,80 200,70 240,65 C280,60 320,50 360,40 L400,35" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="0" cy="110" r="4" fill="#00e5ff" />
                  <circle cx="80" cy="100" r="4" fill="#00e5ff" />
                  <circle cx="160" cy="80" r="4" fill="#00e5ff" />
                  <circle cx="240" cy="65" r="4" fill="#00e5ff" />
                  <circle cx="320" cy="50" r="4" fill="#00e5ff" />
                  <circle cx="400" cy="35" r="5" fill="#00ff88" />
                  <text x="0" y="125" fontSize="9" fill="#6b7c8f">64.4</text>
                  <text x="78" y="95" fontSize="9" fill="#6b7c8f">63.8</text>
                  <text x="158" y="75" fontSize="9" fill="#6b7c8f">63.2</text>
                  <text x="238" y="60" fontSize="9" fill="#6b7c8f">62.8</text>
                  <text x="318" y="45" fontSize="9" fill="#6b7c8f">62.4</text>
                  <text x="378" y="30" fontSize="9" fill="#00ff88">62.0</text>
                </svg>
              </div>
              <div className="pr-chart-labels">
                <span>May 1</span><span>May 5</span><span>May 9</span><span>May 13</span><span>May 16</span><span>Today</span>
              </div>
            </div>

            {/* WEIGHT LOG TABLE */}
            <div className="pr-card">
              <div className="pr-card-title">📋 Weight log</div>
              <table className="pr-log-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Weight</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i}>
                      <td>{log.date}</td>
                      <td className="pr-weight-val">{log.weight}</td>
                      <td className={log.positive ? "pr-change-pos" : "pr-change-neutral"}>{log.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* WEEK TRACKER */}
          <div className="pr-card">
            <div className="pr-card-title">📅 This week's training</div>
            <div className="pr-week-row">
              {weekDays.map((day) => (
                <div key={day.name} className={`pr-day-chip ${day.trained ? "trained" : ""} ${day.today ? "today" : ""}`}>
                  <div className="pr-day-name">{day.name}</div>
                  <div className="pr-day-status">{day.trained ? "✅" : day.today ? "Today" : "—"}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Progress;
