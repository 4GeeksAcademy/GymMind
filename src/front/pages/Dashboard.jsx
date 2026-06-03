import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { MobileNavbar } from "../components/MobileNavbar";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  const [selectedMood, setSelectedMood] = useState(null);
  const [aiMessage, setAiMessage] = useState(null);
  const [progressLogs, setProgressLogs] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = store.user || JSON.parse(sessionStorage.getItem("user") || "{}");
  const token = store.token || sessionStorage.getItem("token");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token]);

  useEffect(() => {
    if (!user?.id || !token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [progressRes, workoutRes] = await Promise.all([
          fetch(`${backendUrl}/api/progress/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${backendUrl}/api/workout/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (progressRes.ok) setProgressLogs(await progressRes.json());
        if (workoutRes.ok) setWorkouts(await workoutRes.json());
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, token]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    dispatch({ type: "logout" });
    navigate("/");
  };

  const moods = [
    { id: "great", emoji: "🔥", label: "Great", message: "You're on fire today! Your AI Coach has an intense workout ready. Channel that energy and go all in!" },
    { id: "good", emoji: "😊", label: "Good", message: "Feeling good is the perfect foundation. Stay focused and consistent — every rep brings you closer to your goal." },
    { id: "okay", emoji: "😐", label: "Okay", message: "Even on okay days, showing up is what separates those who reach their goals. Keep going!" },
    { id: "tired", emoji: "😴", label: "Tired", message: "Rest is part of the process. Consider a light recovery session today. Listen to your body." },
    { id: "low", emoji: "😔", label: "Low", message: "It's okay to have off days. Start with just 5 minutes — once you begin, momentum will carry you through." },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING";
    if (hour < 18) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  };

  const firstName = user?.first_name || user?.email?.split("@")[0] || "there";

  // Stats from real data
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const daysTrainedThisMonth = workouts.filter(w => new Date(w.date) >= startOfMonth).length;
  const daysTrainedThisWeek = workouts.filter(w => new Date(w.date) >= startOfWeek).length;

  const currentWeight = progressLogs.length > 0 ? progressLogs[0].weight : null;
  const firstWeight = progressLogs.length > 0 ? progressLogs[progressLogs.length - 1].weight : null;
  const weightChange = currentWeight && firstWeight ? (currentWeight - firstWeight).toFixed(1) : null;

  // Week tracker
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const trainedDates = workouts.map(w => new Date(w.date).toDateString());

  const getWeekDayDate = (index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    return date;
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
        .db-nav { display: flex; align-items: center; height: 56px; background: rgba(8,12,16,0.97); border-bottom: 1px solid var(--border); padding: 0 20px; width: 100%; position: sticky; top: 0; z-index: 100; }
        .db-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 2px; color: var(--accent); white-space: nowrap; flex-shrink: 0; margin-right: 24px; cursor: pointer; }
        .db-nav-links { display: flex; gap: 24px; flex: 1; }
        .db-nav-links a { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; white-space: nowrap; transition: color 0.2s; cursor: pointer; }
        .db-nav-links a:hover { color: var(--text); }
        .db-nav-links a.active { color: var(--accent); }
        .db-nav-cta { display: flex; gap: 10px; align-items: center; flex-shrink: 0; margin-left: 24px; }
        .db-avatar { width: 32px; height: 32px; border-radius: 50%; background: rgba(0,229,255,0.1); border: 2px solid var(--accent); display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 14px; color: var(--accent); cursor: pointer; overflow: hidden; flex-shrink: 0; }
        .db-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .db-btn-danger { background: transparent; border: 1px solid rgba(255,80,80,0.3); color: #ff6b6b; padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .db-page { padding: 28px 24px; max-width: 1000px; margin: 0 auto; width: 100%; }
        .db-section-label { font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); margin-bottom: 4px; }
        .db-page-title { font-family: 'Bebas Neue', sans-serif; font-size: 36px; letter-spacing: 2px; margin-bottom: 24px; }
        .db-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .db-stat-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; }
        .db-stat-icon { font-size: 18px; margin-bottom: 6px; }
        .db-stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--accent); letter-spacing: 1px; }
        .db-stat-num.green { color: var(--accent2); }
        .db-stat-num.muted { color: var(--muted); font-size: 16px; padding-top: 6px; }
        .db-stat-label { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .db-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .db-card-title { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 1px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
        .db-week-row { display: flex; gap: 6px; }
        .db-day-chip { flex: 1; text-align: center; padding: 10px 4px; border-radius: 8px; border: 1px solid var(--border); font-size: 11px; }
        .db-day-chip.trained { background: rgba(0,255,136,0.08); border-color: rgba(0,255,136,0.3); color: var(--accent2); }
        .db-day-chip.today { border-color: var(--accent); color: var(--accent); }
        .db-day-name { font-weight: 600; margin-bottom: 2px; }
        .db-day-status { font-size: 10px; }
        .db-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .db-mood-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
        .db-mood-chip { background: var(--card); border: 1px solid var(--border); padding: 8px 14px; border-radius: 20px; font-size: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; color: var(--text); }
        .db-mood-chip:hover { border-color: var(--accent); color: var(--accent); }
        .db-mood-chip.selected { border-color: var(--accent); background: rgba(0,229,255,0.08); color: var(--accent); }
        .db-ai-message { background: rgba(0,229,255,0.06); border: 1px solid rgba(0,229,255,0.2); border-radius: 10px; padding: 14px; font-size: 13px; color: var(--text); line-height: 1.6; }
        .db-ai-badge { font-size: 11px; color: var(--accent); font-weight: 600; margin-bottom: 6px; }
        .db-mood-placeholder { font-size: 13px; color: var(--muted); font-style: italic; text-align: center; padding: 12px 0; }
        .db-progress-entry { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
        .db-progress-entry:last-child { border-bottom: none; }
        .db-progress-date { color: var(--muted); }
        .db-progress-weight { color: var(--accent); font-weight: 600; }
        .db-empty-state { text-align: center; padding: 20px; color: var(--muted); font-size: 13px; }
        .db-btn-sm { background: var(--accent); color: #000; padding: 5px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; }
        .db-btn-sm-outline { background: transparent; border: 1px solid var(--border); color: var(--text); padding: 5px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .db-loading { text-align: center; padding: 60px; color: var(--muted); }
        .db-spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: db-spin 0.8s linear infinite; margin: 0 auto 12px; }
        @keyframes db-spin { to { transform: rotate(360deg); } }
        @keyframes db-fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .db-page > * { animation: db-fadeUp 0.4s ease both; }
        @media (max-width: 768px) {
        .db-nav {
              display: none !important;
          }
      }
      `}</style>

      <div className="db-body">
        <MobileNavbar />
        <nav className="db-nav">
          <div className="db-logo" onClick={() => navigate("/")}>GymMind AI</div>
          <div className="db-nav-links">
            <a className="active">Dashboard</a>
            <a onClick={() => navigate("/workout")}>My Workout</a>
            <a onClick={() => navigate("/moodcheck")}>Mood Check</a>
            <a onClick={() => navigate("/progress")}>Progress</a>
            <a onClick={() => navigate("/nutrition")}>Nutrition</a>
            <a onClick={() => navigate("/profile")}>Profile</a>
          </div>
          <div className="db-nav-cta">
            <div className="db-avatar" onClick={() => navigate("/profile")}>
              {user?.photo_url
                ? <img src={user.photo_url} alt="profile" />
                : (user?.first_name?.[0] || "U").toUpperCase()
              }
            </div>
            <button className="db-btn-danger" onClick={handleLogout}>Sign out</button>
          </div>
        </nav>

        <div className="db-page">

          <div className="db-section-label">Welcome back</div>
          <div className="db-page-title">{getGreeting()}, {firstName.toUpperCase()} 👋</div>

          {loading ? (
            <div className="db-loading">
              <div className="db-spinner"></div>
              <div>Loading your data...</div>
            </div>
          ) : (
            <>
              {/* STATS */}
              <div className="db-stats-row">
                <div className="db-stat-card">
                  <div className="db-stat-icon">🔥</div>
                  <div className="db-stat-num">{daysTrainedThisMonth}</div>
                  <div className="db-stat-label">Days trained this month</div>
                </div>
                <div className="db-stat-card">
                  <div className="db-stat-icon">⚖️</div>
                  <div className={`db-stat-num ${weightChange !== null && weightChange < 0 ? "green" : ""}`}>
                    {weightChange !== null ? weightChange : "—"}
                  </div>
                  <div className="db-stat-label">kg change</div>
                </div>
                <div className="db-stat-card">
                  <div className="db-stat-icon">🏋️</div>
                  <div className="db-stat-num">{daysTrainedThisWeek}</div>
                  <div className="db-stat-label">Workouts this week</div>
                </div>
                <div className="db-stat-card">
                  <div className="db-stat-icon">🎯</div>
                  <div className={`db-stat-num ${!user?.fitness_goal ? "muted" : ""}`}>
                    {user?.fitness_goal || "No goal set"}
                  </div>
                  <div className="db-stat-label">Current goal</div>
                </div>
              </div>

              {/* WEEK TRACKER */}
              <div className="db-card">
                <div className="db-card-title">📅 This week</div>
                <div className="db-week-row">
                  {weekDays.map((day, index) => {
                    const dayDate = getWeekDayDate(index);
                    const isTrained = trainedDates.includes(dayDate.toDateString());
                    const isToday = index === todayIndex;
                    return (
                      <div key={day} className={`db-day-chip ${isTrained ? "trained" : ""} ${isToday ? "today" : ""}`}>
                        <div className="db-day-name">{day}</div>
                        <div className="db-day-status">{isTrained ? "✅" : isToday ? "Today" : "—"}</div>
                      </div>
                    );
                  })}
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
                        onClick={() => { setSelectedMood(mood.id); setAiMessage(mood.message); }}
                      >
                        {mood.emoji} {mood.label}
                      </div>
                    ))}
                  </div>
                  {aiMessage
                    ? <div className="db-ai-message"><div className="db-ai-badge">🤖 AI Coach</div>{aiMessage}</div>
                    : <div className="db-mood-placeholder">Select your mood to get a message from your AI Coach</div>
                  }
                </div>

                {/* RECENT PROGRESS */}
                <div className="db-card">
                  <div className="db-card-title">
                    <span>📈 Recent Progress</span>
                    <button className="db-btn-sm-outline" onClick={() => navigate("/progress")}>View all</button>
                  </div>
                  {progressLogs.length === 0 ? (
                    <div className="db-empty-state">
                      No weight logs yet.<br />
                      <span
                        style={{ color: "var(--accent)", cursor: "pointer", fontSize: "13px" }}
                        onClick={() => navigate("/progress")}
                      >
                        Log your first weight →
                      </span>
                    </div>
                  ) : (
                    progressLogs.slice(0, 4).map((log, i) => (
                      <div key={i} className="db-progress-entry">
                        <span className="db-progress-date">{log.date}</span>
                        <span className="db-progress-weight">{log.weight} kg</span>
                      </div>
                    ))
                  )}
                </div>

              </div>

              {/* WORKOUT CTA */}
              <div className="db-card" style={{ textAlign: "center", padding: "32px" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🏋️</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", letterSpacing: "1px", marginBottom: "8px" }}>
                  {workouts.length === 0 ? "START YOUR FIRST WORKOUT" : "READY FOR TODAY'S WORKOUT?"}
                </div>
                <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px" }}>
                  {workouts.length === 0
                    ? "Your AI Coach will generate a personalized routine based on your fitness goal."
                    : `You've completed ${daysTrainedThisMonth} workouts this month. Keep it up!`
                  }
                </p>
                <button className="db-btn-sm" onClick={() => navigate("/workout")} style={{ padding: "10px 28px", fontSize: "14px" }}>
                  {workouts.length === 0 ? "Generate my workout" : "Go to My Workout"}
                </button>
              </div>

            </>
          )}

        </div>
      </div>
    </>
  );
};

export default Dashboard; 
