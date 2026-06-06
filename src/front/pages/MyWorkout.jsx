import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { MobileNavbar } from "../components/MobileNavbar";

export const MyWorkout = () => {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loadingRec, setLoadingRec] = useState(true);
  const [videoIds, setVideoIds] = useState({});
  const [activeVideo, setActiveVideo] = useState(null);
  const [weightRecs, setWeightRecs] = useState({});
  const [unit, setUnit] = useState("kg");
  const [workoutPreview, setWorkoutPreview] = useState(true);
  const [routineFeedback, setRoutineFeedback] = useState(null);
  const [workoutFinished, setWorkoutFinished] = useState(false);

  // Difficulty rating per exercise
  const [exDifficulty, setExDifficulty] = useState({});
  const [pendingDifficultyEx, setPendingDifficultyEx] = useState(null); // index of exercise awaiting difficulty

  // Countdown + Timer
  const [countdown, setCountdown] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  // Break
  const [breakActive, setBreakActive] = useState(false);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [breakType, setBreakType] = useState("set");
  const breakRef = useRef(null);

  // Sets
  const [setData, setSetData] = useState({});
  const [exCompleted, setExCompleted] = useState({});
  const [validationAlert, setValidationAlert] = useState(null);

  const user = store.user || JSON.parse(sessionStorage.getItem("user") || "{}");
  const token = store.token || sessionStorage.getItem("token");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => { if (!token) navigate("/login"); }, [token]);
  useEffect(() => { if (token) fetchAiRecommendation(); }, [token]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  useEffect(() => {
    if (breakActive && breakSeconds > 0) {
      breakRef.current = setInterval(() => setBreakSeconds(s => {
        if (s <= 1) { setBreakActive(false); clearInterval(breakRef.current); return 0; }
        return s - 1;
      }), 1000);
    }
    return () => clearInterval(breakRef.current);
  }, [breakActive]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    dispatch({ type: "logout" });
    navigate("/");
  };

  const fetchAiRecommendation = async () => {
    setLoadingRec(true);
    try {
      const res = await fetch(`${backendUrl}/api/workout/recommend`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAiRecommendation(data);
        const groupMap = {
          "Chest": "chest", "Back": "back", "Shoulders": "shoulders",
          "Biceps": "biceps", "Triceps": "triceps", "Legs": "legs",
          "Glutes": "glutes", "Core": "core", "Full Body": "full body"
        };
        if (data.recommended_group && groupMap[data.recommended_group]) {
          setSelectedMuscleGroup(groupMap[data.recommended_group]);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoadingRec(false); }
  };

  const muscleGroups = [
    { id: "chest", label: "Chest" }, { id: "back", label: "Back" },
    { id: "shoulders", label: "Shoulders" }, { id: "biceps", label: "Biceps" },
    { id: "triceps", label: "Triceps" }, { id: "legs", label: "Legs" },
    { id: "glutes", label: "Glutes" }, { id: "core", label: "Core" },
    { id: "full body", label: "Full Body" },
  ];

  const getRestTime = () => {
    const goal = user?.fitness_goal?.toLowerCase() || "";
    if (goal.includes("strength") || goal.includes("power")) return { set: 180, exercise: 300, label: "3–5 min (strength goal)" };
    if (goal.includes("endurance") || goal.includes("cardio")) return { set: 45, exercise: 90, label: "30–60 sec (endurance goal)" };
    return { set: 90, exercise: 120, label: "60–90 sec (muscle gain goal)" };
  };

  const saveWorkoutToBackend = async (workoutData) => {
    try {
      await fetch(`${backendUrl}/api/workout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          user_id: user?.id,
          fitness_goal: user?.fitness_goal || "general fitness",
          exercises: workoutData.exercises.map(e => ({ name: e.name, muscle: e.muscle, is_completed: false })),
        }),
      });
    } catch (e) {}
  };

  const generateWorkout = async (difficultyPreference = null) => {
    if (!selectedMuscleGroup) { alert("Please select a muscle group first."); return; }
    setLoading(true);
    setWorkout(null);
    setVideoIds({});
    setActiveVideo(null);
    setSetData({});
    setExCompleted({});
    setExDifficulty({});
    setPendingDifficultyEx(null);
    setSeconds(0);
    setBreakActive(false);
    setWorkoutStarted(false);
    setTimerRunning(false);
    setWorkoutPreview(true);
    setRoutineFeedback(null);

    try {
      const res = await fetch(`${backendUrl}/api/workout/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fitness_goal: user?.fitness_goal || "general fitness",
          user_id: user?.id,
          muscle_group: selectedMuscleGroup,
          difficulty_preference: difficultyPreference,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setWorkout(data);
        initSetData(data.exercises);
        fetchVideos(data.exercises);
        fetchWeightRecs(data.exercises);
        await saveWorkoutToBackend(data);
      } else { alert(data.error || "Failed to generate workout"); }
    } catch (e) { alert("Connection error."); }
    finally { setLoading(false); }
  };

  const handleRoutineFeedback = (feedback) => {
    setRoutineFeedback(feedback);
    generateWorkout(feedback);
  };

  const startCountdown = () => {
    const steps = [3, 2, 1, "GO!"];
    let i = 0;
    setCountdown(steps[0]);
    countdownRef.current = setInterval(() => {
      i++;
      if (i < steps.length) {
        setCountdown(steps[i]);
      } else {
        clearInterval(countdownRef.current);
        setCountdown(null);
        setWorkoutStarted(true);
        setTimerRunning(true);
      }
    }, 800);
  };

  const initSetData = (exercises) => {
    const initial = {};
    exercises.forEach((ex, i) => {
      initial[i] = Array.from({ length: ex.sets }, () => ({ weight: "", reps: ex.reps, done: false }));
    });
    setSetData(initial);
  };

  const fetchVideos = async (exercises) => {
    for (const ex of exercises) {
      try {
        const res = await fetch(`${backendUrl}/api/youtube/search?q=${encodeURIComponent(ex.name)}`,
          { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok && data.video_id) setVideoIds(prev => ({ ...prev, [ex.name]: data.video_id }));
      } catch (e) {}
    }
  };

  const fetchWeightRecs = async (exercises) => {
    for (const ex of exercises) {
      try {
        const res = await fetch(`${backendUrl}/api/exercise-log/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ exercise_name: ex.name }),
        });
        const data = await res.json();
        if (res.ok) setWeightRecs(prev => ({ ...prev, [ex.name]: data.recommendation }));
      } catch (e) {}
    }
  };

  const startBreak = (type) => {
    const times = getRestTime();
    setBreakType(type);
    setBreakSeconds(type === "set" ? times.set : times.exercise);
    setBreakActive(true);
  };

  const skipBreak = () => { setBreakActive(false); setBreakSeconds(0); clearInterval(breakRef.current); };

  const updateSetField = (exIdx, setIdx, field, value) => {
    setSetData(prev => {
      const copy = { ...prev };
      copy[exIdx] = copy[exIdx].map((s, i) => i === setIdx ? { ...s, [field]: value } : s);
      return copy;
    });
  };

  const showAlert = (msg) => {
    setValidationAlert(msg);
    setTimeout(() => setValidationAlert(null), 3000);
  };

  const logExerciseSet = async (ex, s, difficulty) => {
    const weightKg = unit === "lbs" ? (parseFloat(s.weight) / 2.2046).toFixed(2) : s.weight;
    try {
      await fetch(`${backendUrl}/api/exercise-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          exercise_name: ex.name,
          weight: parseFloat(weightKg),
          sets: 1,
          reps: parseInt(s.reps) || ex.reps,
          difficulty: difficulty,
        }),
      });
    } catch (e) {}
  };

  const handleDifficultySelect = async (exIdx, difficulty) => {
    setExDifficulty(prev => ({ ...prev, [exIdx]: difficulty }));
    setPendingDifficultyEx(null);

    // Log all sets of this exercise with the selected difficulty
    const ex = workout.exercises[exIdx];
    const sets = setData[exIdx] || [];
    for (const s of sets) {
      if (s.done) await logExerciseSet(ex, s, difficulty);
    }
    startBreak("exercise");
  };

  const toggleSetDone = async (exIdx, setIdx) => {
    const s = setData[exIdx]?.[setIdx];
    if (!s) return;
    if (!s.done) {
      if (!s.weight) { showAlert("Please enter the weight before marking this set as done."); return; }
      if (!s.reps) { showAlert("Please enter the number of reps before marking this set as done."); return; }
    }
    const newDone = !s.done;
    updateSetField(exIdx, setIdx, "done", newDone);
    if (newDone) {
      const updatedSets = setData[exIdx].map((st, i) => i === setIdx ? { ...st, done: true } : st);
      const allSetsDone = updatedSets.every(st => st.done);
      if (allSetsDone) {
        setExCompleted(prev => ({ ...prev, [exIdx]: true }));
        // Show difficulty rating instead of logging immediately
        setPendingDifficultyEx(exIdx);
      } else {
        startBreak("set");
      }
    }
  };

const finishWorkout = () => {
  setTimerRunning(false);
  setPendingDifficultyEx(null);
  setWorkoutFinished(true);
}; 

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const fmtBreak = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const kgToLbs = (v) => v ? (parseFloat(v) * 2.2046).toFixed(1) : "";
  const getDisplayWeight = (w) => unit === "lbs" && w ? kgToLbs(w) : w;

  const totalEx = workout?.exercises?.length || 0;
  const doneCount = Object.values(exCompleted).filter(Boolean).length;
  const progress = totalEx > 0 ? Math.round((doneCount / totalEx) * 100) : 0;
  const allDone = totalEx > 0 && doneCount === totalEx;
  const restTimes = getRestTime();
  const selectedGroup = muscleGroups.find(g => g.id === selectedMuscleGroup);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root{--bg:#080c10;--bg2:#0d1318;--accent:#00e5ff;--accent2:#00ff88;--text:#f0f4f8;--muted:#6b7c8f;--card:rgba(255,255,255,0.04);--border:rgba(255,255,255,0.08);}
        .wk-body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh;}
        .wk-nav{display:flex;align-items:center;height:56px;background:rgba(8,12,16,0.97);border-bottom:1px solid var(--border);padding:0 20px;width:100%;position:sticky;top:0;z-index:100;}
        .wk-logo{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;color:var(--accent);white-space:nowrap;flex-shrink:0;margin-right:24px;cursor:pointer;}
        .wk-nav-links{display:flex;gap:24px;flex:1;}
        .wk-nav-links a{color:var(--muted);text-decoration:none;font-size:13px;font-weight:500;white-space:nowrap;transition:color 0.2s;cursor:pointer;}
        .wk-nav-links a:hover{color:var(--text);}
        .wk-nav-links a.active{color:var(--accent);}
        .wk-nav-cta{display:flex;gap:8px;align-items:center;flex-shrink:0;margin-left:24px;}
        .wk-btn-ghost{background:transparent;border:1px solid var(--border);color:var(--text);padding:6px 14px;border-radius:6px;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;}
        .wk-btn-danger{background:transparent;border:1px solid rgba(255,80,80,0.3);color:#ff6b6b;padding:6px 14px;border-radius:6px;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;}
        .wk-page{padding:28px 24px;max-width:1000px;margin:0 auto;width:100%;}
        .wk-section-label{font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--accent);margin-bottom:4px;}
        .wk-page-title{font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:2px;margin-bottom:24px;}
        .wk-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px;}
        .wk-card-title{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:1px;margin-bottom:14px;}
        .wk-goal-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(0,229,255,0.08);border:1px solid rgba(0,229,255,0.2);color:var(--accent);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500;margin-bottom:16px;}
        .wk-countdown-overlay{position:fixed;inset:0;background:rgba(8,12,16,0.95);display:flex;align-items:center;justify-content:center;z-index:1000;}
        .wk-countdown-num{font-family:'Bebas Neue',sans-serif;font-size:clamp(120px,20vw,200px);color:var(--accent);letter-spacing:4px;animation:wk-pop 0.6s ease both;}
        .wk-countdown-num.go{color:var(--accent2);font-size:clamp(80px,15vw,150px);}
        @keyframes wk-pop{0%{transform:scale(0.5);opacity:0}50%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        .wk-ai-rec{background:rgba(0,229,255,0.04);border:1px solid rgba(0,229,255,0.2);border-radius:12px;padding:18px 20px;margin-bottom:16px;}
        .wk-ai-rec-badge{font-size:11px;color:var(--accent);font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;}
        .wk-ai-rec-group{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--accent2);letter-spacing:1px;margin-bottom:4px;}
        .wk-ai-rec-reason{font-size:13px;color:var(--muted);line-height:1.6;}
        .wk-muscle-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
        .wk-muscle-btn{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px 8px;text-align:center;cursor:pointer;transition:all 0.2s;font-size:13px;font-weight:500;color:var(--muted);font-family:'DM Sans',sans-serif;}
        .wk-muscle-btn:hover{border-color:var(--accent);color:var(--text);}
        .wk-muscle-btn.selected{border-color:var(--accent);background:rgba(0,229,255,0.08);color:var(--accent);font-weight:600;}
        .wk-muscle-btn.recommended{border-color:var(--accent2);background:rgba(0,255,136,0.06);color:var(--accent2);}
        .wk-muscle-btn.recommended.selected{border-color:var(--accent);background:rgba(0,229,255,0.08);color:var(--accent);}
        .wk-ai-pick{font-size:10px;margin-top:2px;opacity:0.8;}
        .wk-generate-btn{background:var(--accent);color:#000;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;border:none;font-family:'DM Sans',sans-serif;transition:opacity 0.2s;width:100%;}
        .wk-generate-btn:hover{opacity:0.85;}
        .wk-generate-btn:disabled{opacity:0.4;cursor:not-allowed;}
        .wk-feedback-btn{flex:1;padding:10px 8px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;text-align:center;}
        .wk-feedback-btn:hover{border-color:var(--accent);}
        .wk-feedback-btn.easy{border-color:rgba(0,255,136,0.4);color:var(--accent2);}
        .wk-feedback-btn.hard{border-color:rgba(255,107,107,0.4);color:#ff6b6b;}
        .wk-workout-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px;}
        .wk-workout-info{flex:1;}
        .wk-workout-info h2{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:1px;margin-bottom:4px;}
        .wk-workout-info p{font-size:13px;color:var(--muted);}
        .wk-timer-area{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;}
        .wk-timer-display{font-family:'Bebas Neue',sans-serif;font-size:36px;color:var(--accent);letter-spacing:2px;font-variant-numeric:tabular-nums;line-height:1;}
        .wk-timer-controls{display:flex;align-items:center;gap:8px;}
        .wk-timer-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;animation:wk-pulse 1.5s infinite;}
        @keyframes wk-pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        .wk-timer-btn{background:none;border:1px solid var(--border);border-radius:6px;padding:4px 10px;cursor:pointer;color:var(--muted);font-size:14px;line-height:1;}
        .wk-timer-btn:hover{border-color:var(--accent);color:var(--accent);}
        .wk-unit-toggle{display:flex;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:6px;overflow:hidden;}
        .wk-unit-btn{padding:4px 12px;border:none;background:none;color:var(--muted);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;}
        .wk-unit-btn.active{background:var(--accent);color:#000;font-weight:600;}
        .wk-progress-wrap{margin-bottom:12px;}
        .wk-progress-label{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:6px;}
        .wk-progress-bar{height:5px;background:var(--border);border-radius:3px;overflow:hidden;}
        .wk-progress-fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:3px;transition:width 0.5s ease;}
        .wk-science-note{font-size:12px;color:var(--muted);padding:8px 12px;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:8px;margin-top:12px;}
        .wk-break{background:rgba(0,229,255,0.06);border:1px solid rgba(0,229,255,0.25);border-radius:12px;padding:16px 20px;margin-bottom:16px;display:flex;align-items:center;gap:16px;}
        .wk-break-left{flex:1;}
        .wk-break-left h3{font-size:14px;font-weight:600;color:var(--accent);margin-bottom:3px;}
        .wk-break-left p{font-size:12px;color:var(--muted);}
        .wk-break-right{display:flex;align-items:center;gap:10px;}
        .wk-break-clock{font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--accent);letter-spacing:1px;font-variant-numeric:tabular-nums;min-width:52px;text-align:right;}
        .wk-skip-btn{background:transparent;border:1px solid rgba(0,229,255,0.4);color:var(--accent);padding:6px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;}
        .wk-skip-btn:hover{background:rgba(0,229,255,0.08);}
        .wk-alert{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#ff6b6b;color:#fff;padding:12px 24px;border-radius:8px;font-size:13px;font-weight:500;z-index:999;box-shadow:0 4px 20px rgba(0,0,0,0.4);animation:wk-slideUp 0.3s ease;}
        @keyframes wk-slideUp{from{transform:translateX(-50%) translateY(20px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
        .wk-ex-card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:12px;transition:all 0.2s;}
        .wk-ex-card.active{border-color:rgba(0,229,255,0.3);background:rgba(0,229,255,0.03);}
        .wk-ex-card.done{opacity:0.5;}
        .wk-ex-card.upcoming{opacity:0.7;}
        .wk-ex-header{display:flex;align-items:flex-start;gap:12px;}
        .wk-ex-num{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--muted);flex-shrink:0;margin-top:1px;}
        .wk-ex-card.active .wk-ex-num{background:var(--accent);color:#000;border-color:var(--accent);}
        .wk-ex-card.done .wk-ex-num{background:rgba(0,255,136,0.15);border-color:rgba(0,255,136,0.3);color:var(--accent2);}
        .wk-ex-info{flex:1;min-width:0;}
        .wk-ex-name{font-size:14px;font-weight:600;margin-bottom:3px;}
        .wk-ex-meta{font-size:12px;color:var(--muted);}
        .wk-ex-tag{display:inline-block;font-size:10px;padding:1px 7px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid var(--border);color:var(--muted);margin-left:6px;}
        .wk-ex-actions{display:flex;gap:8px;align-items:center;flex-shrink:0;}
        .wk-btn-sm{background:transparent;border:1px solid var(--border);color:var(--muted);padding:5px 10px;border-radius:6px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;}
        .wk-btn-sm:hover{border-color:var(--accent);color:var(--accent);}
        .wk-btn-sm.loading{opacity:0.4;cursor:default;}
        .wk-ex-details{margin-top:14px;padding-top:14px;border-top:1px solid var(--border);}
        .wk-instructions{font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:14px;}
        .wk-ai-weight-rec{font-size:12px;color:var(--muted);margin-bottom:14px;padding:10px 12px;background:rgba(0,229,255,0.04);border:1px solid rgba(0,229,255,0.12);border-radius:8px;line-height:1.5;}
        .wk-ai-weight-label{font-size:11px;color:var(--accent);font-weight:600;margin-bottom:3px;}
        .wk-sets-table{width:100%;border-collapse:collapse;margin-bottom:12px;}
        .wk-sets-table th{font-size:11px;color:var(--muted);font-weight:500;text-align:left;padding:4px 8px 8px;border-bottom:1px solid var(--border);}
        .wk-sets-table th:last-child{text-align:center;}
        .wk-sets-table td{padding:7px 8px;border-bottom:1px solid var(--border);vertical-align:middle;}
        .wk-sets-table tr:last-child td{border-bottom:none;}
        .wk-set-label{font-size:13px;color:var(--muted);}
        .wk-set-input{width:70px;background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:6px;padding:5px 8px;font-size:13px;color:var(--text);text-align:center;font-family:'DM Sans',sans-serif;outline:none;}
        .wk-set-input:focus{border-color:var(--accent);}
        .wk-set-input:disabled{opacity:0.4;}
        .wk-set-check{width:24px;height:24px;border-radius:50%;border:1px solid var(--border);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;margin:0 auto;font-size:12px;color:transparent;transition:all 0.2s;}
        .wk-set-check:hover{border-color:var(--accent2);}
        .wk-set-check.done{background:rgba(0,255,136,0.15);border-color:rgba(0,255,136,0.4);color:var(--accent2);}
        .wk-diff-row{display:flex;gap:8px;margin-top:12px;padding:12px;background:rgba(0,229,255,0.04);border:1px solid rgba(0,229,255,0.12);border-radius:8px;}
        .wk-diff-label{font-size:12px;color:var(--muted);margin-bottom:8px;font-weight:600;}
        .wk-diff-btn{flex:1;padding:8px 4px;border-radius:6px;border:1px solid var(--border);background:transparent;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;text-align:center;}
        .wk-diff-btn.very-easy{border-color:rgba(0,255,136,0.5);color:var(--accent2);}
        .wk-diff-btn.easy{border-color:rgba(0,229,255,0.5);color:var(--accent);}
        .wk-diff-btn.hard{border-color:rgba(255,165,0,0.5);color:#f97316;}
        .wk-diff-btn.very-hard{border-color:rgba(255,107,107,0.5);color:#ff6b6b;}
        .wk-diff-btn:hover{opacity:0.8;transform:scale(1.02);}
        .wk-loading{text-align:center;padding:48px;}
        .wk-spinner{width:40px;height:40px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:wk-spin 0.8s linear infinite;margin:0 auto;}
        .wk-loading-text{font-size:14px;color:var(--muted);margin-top:16px;}
        @keyframes wk-spin{to{transform:rotate(360deg)}}
        .wk-complete{text-align:center;padding:40px;background:rgba(0,255,136,0.04);border:1px solid rgba(0,255,136,0.2);border-radius:12px;margin-bottom:16px;}
        .wk-complete-title{font-family:'Bebas Neue',sans-serif;font-size:32px;color:var(--accent2);letter-spacing:2px;margin-bottom:8px;}
        .wk-complete-time{font-family:'Bebas Neue',sans-serif;font-size:56px;color:var(--accent);letter-spacing:2px;}
        .wk-complete-time-label{font-size:12px;color:var(--muted);margin-bottom:24px;}
        .wk-comparison{background:rgba(0,229,255,0.04);border:1px solid rgba(0,229,255,0.15);border-radius:10px;padding:14px 18px;margin:16px 0;text-align:left;}
        .wk-comparison-title{font-size:11px;color:var(--accent);font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;}
        .wk-comparison-row{display:flex;justify-content:space-between;font-size:13px;padding:4px 0;}
        .wk-comparison-label{color:var(--muted);}
        .wk-comparison-val{font-weight:600;}
        .wk-comparison-val.up{color:var(--accent2);}
        .wk-comparison-val.down{color:#ff6b6b;}
        .wk-mood-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;}
        .wk-mood-btn{background:var(--card);border:1px solid var(--border);padding:8px 16px;border-radius:20px;font-size:13px;cursor:pointer;color:var(--text);font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .wk-mood-btn:hover{border-color:var(--accent);color:var(--accent);}
        .wk-mood-btn.selected{border-color:var(--accent);background:rgba(0,229,255,0.08);color:var(--accent);}
        .wk-new-btn{background:var(--accent);color:#000;padding:10px 28px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;border:none;font-family:'DM Sans',sans-serif;}
        .wk-progress-btn{background:transparent;border:1px solid var(--accent2);color:var(--accent2);padding:10px 28px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:10px;}
        @keyframes wk-fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .wk-page>*{animation:wk-fadeUp 0.5s ease both;}
        @media (max-width: 768px) { .wk-nav { display: none !important; } }
      `}</style>

      {countdown !== null && (
        <div className="wk-countdown-overlay">
          <div className={`wk-countdown-num ${countdown === "GO!" ? "go" : ""}`} key={countdown}>
            {countdown}
          </div>
        </div>
      )}

      {validationAlert && <div className="wk-alert">⚠️ {validationAlert}</div>}

      <div className="wk-body">
        <MobileNavbar />
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

          {user?.fitness_goal && <div className="wk-goal-tag">🎯 Goal: {user.fitness_goal}</div>}

          {/* AI RECOMMENDATION */}
          {!workout && !loading && (
            <div className="wk-ai-rec">
              <div className="wk-ai-rec-badge">🤖 AI Coach — Today's recommendation</div>
              {loadingRec ? (
                <div style={{ fontSize: "13px", color: "var(--muted)", fontStyle: "italic" }}>Analyzing your training history...</div>
              ) : aiRecommendation ? (
                <>
                  <div className="wk-ai-rec-group">→ {aiRecommendation.recommended_group}</div>
                  <div className="wk-ai-rec-reason">{aiRecommendation.reason}</div>
                </>
              ) : (
                <div className="wk-ai-rec-reason">Select a muscle group below to get started.</div>
              )}
            </div>
          )}

          {/* MUSCLE GROUP SELECTOR */}
          {!workout && !loading && (
            <div className="wk-card">
              <div className="wk-card-title">Select muscle group</div>
              <div className="wk-muscle-grid">
                {muscleGroups.map(group => {
                  const isRec = aiRecommendation?.recommended_group?.toLowerCase() === group.label.toLowerCase();
                  return (
                    <div
                      key={group.id}
                      className={`wk-muscle-btn ${selectedMuscleGroup === group.id ? "selected" : ""} ${isRec && selectedMuscleGroup !== group.id ? "recommended" : ""}`}
                      onClick={() => setSelectedMuscleGroup(group.id)}
                    >
                      {group.label}
                      {isRec && <div className="wk-ai-pick">AI pick</div>}
                    </div>
                  );
                })}
              </div>
              <button className="wk-generate-btn" onClick={() => generateWorkout()} disabled={!selectedMuscleGroup}>
                {selectedMuscleGroup ? `Generate ${selectedGroup?.label} workout` : "Select a muscle group"}
              </button>
            </div>
          )}

          {loading && (
            <div className="wk-loading">
              <div className="wk-spinner"></div>
              <div className="wk-loading-text">
                {routineFeedback === "easy" ? "Generating a more challenging routine..." :
                 routineFeedback === "hard" ? "Generating a lighter routine..." :
                 `Generating your ${selectedGroup?.label} workout...`}
              </div>
            </div>
          )}

          {/* WORKOUT PREVIEW */}
          {workout && !loading && !allDone && !workoutFinished && workoutPreview && (
            <div className="wk-card">
              <div className="wk-card-title">📋 {workout.workout_name}</div>
              <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px", lineHeight: "1.6" }}>{workout.description}</p>

              {workout.exercises.map((ex, i) => (
                <div key={i} style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "3px" }}>
                    {ex.name}
                    {ex.equipment && <span className="wk-ex-tag">{ex.equipment}</span>}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "6px" }}>
                    {ex.muscle} · <span style={{ color: "var(--accent)" }}>{ex.sets} sets × {ex.reps} reps</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.6" }}>{ex.instructions}</p>
                  {weightRecs[ex.name] && (
                    <div className="wk-ai-weight-rec" style={{ marginTop: "8px" }}>
                      <div className="wk-ai-weight-label">🤖 AI Weight Recommendation</div>
                      {weightRecs[ex.name]}
                    </div>
                  )}
                </div>
              ))}

              {/* AI COACH FEEDBACK */}
              <div style={{ marginTop: "20px", padding: "16px", background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.12)", borderRadius: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "14px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>
                  🤖 How does this routine feel?
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
                  <button
                    className="wk-feedback-btn easy"
                    onClick={() => handleRoutineFeedback("easy")}
                    style={{ flex: 1, padding: "10px", fontSize: "12px", opacity: "0.7" }}
                  >
                    😅 Too easy
                  </button>
                  <button
                    onClick={() => { setWorkoutPreview(false); startCountdown(); }}
                    style={{
                      flex: 2, padding: "16px", borderRadius: "10px", border: "none",
                      background: "linear-gradient(135deg, #00ff88, #00e5ff)",
                      color: "#000", fontWeight: "800", fontSize: "18px", cursor: "pointer",
                      fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "2px",
                      boxShadow: "0 0 20px rgba(0,255,136,0.4)", transition: "transform 0.2s",
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = "scale(1.03)"}
                    onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                  >
                    🔥 LET'S GO!
                  </button>
                  <button
                    className="wk-feedback-btn hard"
                    onClick={() => handleRoutineFeedback("hard")}
                    style={{ flex: 1, padding: "10px", fontSize: "12px", opacity: "0.7" }}
                  >
                    😰 Too hard
                  </button>
                </div>
              </div>
            </div>
            
          )}

          {/* ACTIVE WORKOUT */}
          {workout && !loading && !allDone && !workoutFinished && !workoutPreview && (
            <>
              {/* WORKOUT HEADER */}
              <div className="wk-card">
                <div className="wk-workout-header">
                  <div className="wk-workout-info">
                    <h2>{workout.workout_name}</h2>
                    <p>{workout.description}</p>
                  </div>
                  {workoutStarted && (
                    <div className="wk-timer-area">
                      <div className="wk-timer-display">{fmtTime(seconds)}</div>
                      <div className="wk-timer-controls">
                        <div className="wk-timer-dot" style={{ animationPlayState: timerRunning ? "running" : "paused", background: timerRunning ? "#22c55e" : "var(--muted)" }}></div>
                        <button className="wk-timer-btn" onClick={() => setTimerRunning(r => !r)}>
                          {timerRunning ? "⏸" : "▶"}
                        </button>
                        <div className="wk-unit-toggle">
                          <button className={`wk-unit-btn ${unit === "kg" ? "active" : ""}`} onClick={() => setUnit("kg")}>kg</button>
                          <button className={`wk-unit-btn ${unit === "lbs" ? "active" : ""}`} onClick={() => setUnit("lbs")}>lbs</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="wk-progress-wrap">
                  <div className="wk-progress-label">
                    <span>{doneCount} of {totalEx} exercises completed</span>
                    <span style={{ color: "var(--accent)" }}>{progress}%</span>
                  </div>
                  <div className="wk-progress-bar">
                    <div className="wk-progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
                <div className="wk-science-note">
                  🔬 Recommended rest: <strong>{restTimes.label}</strong>
                </div>
              </div>

              {/* BREAK BANNER */}
              {breakActive && (
                <div className="wk-break">
                  <div style={{ fontSize: "24px" }}>💧</div>
                  <div className="wk-break-left">
                    <h3>{breakType === "set" ? "Rest between sets" : "Exercise complete — hydrate!"}</h3>
                    <p>{breakType === "set" ? "Drink water · rest before your next set" : "Great work! Rest before the next exercise"}</p>
                  </div>
                  <div className="wk-break-right">
                    <div className="wk-break-clock">{fmtBreak(breakSeconds)}</div>
                    <button className="wk-skip-btn" onClick={skipBreak}>Skip</button>
                  </div>
                </div>
              )}

              {/* EXERCISES */}
              <div className="wk-card">
                <div className="wk-card-title">📋 Exercises</div>
                {workout.exercises.map((ex, ei) => {
                  const isDone = exCompleted[ei];
                  const isActive = workoutStarted && !isDone && Object.values(exCompleted).filter(Boolean).length === ei;
                  const isUpcoming = workoutStarted && !isDone && !isActive;
                  const sets = setData[ei] || [];
                  const isPendingDiff = pendingDifficultyEx === ei;

                  return (
                    <div key={ei} className={`wk-ex-card ${isDone ? "done" : isActive ? "active" : isUpcoming ? "upcoming" : ""}`}>
                      <div className="wk-ex-header">
                        <div className="wk-ex-num">{isDone ? "✓" : ei + 1}</div>
                        <div className="wk-ex-info">
                          <div className="wk-ex-name">
                            {ex.name}
                            {ex.equipment && <span className="wk-ex-tag">{ex.equipment}</span>}
                            {isDone && exDifficulty[ei] && (
                              <span style={{ marginLeft: "8px", fontSize: "10px", color: "var(--muted)" }}>
                                {exDifficulty[ei] === "very_easy" ? "😅 Very easy" :
                                 exDifficulty[ei] === "easy" ? "👍 Easy" :
                                 exDifficulty[ei] === "hard" ? "💪 Hard" : "🔥 Very hard"}
                              </span>
                            )}
                          </div>
                          <div className="wk-ex-meta">
                            {ex.muscle} · <span style={{ color: "var(--accent)" }}>{ex.sets} sets × {ex.reps} reps</span>
                          </div>
                        </div>
                        <div className="wk-ex-actions">
                          {!isUpcoming && (
                            <button
                              className={`wk-btn-sm ${!videoIds[ex.name] ? "loading" : ""}`}
                              onClick={() => setActiveVideo(activeVideo === ex.name ? null : ex.name)}
                            >
                              {!videoIds[ex.name] ? "⏳" : activeVideo === ex.name ? "▼ Hide" : "▶ Video"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Upcoming exercise preview */}
                      {isUpcoming && (
                        <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--muted)" }}>
                          {ex.sets} sets × {ex.reps} reps · {ex.equipment}
                        </div>
                      )}

                      {isActive && (
                        <div className="wk-ex-details">
                          <p className="wk-instructions">{ex.instructions}</p>
                          {weightRecs[ex.name] && (
                            <div className="wk-ai-weight-rec">
                              <div className="wk-ai-weight-label">🤖 AI Weight Recommendation</div>
                              {weightRecs[ex.name]}
                            </div>
                          )}
                          <table className="wk-sets-table">
                            <thead>
                              <tr>
                                <th>Set</th>
                                <th>Weight ({unit})</th>
                                <th>Reps</th>
                                <th style={{ textAlign: "center" }}>Done</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sets.map((s, si) => (
                                <tr key={si}>
                                  <td><div className="wk-set-label">Set {si + 1}</div></td>
                                  <td>
                                    <input
                                      className="wk-set-input"
                                      type="number"
                                      placeholder="—"
                                      min="0"
                                      step="0.5"
                                      value={getDisplayWeight(s.weight)}
                                      onChange={e => {
                                        const val = unit === "lbs" ? (parseFloat(e.target.value) / 2.2046).toFixed(2) : e.target.value;
                                        updateSetField(ei, si, "weight", val);
                                      }}
                                      onBlur={e => {
                                        const val = unit === "lbs" ? (parseFloat(e.target.value) / 2.2046).toFixed(2) : e.target.value;
                                        if (val) {
                                          setSetData(prev => {
                                            const copy = { ...prev };
                                            copy[ei] = copy[ei].map((s, idx) =>
                                              idx !== si && !s.weight && !s.done ? { ...s, weight: val } : s
                                            );
                                            return copy;
                                          });
                                        }
                                      }}
                                      disabled={s.done}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      className="wk-set-input"
                                      type="number"
                                      min="1"
                                      max="50"
                                      value={s.reps}
                                      onChange={e => updateSetField(ei, si, "reps", e.target.value)}
                                      disabled={s.done}
                                      style={{ width: "56px" }}
                                    />
                                  </td>
                                  <td>
                                    <button
                                      className={`wk-set-check ${s.done ? "done" : ""}`}
                                      onClick={() => toggleSetDone(ei, si)}
                                    >
                                      {s.done ? "✓" : ""}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Difficulty rating after all sets done */}
                          {isPendingDiff && (
                            <div style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: "10px", padding: "14px", marginTop: "8px" }}>
                              <div className="wk-diff-label">🤖 How was this exercise?</div>
                              <div className="wk-diff-row">
                                <button className="wk-diff-btn very-easy" onClick={() => handleDifficultySelect(ei, "very_easy")}>😅 Too easy</button>
                                <button className="wk-diff-btn easy" onClick={() => handleDifficultySelect(ei, "easy")}>👍 Easy</button>
                                <button className="wk-diff-btn hard" onClick={() => handleDifficultySelect(ei, "hard")}>💪 Hard</button>
                                <button className="wk-diff-btn very-hard" onClick={() => handleDifficultySelect(ei, "very_hard")}>🔥 Max effort</button>
                              </div>
                            </div>
                          )}

                          {activeVideo === ex.name && videoIds[ex.name] && (
                            <div style={{ marginTop: "12px", borderRadius: "8px", overflow: "hidden" }}>
                              <iframe
                                src={`https://www.youtube.com/embed/${videoIds[ex.name]}`}
                                title={ex.name}
                                width="100%"
                                height="220"
                                style={{ border: "none" }}
                                allowFullScreen
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  className="wk-generate-btn"
                  onClick={() => { setWorkout(null); setTimerRunning(false); setSeconds(0); setWorkoutStarted(false); }}
                  style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", flex: 1 }}
                >
                  Change muscle group
                </button>
                <button
                  className="wk-generate-btn"
                  onClick={finishWorkout}
                  style={{ flex: 1, background: "rgba(255,107,107,0.15)", border: "1px solid rgba(255,107,107,0.4)", color: "#ff6b6b" }}
                >
                  Finish workout
                </button>
              </div>
            </>
          )}

          {/* COMPLETION */}
          {(allDone || workoutFinished) && (
            <CompletionScreen
              seconds={seconds}
              fmtTime={fmtTime}
              workout={workout}
              exCompleted={exCompleted}
              onNewWorkout={() => { setWorkout(null); setExCompleted({}); setSeconds(0); setTimerRunning(false); setWorkoutStarted(false); setWorkoutPreview(true); setRoutineFeedback(null); setExDifficulty({}); setPendingDifficultyEx(null); }}
              token={token}
              backendUrl={backendUrl}
              navigate={navigate}
              setData={setData}
              unit={unit}
            />
          )}
        </div>
      </div>
    </>
  );
};

const CompletionScreen = ({ seconds, fmtTime, workout,exCompleted, onNewWorkout, token, backendUrl, navigate, setData, unit }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const [prevVolume, setPrevVolume] = useState(null);

  const moods = [
    { id: "great", label: "🔥 Amazing" },
    { id: "good", label: "😊 Good" },
    { id: "okay", label: "😐 Okay" },
    { id: "tired", label: "😴 Tired" },
    { id: "low", label: "😔 Exhausted" },
  ];

  const todayVolume = Object.values(setData).flat().reduce((total, s) => {
    if (s.done && s.weight && s.reps) {
      const weightKg = unit === "lbs" ? parseFloat(s.weight) / 2.2046 : parseFloat(s.weight);
      return total + weightKg * parseInt(s.reps);
    }
    return total;
  }, 0);

  // Fetch previous session volume for same muscle group
  useEffect(() => {
    if (!workout?.muscle_group) return;
    const fetchPrevVolume = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/exercise-log/muscle-volume/${encodeURIComponent(workout.muscle_group)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPrevVolume(data.previous_volume);
        }
      } catch (e) {}
    };
    fetchPrevVolume();
  }, []);

  const volumeDiff = prevVolume !== null ? Math.round(todayVolume - prevVolume) : null;
  const volumePct = prevVolume && prevVolume > 0 ? Math.round(((todayVolume - prevVolume) / prevVolume) * 100) : null;

  const saveMood = async (moodId) => {
    setSelectedMood(moodId);
    try {
      await fetch(`${backendUrl}/api/mood`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mood: moodId }),
      });
      setMoodSaved(true);
    } catch (e) {}
  };

  return (
    <div className="wk-complete">
      <div style={{ fontSize: "56px", marginBottom: "12px" }}>🎉</div>
      <div className="wk-complete-title">WORKOUT COMPLETE!</div>
      <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "16px" }}>
        You crushed {Object.values(exCompleted).filter(Boolean).length} exercises
      </p>
      <div className="wk-complete-time">{fmtTime(seconds)}</div>
      <div className="wk-complete-time-label">Total workout time</div>

      {/* VOLUME COMPARISON */}
      {todayVolume > 0 && (
        <div className="wk-comparison">
          <div className="wk-comparison-title">📊 {workout?.muscle_group} Session Summary</div>
          <div className="wk-comparison-row">
            <span className="wk-comparison-label">Total volume today</span>
            <span className="wk-comparison-val up">{Math.round(todayVolume).toLocaleString()} kg</span>
          </div>
          {prevVolume !== null && (
            <div className="wk-comparison-row">
              <span className="wk-comparison-label">vs last {workout?.muscle_group} session</span>
              <span className={`wk-comparison-val ${volumeDiff >= 0 ? "up" : "down"}`}>
                {volumeDiff >= 0 ? `+${volumeDiff}` : volumeDiff} kg ({volumePct >= 0 ? `+${volumePct}` : volumePct}%)
              </span>
            </div>
          )}
          <div className="wk-comparison-row">
            <span className="wk-comparison-label">Exercises completed</span>
            <span className="wk-comparison-val">{workout?.exercises?.length}</span>
          </div>
        </div>
      )}

      {!moodSaved ? (
        <>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "14px" }}>
            How do you feel after this workout?
          </p>
          <div className="wk-mood-row">
            {moods.map(m => (
              <button
                key={m.id}
                className={`wk-mood-btn ${selectedMood === m.id ? "selected" : ""}`}
                onClick={() => saveMood(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p style={{ fontSize: "13px", color: "var(--accent2)", marginBottom: "20px" }}>
          ✅ Mood logged! Great work today.
        </p>
      )}

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
        <button className="wk-new-btn" onClick={onNewWorkout}>Start a new workout</button>
        <button className="wk-progress-btn" onClick={() => navigate("/progress")}>
          See your progress →
        </button>
      </div>
      <button
        onClick={() => {
          const text = `💪 Just crushed a ${workout?.muscle_group} workout on GymMind AI!\n\n🏋️ ${workout?.exercises?.length} exercises completed\n⏱️ Time: ${fmtTime(seconds)}\n📊 Total volume: ${Math.round(todayVolume).toLocaleString()} kg\n\nTry GymMind AI — your AI-powered fitness coach! 🤖`;
          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
        }}
        style={{ marginTop: "12px", background: "#25D366", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", maxWidth: "300px", margin: "12px auto 0" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Share results on WhatsApp
      </button>
    </div>
  );
};

export default MyWorkout; 