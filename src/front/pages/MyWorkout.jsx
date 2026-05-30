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
  const [exerciseLogs, setExerciseLogs] = useState({});
  const [recommendations, setRecommendations] = useState({});
  const [activeLog, setActiveLog] = useState(null);
  const [savingLog, setSavingLog] = useState({});
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(true);

  const user = store.user || JSON.parse(sessionStorage.getItem("user") || "{}");
  const token = store.token || sessionStorage.getItem("token");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchAiRecommendation();
  }, [token]);

  const fetchAiRecommendation = async () => {
    setLoadingRecommendation(true);
    try {
      const response = await fetch(`${backendUrl}/api/workout/recommend`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setAiRecommendation(data);
        // Auto-select recommended group
        const groupMap = {
          "Chest": "chest", "Back": "back", "Shoulders": "shoulders",
          "Biceps": "biceps", "Triceps": "triceps", "Legs": "legs",
          "Glutes": "glutes", "Core": "core", "Full Body": "full body"
        };
        if (data.recommended_group && groupMap[data.recommended_group]) {
          setSelectedMuscleGroup(groupMap[data.recommended_group]);
        }
      }
    } catch (error) {
      console.error("Error fetching AI recommendation:", error);
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    dispatch({ type: "logout" });
    navigate("/");
  };

  const muscleGroups = [
    { id: "chest", label: "Chest" },
    { id: "back", label: "Back" },
    { id: "shoulders", label: "Shoulders" },
    { id: "biceps", label: "Biceps" },
    { id: "triceps", label: "Triceps" },
    { id: "legs", label: "Legs" },
    { id: "glutes", label: "Glutes" },
    { id: "core", label: "Core" },
    { id: "full body", label: "Full Body" },
  ];

  const generateWorkout = async () => {
    if (!selectedMuscleGroup) {
      alert("Please select a muscle group first.");
      return;
    }
    setLoading(true);
    setWorkout(null);
    setVideoIds({});
    setCompletedExercises({});
    setActiveVideo(null);
    setActiveLog(null);
    setRecommendations({});

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
          muscle_group: selectedMuscleGroup,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setWorkout(data);
        fetchVideos(data.exercises);
        fetchWeightRecommendations(data.exercises);
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

  const fetchWeightRecommendations = async (exercises) => {
    for (const exercise of exercises) {
      try {
        const response = await fetch(`${backendUrl}/api/exercise-log/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ exercise_name: exercise.name }),
        });
        const data = await response.json();
        if (response.ok) {
          setRecommendations((prev) => ({ ...prev, [exercise.name]: data.recommendation }));
        }
      } catch (error) {
        console.error(`Error fetching recommendation for ${exercise.name}:`, error);
      }
    }
  };

  const handleLogWeight = async (exerciseName) => {
    const log = exerciseLogs[exerciseName];
    if (!log?.weight || !log?.difficulty) {
      alert("Please enter weight and select difficulty.");
      return;
    }
    setSavingLog((prev) => ({ ...prev, [exerciseName]: true }));
    try {
      const exercise = workout.exercises.find(e => e.name === exerciseName);
      const response = await fetch(`${backendUrl}/api/exercise-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          exercise_name: exerciseName,
          weight: parseFloat(log.weight),
          sets: exercise?.sets || 3,
          reps: exercise?.reps || 10,
          difficulty: log.difficulty,
        }),
      });
      if (response.ok) {
        setActiveLog(null);
        setCompletedExercises((prev) => ({ ...prev, [exerciseName]: true }));
        const recRes = await fetch(`${backendUrl}/api/exercise-log/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ exercise_name: exerciseName }),
        });
        const recData = await recRes.json();
        if (recRes.ok) {
          setRecommendations((prev) => ({ ...prev, [exerciseName]: recData.recommendation }));
        }
      } else {
        alert("Failed to save log. Try again.");
      }
    } catch (error) {
      console.error("Error saving log:", error);
    } finally {
      setSavingLog((prev) => ({ ...prev, [exerciseName]: false }));
    }
  };

  const completedCount = Object.values(completedExercises).filter(Boolean).length;
  const totalExercises = workout?.exercises?.length || 0;
  const progress = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  const difficultyOptions = [
    { id: "very_easy", label: "Very Easy", color: "#60a5fa" },
    { id: "easy", label: "Easy", color: "#00ff88" },
    { id: "hard", label: "Hard", color: "#f97316" },
    { id: "very_hard", label: "Very Hard", color: "#ef4444" },
  ];

  const selectedGroup = muscleGroups.find(g => g.id === selectedMuscleGroup);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root { --bg: #080c10; --bg2: #0d1318; --accent: #00e5ff; --accent2: #00ff88; --text: #f0f4f8; --muted: #6b7c8f; --card: rgba(255,255,255,0.04); --border: rgba(255,255,255,0.08); }
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

        /* AI RECOMMENDATION */
        .wk-ai-rec { background: rgba(0,229,255,0.04); border: 1px solid rgba(0,229,255,0.2); border-radius: 12px; padding: 18px 20px; margin-bottom: 16px; }
        .wk-ai-rec-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .wk-ai-rec-badge { font-size: 11px; color: var(--accent); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
        .wk-ai-rec-group { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: var(--accent2); letter-spacing: 1px; margin-bottom: 6px; }
        .wk-ai-rec-reason { font-size: 13px; color: var(--muted); line-height: 1.6; }
        .wk-ai-rec-loading { font-size: 13px; color: var(--muted); font-style: italic; }

        /* MUSCLE GROUP SELECTOR */
        .wk-muscle-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
        .wk-muscle-btn { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 12px 8px; text-align: center; cursor: pointer; transition: all 0.2s; font-size: 13px; font-weight: 500; color: var(--muted); font-family: 'DM Sans', sans-serif; }
        .wk-muscle-btn:hover { border-color: var(--accent); color: var(--text); }
        .wk-muscle-btn.selected { border-color: var(--accent); background: rgba(0,229,255,0.08); color: var(--accent); font-weight: 600; }
        .wk-muscle-btn.recommended { border-color: var(--accent2); background: rgba(0,255,136,0.06); color: var(--accent2); }
        .wk-muscle-btn.recommended.selected { border-color: var(--accent); background: rgba(0,229,255,0.08); color: var(--accent); }

        .wk-generate-btn { background: var(--accent); color: #000; padding: 12px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; transition: opacity 0.2s; width: 100%; }
        .wk-generate-btn:hover { opacity: 0.85; }
        .wk-generate-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .wk-progress-wrap { margin-bottom: 20px; }
        .wk-progress-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); margin-bottom: 6px; }
        .wk-progress-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
        .wk-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); border-radius: 3px; transition: width 0.5s ease; }

        .wk-exercise-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 12px; }
        .wk-exercise-card.done { background: rgba(0,255,136,0.04); border-color: rgba(0,255,136,0.2); }
        .wk-exercise-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .wk-exercise-info { flex: 1; }
        .wk-exercise-name { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
        .wk-exercise-name.done { text-decoration: line-through; color: var(--muted); }
        .wk-exercise-meta { font-size: 12px; color: var(--muted); }
        .wk-exercise-sets { color: var(--accent); font-weight: 500; }
        .wk-equipment-tag { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 10px; margin-left: 6px; background: rgba(255,255,255,0.06); color: var(--muted); }
        .wk-exercise-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .wk-btn-sm { background: var(--accent); color: #000; padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .wk-btn-sm-outline { background: transparent; border: 1px solid var(--border); color: var(--muted); padding: 5px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .wk-btn-sm-outline:hover { border-color: #ff0000; color: #ff0000; }
        .wk-btn-sm-outline.loading { opacity: 0.5; cursor: default; }
        .wk-instructions { font-size: 13px; color: var(--muted); line-height: 1.5; margin-bottom: 10px; padding: 10px; background: rgba(255,255,255,0.02); border-radius: 6px; }
        .wk-weight-rec { background: rgba(0,229,255,0.04); border: 1px solid rgba(0,229,255,0.15); border-radius: 8px; padding: 10px 14px; margin-bottom: 10px; font-size: 12px; color: var(--text); line-height: 1.5; }
        .wk-weight-rec-label { font-size: 11px; color: var(--accent); font-weight: 600; margin-bottom: 4px; }
        .wk-log-panel { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 14px; margin-bottom: 10px; }
        .wk-log-title { font-size: 13px; font-weight: 600; margin-bottom: 10px; color: var(--accent); }
        .wk-log-row { display: flex; gap: 10px; align-items: flex-end; margin-bottom: 10px; }
        .wk-log-input-group { flex: 1; }
        .wk-log-label { font-size: 11px; color: var(--muted); margin-bottom: 4px; display: block; }
        .wk-log-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 6px; padding: 7px 10px; font-size: 13px; color: var(--text); font-family: 'DM Sans', sans-serif; outline: none; }
        .wk-log-input:focus { border-color: var(--accent); }
        .wk-difficulty-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .wk-difficulty-btn { padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 500; cursor: pointer; border: 1px solid var(--border); background: transparent; color: var(--muted); font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .wk-difficulty-btn.selected { color: #000; border-color: transparent; }
        .wk-save-btn { background: var(--accent2); color: #000; padding: 7px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; }
        .wk-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .wk-video-wrap { margin-top: 10px; border-radius: 8px; overflow: hidden; }
        .wk-video-wrap iframe { width: 100%; height: 220px; border: none; }
        .wk-loading { text-align: center; padding: 48px; }
        .wk-spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: wk-spin 0.8s linear infinite; margin: 0 auto; }
        .wk-loading-text { font-size: 14px; color: var(--muted); margin-top: 16px; }
        @keyframes wk-spin { to { transform: rotate(360deg); } }
        .wk-goal-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,229,255,0.08); border: 1px solid rgba(0,229,255,0.2); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-bottom: 16px; }
        @keyframes wk-fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .wk-page > * { animation: wk-fadeUp 0.5s ease both; }
      `}</style>

      <div className="wk-body">
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

          {/* AI RECOMMENDATION */}
          <div className="wk-ai-rec">
            <div className="wk-ai-rec-badge">🤖 AI Coach — Today's recommendation</div>
            {loadingRecommendation ? (
              <div className="wk-ai-rec-loading">Analyzing your training history...</div>
            ) : aiRecommendation ? (
              <>
                <div className="wk-ai-rec-group">→ {aiRecommendation.recommended_group}</div>
                <div className="wk-ai-rec-reason">{aiRecommendation.reason}</div>
              </>
            ) : (
              <div className="wk-ai-rec-reason">Select a muscle group below to get started.</div>
            )}
          </div>

          {/* MUSCLE GROUP SELECTOR */}
          <div className="wk-card">
            <div className="wk-card-title">Select muscle group</div>
            <div className="wk-muscle-grid">
              {muscleGroups.map(group => {
                const isRecommended = aiRecommendation?.recommended_group?.toLowerCase() === group.label.toLowerCase();
                return (
                  <div
                    key={group.id}
                    className={`wk-muscle-btn ${selectedMuscleGroup === group.id ? "selected" : ""} ${isRecommended && selectedMuscleGroup !== group.id ? "recommended" : ""}`}
                    onClick={() => setSelectedMuscleGroup(group.id)}
                  >
                    {group.label}
                    {isRecommended && <div style={{ fontSize: "10px", marginTop: "2px", opacity: 0.8 }}>AI pick</div>}
                  </div>
                );
              })}
            </div>
            <button
              className="wk-generate-btn"
              onClick={generateWorkout}
              disabled={loading || !selectedMuscleGroup}
            >
              {loading ? "Generating..." : selectedMuscleGroup ? `Generate ${selectedGroup?.label} workout` : "Select a muscle group"}
            </button>
          </div>

          {loading && (
            <div className="wk-loading">
              <div className="wk-spinner"></div>
              <div className="wk-loading-text">Generating your {selectedGroup?.label} workout...</div>
            </div>
          )}

          {workout && !loading && (
            <>
              <div className="wk-card">
                <div className="wk-card-title">{workout.workout_name}</div>
                <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px", lineHeight: "1.6" }}>
                  {workout.description}
                </p>
                <div className="wk-progress-wrap">
                  <div className="wk-progress-label">
                    <span>{completedCount} of {totalExercises} exercises completed</span>
                    <span style={{ color: "var(--accent)" }}>{progress}%</span>
                  </div>
                  <div className="wk-progress-bar">
                    <div className="wk-progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="wk-card">
                <div className="wk-card-title">📋 Exercises</div>
                {workout.exercises.map((exercise, i) => (
                  <div key={i} className={`wk-exercise-card ${completedExercises[exercise.name] ? "done" : ""}`}>
                    <div className="wk-exercise-header">
                      <div className="wk-exercise-info">
                        <div className={`wk-exercise-name ${completedExercises[exercise.name] ? "done" : ""}`}>
                          {exercise.name}
                          {exercise.equipment && (
                            <span className="wk-equipment-tag">{exercise.equipment}</span>
                          )}
                        </div>
                        <div className="wk-exercise-meta">
                          {exercise.muscle} &nbsp;·&nbsp;
                          <span className="wk-exercise-sets">{exercise.sets} sets × {exercise.reps} reps</span>
                        </div>
                      </div>
                      <div className="wk-exercise-actions">
                        <button className="wk-btn-sm" onClick={() => setActiveLog(activeLog === exercise.name ? null : exercise.name)}>
                          {completedExercises[exercise.name] ? "✅ Done" : "📝 Log"}
                        </button>
                        <button
                          className={`wk-btn-sm-outline ${!videoIds[exercise.name] ? "loading" : ""}`}
                          onClick={() => setActiveVideo(activeVideo === exercise.name ? null : exercise.name)}
                        >
                          {!videoIds[exercise.name] ? "⏳" : activeVideo === exercise.name ? "▼ Hide" : "▶ Video"}
                        </button>
                      </div>
                    </div>

                    {exercise.instructions && (
                      <div className="wk-instructions">{exercise.instructions}</div>
                    )}

                    {recommendations[exercise.name] && (
                      <div className="wk-weight-rec">
                        <div className="wk-weight-rec-label">🤖 AI Weight Recommendation</div>
                        {recommendations[exercise.name]}
                      </div>
                    )}

                    {activeLog === exercise.name && (
                      <div className="wk-log-panel">
                        <div className="wk-log-title">Log this exercise</div>
                        <div className="wk-log-row">
                          <div className="wk-log-input-group">
                            <label className="wk-log-label">Weight (kg)</label>
                            <input
                              className="wk-log-input"
                              type="number"
                              placeholder="e.g. 40"
                              step="0.5"
                              value={exerciseLogs[exercise.name]?.weight || ""}
                              onChange={(e) => setExerciseLogs(prev => ({
                                ...prev,
                                [exercise.name]: { ...prev[exercise.name], weight: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>How difficult was it?</div>
                        <div className="wk-difficulty-row">
                          {difficultyOptions.map(opt => (
                            <button
                              key={opt.id}
                              className={`wk-difficulty-btn ${exerciseLogs[exercise.name]?.difficulty === opt.id ? "selected" : ""}`}
                              style={exerciseLogs[exercise.name]?.difficulty === opt.id ? { background: opt.color } : {}}
                              onClick={() => setExerciseLogs(prev => ({
                                ...prev,
                                [exercise.name]: { ...prev[exercise.name], difficulty: opt.id }
                              }))}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <button
                          className="wk-save-btn"
                          onClick={() => handleLogWeight(exercise.name)}
                          disabled={savingLog[exercise.name]}
                        >
                          {savingLog[exercise.name] ? "Saving..." : "Save & Complete ✓"}
                        </button>
                      </div>
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
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: "var(--accent2)", marginBottom: "8px" }}>
                    WORKOUT COMPLETE!
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--muted)" }}>
                    Great work! Your weights have been logged. The AI Coach will use this data for future recommendations.
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
