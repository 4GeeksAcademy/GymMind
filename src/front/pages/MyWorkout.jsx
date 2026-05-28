import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const MyWorkout = () => {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoIds, setVideoIds] = useState({});
  const [activeVideo, setActiveVideo] = useState(null);
  const [completedExercises, setCompletedExercises] = useState({});

  const user = store.user || JSON.parse(sessionStorage.getItem("user"));
  const token = store.token || sessionStorage.getItem("token");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token]);

  const generateWorkout = async () => {
    setLoading(true);
    setWorkout(null);
    setVideoIds({});
    setCompletedExercises({});
    setActiveVideo(null);

    try {
      const response = await fetch(`${backendUrl}/api/workout/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fitness_goal: user?.fitness_goal || "general fitness",
          user_id: user?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setWorkout(data);
        fetchVideos(data.exercises);
      } else {
        alert(data.error || "Failed to generate workout");
      }
    } catch (error) {
      console.error("Error generating workout:", error);
      alert("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async (exercises) => {
    for (const exercise of exercises) {
      try {
        const response = await fetch(
          `${backendUrl}/api/youtube/search?q=${encodeURIComponent(exercise.name)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        if (response.ok && data.video_id) {
          setVideoIds((prev) => ({ ...prev, [exercise.name]: data.video_id }));
        }
      } catch (error) {
        console.error(`Error fetching video for ${exercise.name}:`, error);
      }
    }
  };

  const toggleExercise = (name) => {
    setCompletedExercises((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const completedCount = Object.values(completedExercises).filter(Boolean).length;
  const totalExercises = workout?.exercises?.length || 0;
  const progress = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    dispatch({ type: "logout" });
    navigate("/");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --bg: #080c10; --bg2: #0d1318; --accent: #00e5ff; --accent2: #00ff88;
          --text: #f0f4f8; --muted: #6b7c8f; --card: rgba(255,255,255,0.04); --border: rgba(255,255,255,0.08);
        }

        .wk-body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; }

        .wk-nav { display: flex; align-items: center; height: 56px; background: rgba(8,12,16,0.97); border-bottom: 1px solid var(--border); padding: 0 20px; width: 100%; position: sticky; top: 0; z-index: 100; }
        .wk-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 2px; color: var(--accent); white-space: nowrap; flex-shrink: 0; margin-right: 24px; cursor: pointer; }
        .wk-nav-links { display: flex; gap: 24px; flex: 1; }
        .wk-nav-links a { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; white-space: nowrap; transition: color 0.2s; cursor: pointer; }
        .wk-nav-links a:hover { color: var(--text); }
        .wk-nav-links a.active { color: var(--accent); }
        .wk-nav-cta { display: flex; gap: 8px; align-items: center; flex-shrink: 0; margin-left: 24px; }
        .wk-btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text); padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .wk-btn-danger { background: transparent; border: 1px solid rgba(255,80,80,0.3); color: #ff6b6b; padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }

        .wk-page { padding: 28px 24px; max-width: 1000px; margin: 0 auto; width: 100%; }
        .wk-section-label { font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); margin-bottom: 4px; }
        .wk-page-title { font-family: 'Bebas Neue', sans-serif; font-size: 36px; letter-spacing: 2px; margin-bottom: 24px; }

        .wk-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .wk-card-title { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 1px; margin-bottom: 14px; }

        .wk-generate-btn { background: var(--accent); color: #000; padding: 12px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; transition: opacity 0.2s, transform 0.2s; }
        .wk-generate-btn:hover { opacity: 0.85; transform: translateY(-2px); }
        .wk-generate-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .wk-progress-wrap { margin-bottom: 20px; }
        .wk-progress-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); margin-bottom: 6px; }
        .wk-progress-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
        .wk-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); border-radius: 3px; transition: width 0.5s ease; }

        .wk-exercise-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 12px; transition: background 0.2s; }
        .wk-exercise-card.done { background: rgba(0,255,136,0.04); border-color: rgba(0,255,136,0.2); }
        .wk-exercise-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .wk-exercise-check { width: 20px; height: 20px; accent-color: var(--accent2); cursor: pointer; flex-shrink: 0; }
        .wk-exercise-info { flex: 1; }
        .wk-exercise-name { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
        .wk-exercise-name.done { text-decoration: line-through; color: var(--muted); }
        .wk-exercise-meta { font-size: 12px; color: var(--muted); }
        .wk-exercise-sets { font-size: 12px; color: var(--accent); font-weight: 500; }

        .wk-video-btn { background: transparent; border: 1px solid var(--border); color: var(--muted); padding: 5px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; flex-shrink: 0; }
        .wk-video-btn:hover { border-color: #ff0000; color: #ff0000; }
        .wk-video-btn.loading { opacity: 0.5; }

        .wk-video-wrap { margin-top: 10px; border-radius: 8px; overflow: hidden; }
        .wk-video-wrap iframe { width: 100%; height: 200px; border: none; }

        .wk-instructions { font-size: 13px; color: var(--muted); line-height: 1.5; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); }

        .wk-empty { text-align: center; padding: 48px 24px; }
        .wk-empty-icon { font-size: 48px; margin-bottom: 16px; }
        .wk-empty-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 1px; margin-bottom: 8px; }
        .wk-empty-sub { font-size: 14px; color: var(--muted); margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto; }

        .wk-loading { text-align: center; padding: 48px; }
        .wk-loading-text { font-size: 14px; color: var(--muted); margin-top: 16px; }
        .wk-spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: wk-spin 0.8s linear infinite; margin: 0 auto; }
        @keyframes wk-spin { to { transform: rotate(360deg); } }

        .wk-goal-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,229,255,0.08); border: 1px solid rgba(0,229,255,0.2); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-bottom: 16px; }

        @keyframes wk-fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .wk-page > * { animation: wk-fadeUp 0.5s ease both; }
      `}</style>

      <div className="wk-body">

        {/* NAVBAR */}
        <nav className="wk-nav">
          <div className="wk-logo" onClick={() => navigate("/")}>GymMind AI</div>
          <div className="wk-nav-links">
            <a onClick={() => navigate("/dashboard")}>Dashboard</a>
            <a className="active">My Workout</a>
            <a onClick={() => navigate("/moodcheck")}>Mood Check</a>
            <a onClick={() => navigate("/progress")}>Progress</a>
            <a onClick={() => navigate("/nutrition")}>Nutrition</a>
            <a onClick={() => navigate("/profile")}>Profile</a>
          </div>
          <div className="wk-nav-cta">
            <button className="wk-btn-ghost" onClick={() => navigate("/profile")}>Edit profile</button>
            <button className="wk-btn-danger" onClick={handleLogout}>Sign out</button>
          </div>
        </nav>

        <div className="wk-page">

          <div className="wk-section-label">AI-powered training</div>
          <div className="wk-page-title">MY WORKOUT</div>

          {user?.fitness_goal && (
            <div className="wk-goal-tag">🎯 Goal: {user.fitness_goal}</div>
          )}

          {!workout && !loading && (
            <div className="wk-empty">
              <div className="wk-empty-icon">🏋️</div>
              <div className="wk-empty-title">READY TO TRAIN?</div>
              <div className="wk-empty-sub">
                Your AI Coach will generate a personalized workout based on your fitness goal. Each exercise includes a YouTube tutorial video.
              </div>
              <button className="wk-generate-btn" onClick={generateWorkout}>
                Generate my workout
              </button>
            </div>
          )}

          {loading && (
            <div className="wk-loading">
              <div className="wk-spinner"></div>
              <div className="wk-loading-text">Your AI Coach is generating your workout...</div>
            </div>
          )}

          {workout && !loading && (
            <>
              {/* WORKOUT HEADER */}
              <div className="wk-card">
                <div className="wk-card-title">{workout.workout_name}</div>
                <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px", lineHeight: "1.6" }}>
                  {workout.description}
                </p>

                {/* PROGRESS BAR */}
                <div className="wk-progress-wrap">
                  <div className="wk-progress-label">
                    <span>{completedCount} of {totalExercises} exercises completed</span>
                    <span style={{ color: "var(--accent)" }}>{progress}%</span>
                  </div>
                  <div className="wk-progress-bar">
                    <div className="wk-progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

                <button className="wk-generate-btn" onClick={generateWorkout} style={{ fontSize: "13px", padding: "8px 20px" }}>
                  Generate new workout
                </button>
              </div>

              {/* EXERCISES */}
              <div className="wk-card">
                <div className="wk-card-title">📋 Exercises</div>
                {workout.exercises.map((exercise, i) => (
                  <div key={i} className={`wk-exercise-card ${completedExercises[exercise.name] ? "done" : ""}`}>
                    <div className="wk-exercise-header">
                      <input
                        type="checkbox"
                        className="wk-exercise-check"
                        checked={completedExercises[exercise.name] || false}
                        onChange={() => toggleExercise(exercise.name)}
                      />
                      <div className="wk-exercise-info">
                        <div className={`wk-exercise-name ${completedExercises[exercise.name] ? "done" : ""}`}>
                          {exercise.name}
                        </div>
                        <div className="wk-exercise-meta">
                          💪 {exercise.muscle} &nbsp;·&nbsp;
                          <span className="wk-exercise-sets">{exercise.sets} sets × {exercise.reps} reps</span>
                        </div>
                      </div>
                      <button
                        className={`wk-video-btn ${!videoIds[exercise.name] ? "loading" : ""}`}
                        onClick={() => setActiveVideo(activeVideo === exercise.name ? null : exercise.name)}
                      >
                        {!videoIds[exercise.name] ? "⏳ Loading..." : activeVideo === exercise.name ? "▼ Hide video" : "▶ Watch video"}
                      </button>
                    </div>

                    {exercise.instructions && (
                      <div className="wk-instructions">📝 {exercise.instructions}</div>
                    )}

                    {activeVideo === exercise.name && videoIds[exercise.name] && (
                      <div className="wk-video-wrap">
                        <iframe
                          src={`https://www.youtube.com/embed/${videoIds[exercise.name]}`}
                          title={exercise.name}
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {progress === 100 && (
                <div className="wk-card" style={{ textAlign: "center", padding: "32px", background: "rgba(0,255,136,0.04)", borderColor: "rgba(0,255,136,0.2)" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", letterSpacing: "1px", color: "var(--accent2)", marginBottom: "8px" }}>
                    WORKOUT COMPLETE!
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--muted)" }}>
                    Amazing work! You've completed all exercises. Rest and recover for your next session.
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
};

export default MyWorkout; 