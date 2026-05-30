import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Progress = () => {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  const [weightInput, setWeightInput] = useState("");
  const [dateInput, setDateInput] = useState(new Date().toISOString().split("T")[0]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [logs, setLogs] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const user = store.user || JSON.parse(sessionStorage.getItem("user") || "{}");
  const token = store.token || sessionStorage.getItem("token");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token]);

  useEffect(() => {
    if (!user?.id || !token) return;
    fetchData();
  }, [user?.id, token]);

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
      if (progressRes.ok) setLogs(await progressRes.json());
      if (workoutRes.ok) setWorkouts(await workoutRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    dispatch({ type: "logout" });
    navigate("/");
  };

  const handleLogWeight = async () => {
    if (!weightInput) return;
    try {
      const response = await fetch(`${backendUrl}/api/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: user.id, weight: parseFloat(weightInput), date: dateInput })
      });
      if (response.ok) {
        setShowSuccess(true);
        setWeightInput("");
        fetchData();
        setTimeout(() => setShowSuccess(false), 2500);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to log weight");
      }
    } catch (error) {
      console.error("Error logging weight:", error);
    }
  };

  // Stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const currentWeight = logs.length > 0 ? logs[0].weight : null;
  const firstWeight = logs.length > 0 ? logs[logs.length - 1].weight : null;
  const weightChange = currentWeight && firstWeight ? (currentWeight - firstWeight).toFixed(1) : null;
  const daysTrainedThisMonth = workouts.filter(w => new Date(w.date) >= startOfMonth).length;
  const daysTrainedThisWeek = workouts.filter(w => new Date(w.date) >= startOfWeek).length;

  // Calendar
  const trainedDates = new Set(workouts.map(w => w.date));
  const weightDates = {};
  logs.forEach(log => { weightDates[log.date] = log.weight; });

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const days = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, dateStr });
    }
    return days;
  };

  const calendarDays = getCalendarDays();
  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const todayStr = now.toISOString().split("T")[0];

  // SVG Chart
  const chartLogs = [...logs].reverse().slice(-10);
  const chartPoints = () => {
    if (chartLogs.length < 2) return null;
    const weights = chartLogs.map(l => l.weight);
    const minW = Math.min(...weights) - 1;
    const maxW = Math.max(...weights) + 1;
    const w = 400, h = 140;
    const points = chartLogs.map((log, i) => {
      const x = (i / (chartLogs.length - 1)) * w;
      const y = h - ((log.weight - minW) / (maxW - minW)) * h;
      return { x, y, weight: log.weight, date: log.date };
    });
    const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const area = `${path} L${w},${h} L0,${h} Z`;
    return { points, path, area, minW, maxW };
  };
  const chart = chartPoints();

  // Week tracker
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const getWeekDayDate = (index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    return date.toISOString().split("T")[0];
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root { --bg: #080c10; --bg2: #0d1318; --accent: #00e5ff; --accent2: #00ff88; --text: #f0f4f8; --muted: #6b7c8f; --card: rgba(255,255,255,0.04); --border: rgba(255,255,255,0.08); }
        .pr-body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        .pr-nav { display: flex; align-items: center; height: 56px; background: rgba(8,12,16,0.97); border-bottom: 1px solid var(--border); padding: 0 20px; width: 100%; position: sticky; top: 0; z-index: 100; }
        .pr-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 2px; color: var(--accent); white-space: nowrap; flex-shrink: 0; margin-right: 24px; cursor: pointer; }
        .pr-nav-links { display: flex; gap: 24px; flex: 1; }
        .pr-nav-links a { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; white-space: nowrap; transition: color 0.2s; cursor: pointer; }
        .pr-nav-links a:hover { color: var(--text); }
        .pr-nav-links a.active { color: var(--accent); }
        .pr-nav-cta { display: flex; gap: 8px; align-items: center; flex-shrink: 0; margin-left: 24px; }
        .pr-btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text); padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .pr-btn-danger { background: transparent; border: 1px solid rgba(255,80,80,0.3); color: #ff6b6b; padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .pr-page { padding: 28px 24px; max-width: 1000px; margin: 0 auto; width: 100%; }
        .pr-section-label { font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); margin-bottom: 4px; }
        .pr-page-title { font-family: 'Bebas Neue', sans-serif; font-size: 36px; letter-spacing: 2px; margin-bottom: 24px; }
        .pr-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .pr-stat-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; }
        .pr-stat-icon { font-size: 18px; margin-bottom: 6px; }
        .pr-stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--accent); letter-spacing: 1px; }
        .pr-stat-num.green { color: var(--accent2); }
        .pr-stat-label { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .pr-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .pr-card-title { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 1px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
        .pr-log-form { display: flex; gap: 10px; align-items: flex-end; }
        .pr-form-group { flex: 1; }
        .pr-form-label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px; font-weight: 500; }
        .pr-form-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; font-size: 14px; color: var(--text); font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; }
        .pr-form-input:focus { border-color: var(--accent); }
        .pr-btn-accent { background: var(--accent); color: #000; padding: 9px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .pr-success-msg { background: rgba(0,255,136,0.08); border: 1px solid rgba(0,255,136,0.2); border-radius: 8px; padding: 8px 14px; font-size: 13px; color: var(--accent2); margin-top: 10px; }
        .pr-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .pr-log-table { width: 100%; border-collapse: collapse; }
        .pr-log-table th { font-size: 11px; color: var(--muted); font-weight: 500; text-align: left; padding: 8px 0; border-bottom: 1px solid var(--border); text-transform: uppercase; }
        .pr-log-table td { font-size: 13px; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .pr-log-table tr:last-child td { border-bottom: none; }
        .pr-weight-val { color: var(--accent); font-weight: 600; }
        .pr-change-pos { color: var(--accent2); font-size: 12px; }
        .pr-change-neg { color: #ff6b6b; font-size: 12px; }
        .pr-change-neutral { color: var(--muted); font-size: 12px; }
        .pr-week-row { display: flex; gap: 6px; }
        .pr-day-chip { flex: 1; text-align: center; padding: 10px 4px; border-radius: 8px; border: 1px solid var(--border); font-size: 11px; }
        .pr-day-chip.trained { background: rgba(0,255,136,0.08); border-color: rgba(0,255,136,0.3); color: var(--accent2); }
        .pr-day-chip.today { border-color: var(--accent); color: var(--accent); }
        .pr-day-name { font-weight: 600; margin-bottom: 2px; }
        .pr-day-status { font-size: 10px; }
        .pr-empty { text-align: center; padding: 20px; color: var(--muted); font-size: 13px; }

        /* CALENDAR */
        .pr-cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .pr-cal-month { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1px; }
        .pr-cal-nav { background: transparent; border: 1px solid var(--border); color: var(--text); width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }
        .pr-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; } 
        .pr-cal-day { aspect-ratio: 1; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; position: relative; min-height: 32px; max-height: 36px; }
        .pr-cal-day-header { text-align: center; font-size: 9px; color: var(--muted); font-weight: 600; padding: 3px 0; text-transform: uppercase; }
        .pr-cal-day:hover { border-color: var(--border); }
        .pr-cal-day.empty { cursor: default; }
        .pr-cal-day.today { border-color: var(--accent); color: var(--accent); }
        .pr-cal-day.trained { background: rgba(0,255,136,0.12); border-color: rgba(0,255,136,0.3); color: var(--accent2); }
        .pr-cal-day.trained.weighed { background: rgba(0,229,255,0.12); border-color: rgba(0,229,255,0.3); color: var(--accent); }
        .pr-cal-day.selected { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(0,229,255,0.2); }
        .pr-cal-dot { width: 4px; height: 4px; border-radius: 50%; position: absolute; bottom: 3px; }
        .pr-cal-dot.trained { background: var(--accent2); }
        .pr-cal-dot.weighed { background: var(--accent); right: 4px; }
        .pr-cal-legend { display: flex; gap: 16px; margin-top: 12px; font-size: 11px; color: var(--muted); }
        .pr-cal-legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 4px; }

        /* SELECTED DAY */
        .pr-day-detail { background: rgba(0,229,255,0.04); border: 1px solid rgba(0,229,255,0.15); border-radius: 10px; padding: 14px; margin-top: 12px; font-size: 13px; }
        .pr-day-detail-title { font-weight: 600; color: var(--accent); margin-bottom: 6px; }

        .pr-loading { text-align: center; padding: 60px; color: var(--muted); }
        .pr-spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: pr-spin 0.8s linear infinite; margin: 0 auto 12px; }
        @keyframes pr-spin { to { transform: rotate(360deg); } }
        @keyframes pr-fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .pr-page > * { animation: pr-fadeUp 0.5s ease both; }
      `}</style>

      <div className="pr-body">

        <nav className="pr-nav">
          <div className="pr-logo" onClick={() => navigate("/")}>GymMind AI</div>
          <div className="pr-nav-links">
            <a onClick={() => navigate("/dashboard")}>Dashboard</a>
            <a onClick={() => navigate("/workout")}>My Workout</a>
            <a onClick={() => navigate("/moodcheck")}>Mood Check</a>
            <a className="active">Progress</a>
            <a onClick={() => navigate("/nutrition")}>Nutrition</a>
            <a onClick={() => navigate("/profile")}>Profile</a>
          </div>
          <div className="pr-nav-cta">
            <button className="pr-btn-ghost" onClick={() => navigate("/profile")}>Edit profile</button>
            <button className="pr-btn-danger" onClick={handleLogout}>Sign out</button>
          </div>
        </nav>

        <div className="pr-page">

          <div className="pr-section-label">Your evolution</div>
          <div className="pr-page-title">PROGRESS TRACKING</div>

          {loading ? (
            <div className="pr-loading">
              <div className="pr-spinner"></div>
              <div>Loading your data...</div>
            </div>
          ) : (
            <>
              {/* STATS */}
              <div className="pr-stats-row">
                <div className="pr-stat-card">
                  <div className="pr-stat-icon">⚖️</div>
                  <div className="pr-stat-num">{currentWeight || "—"}</div>
                  <div className="pr-stat-label">Current weight (kg)</div>
                </div>
                <div className="pr-stat-card">
                  <div className="pr-stat-icon">📉</div>
                  <div className={`pr-stat-num ${weightChange && weightChange < 0 ? "green" : ""}`}>
                    {weightChange !== null ? weightChange : "—"}
                  </div>
                  <div className="pr-stat-label">kg change</div>
                </div>
                <div className="pr-stat-card">
                  <div className="pr-stat-icon">🔥</div>
                  <div className="pr-stat-num">{daysTrainedThisMonth}</div>
                  <div className="pr-stat-label">Days trained this month</div>
                </div>
                <div className="pr-stat-card">
                  <div className="pr-stat-icon">📅</div>
                  <div className="pr-stat-num">{daysTrainedThisWeek}</div>
                  <div className="pr-stat-label">Days trained this week</div>
                </div>
              </div>

              {/* LOG WEIGHT */}
              <div className="pr-card">
                <div className="pr-card-title">⚖️ Log today's weight</div>
                <div className="pr-log-form">
                  <div className="pr-form-group">
                    <label className="pr-form-label">Weight (kg)</label>
                    <input className="pr-form-input" type="number" placeholder="e.g. 62.5" step="0.1" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} />
                  </div>
                  <div className="pr-form-group">
                    <label className="pr-form-label">Date</label>
                    <input className="pr-form-input" type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
                  </div>
                  <button className="pr-btn-accent" onClick={handleLogWeight}>Save</button>
                </div>
                {showSuccess && <div className="pr-success-msg">✅ Weight logged successfully!</div>}
              </div>


              <div className="pr-grid-2">
                {/* CALENDAR */}
                    <div className="pr-card">
                      <div className="pr-card-title">📅 Training Calendar</div>
                      <div className="pr-cal-header">
                        <button className="pr-cal-nav" onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}>‹</button>
                        <div className="pr-cal-month">{monthName}</div>
                        <button className="pr-cal-nav" onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                      </div>
                      <div className="pr-cal-grid">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                          <div key={d} className="pr-cal-day-header">{d}</div>
                        ))}
                        {calendarDays.map((day, i) => {
                          if (!day) return <div key={i} className="pr-cal-day empty" />;
                          const isTrained = trainedDates.has(day.dateStr);
                          const hasWeight = weightDates[day.dateStr];
                          const isToday = day.dateStr === todayStr;
                          const isSelected = selectedDay === day.dateStr;
                          return (
                            <div
                              key={i}
                              className={`pr-cal-day ${isToday ? "today" : ""} ${isTrained ? "trained" : ""} ${hasWeight ? "weighed" : ""} ${isSelected ? "selected" : ""}`}
                              onClick={() => setSelectedDay(isSelected ? null : day.dateStr)}
                            >
                              {day.day}
                              {isTrained && <div className="pr-cal-dot trained" style={{ left: "4px" }} />}
                              {hasWeight && <div className="pr-cal-dot weighed" />}
                            </div>
                          );
                        })}
                      </div>
                      <div className="pr-cal-legend">
                        <span><span className="pr-cal-legend-dot" style={{ background: "var(--accent2)" }}></span>Workout day</span>
                        <span><span className="pr-cal-legend-dot" style={{ background: "var(--accent)" }}></span>Weight logged</span>
                      </div>
                      {selectedDay && (
                        <div className="pr-day-detail">
                          <div className="pr-day-detail-title">📆 {selectedDay}</div>
                          {trainedDates.has(selectedDay) && <div>🏋️ Workout completed</div>}
                          {weightDates[selectedDay] && <div>⚖️ Weight: {weightDates[selectedDay]} kg</div>}
                          {!trainedDates.has(selectedDay) && !weightDates[selectedDay] && <div style={{ color: "var(--muted)" }}>No activity logged</div>}
                        </div>
                      )}
                    </div>

                    {/* WEIGHT LOG TABLE */}
                    <div className="pr-card">
                      <div className="pr-card-title">📋 Weight log</div>
                      {logs.length === 0 ? (
                        <div className="pr-empty">No logs yet. Start tracking your weight!</div>
                      ) : (
                        <table className="pr-log-table">
                          <thead>
                            <tr><th>Date</th><th>Weight</th><th>Change</th></tr>
                          </thead>
                          <tbody>
                            {logs.map((log, i) => {
                              const prev = logs[i + 1];
                              const change = prev ? (log.weight - prev.weight).toFixed(1) : null;
                              return (
                                <tr key={i}>
                                  <td>{log.date}</td>
                                  <td className="pr-weight-val">{log.weight} kg</td>
                                  <td className={change === null ? "pr-change-neutral" : change < 0 ? "pr-change-pos" : "pr-change-neg"}>
                                    {change !== null ? (change > 0 ? `↑ +${change}` : `↓ ${change}`) : "Start"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div> 

              {/* CHART */}
              <div className="pr-card">
                <div className="pr-card-title">📈 Weight over time</div>
                {chart ? (
                  <>
                    <div style={{ position: "relative", height: "160px", marginBottom: "8px" }}>
                      <svg width="100%" height="100%" viewBox="0 0 400 140" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="prGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={chart.area} fill="url(#prGrad)" />
                        <path d={chart.path} fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round" />
                        {chart.points.map((p, i) => (
                          <circle key={i} cx={p.x} cy={p.y} r={i === chart.points.length - 1 ? 5 : 4} fill={i === chart.points.length - 1 ? "#00ff88" : "#00e5ff"} />
                        ))}
                      </svg>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)" }}>
                      {chartLogs.map((l, i) => <span key={i}>{l.date?.slice(5)}</span>)}
                    </div>
                  </>
                ) : (
                  <div className="pr-empty">No weight data yet.<br /><span style={{ color: "var(--accent)", cursor: "pointer" }}>Log your first weight ↑</span></div>
                )}
              </div>

              {/* WEEK TRACKER */}
              <div className="pr-card">
                <div className="pr-card-title">📅 This week's training</div>
                <div className="pr-week-row">
                  {weekDays.map((day, index) => {
                    const dayStr = getWeekDayDate(index);
                    const isTrained = trainedDates.has(dayStr);
                    const isToday = index === todayIndex;
                    return (
                      <div key={day} className={`pr-day-chip ${isTrained ? "trained" : ""} ${isToday ? "today" : ""}`}>
                        <div className="pr-day-name">{day}</div>
                        <div className="pr-day-status">{isTrained ? "✅" : isToday ? "Today" : "—"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </>
          )}

        </div>
      </div>
    </>
  );
};

export default Progress; 