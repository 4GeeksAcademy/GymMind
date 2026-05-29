import React, { useState, useEffect } from "react";
import "../index.css";

const moods = [
  { id: "great", emoji: "🔥", label: "Great" },
  { id: "good", emoji: "😊", label: "Good" },
  { id: "okay", emoji: "😐", label: "Okay" },
  { id: "tired", emoji: "😴", label: "Tired" },
  { id: "low", emoji: "😔", label: "Low" },
];

const moodContent = {
  great: {
    title: "You're on fire today!",
    message: "Push yourself. Your energy is your advantage today.",
    emoji: "🔥",
  },

  good: {
    title: "Feeling Good Today",
    message: "Small progress is still progress.",
    emoji: "😊",
  },

  okay: {
    title: "Steady is okay",
    message: "Consistency matters more than perfection.",
    emoji: "😐",
  },

  tired: {
    title: "Your body needs balance",
    message: "Recovery is part of growth too.",
    emoji: "😴",
  },

  low: {
    title: "Take it one step at a time",
    message: "Even showing up today is progress.",
    emoji: "😔",
  },
};
export const MoodCheck = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [history, setHistory] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const latestMood =
    history.length > 0 ? history[0].mood : "good";

  const currentMoodData =
    moodContent[selectedMood || latestMood] || moodContent.good;

  const moodStats = {
    great: history.filter(h => h.mood === "great").length,
    good: history.filter(h => h.mood === "good").length,
    okay: history.filter(h => h.mood === "okay").length,
    tired: history.filter(h => h.mood === "tired").length,
    low: history.filter(h => h.mood === "low").length,
  };
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const token = sessionStorage.getItem("token");
  if (!user?.id || !token) {
    return <div>Unauthorized</div>;
  }

  // GET HISTORY
  const fetchMoodHistory = async () => {
    try {
      console.log("TOKEN:", token);
      console.log("USER:", user);

      const response = await fetch(
        `${backendUrl}/api/mood`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();


      if (response.ok) {
        setHistory(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  // SUBMIT MOOD
  const handleSubmit = async () => {
    if (!selectedMood) {
      return alert("Please select a mood first!");
    }

    try {
      const response = await fetch(`${backendUrl}/api/mood`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood: selectedMood,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        return alert(data.error);
      }

      setRecommendation({
        intensity: data.training_intensity,
        focus: data.recommended_focus,
      });

      await fetchMoodHistory();
      setSelectedMood(null);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="mood-check">

      <div className="moodcheck-card-title">
        😊 Select your mood
      </div>

      <div className="mood-options">
        {moods.map((m) => (
          <button
            key={m.id}
            className={selectedMood === m.id ? "selected" : ""}
            onClick={() => setSelectedMood(m.id)}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      <button
        className="moodcheck-submit-btn"
        onClick={handleSubmit}
      >
        Submit mood check
      </button>

      <div className={`mood-today-card ${selectedMood || latestMood}`}>

        <div className="mood-today-top">

          <span className="mood-big-emoji">
            {currentMoodData.emoji}
          </span>

          <div>
            <h3>{currentMoodData.title}</h3>
            <p>{currentMoodData.message}</p>
          </div>

        </div>

        <span className="mood-date-label">
          Checked in today
        </span>

      </div>
      {recommendation && (
        <div className="ai-recommendation-card">

          <h3>🤖 AI Training Recommendation</h3>

          <div className="recommendation-row">
            <span>Training Intensity:</span>
            <strong>{recommendation.intensity}</strong>
          </div>

          <div className="recommendation-row">
            <span>Recommended Focus:</span>
            <strong>{recommendation.focus}</strong>
          </div>

        </div>
      )}

      <div className="mood-trends">

        <div className="moodcheck-card-title">
          📈 Mood Trends
        </div>

        {moods.map((m) => (
          <div key={m.id} className="trend-row">

            <div className="trend-label">
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </div>

            <div className="trend-bar-wrapper">
              <div
                className={`trend-bar ${m.id}`}
                style={{
                  width: `${Math.min(moodStats[m.id] * 20, 180)}px`
                }}
              />
            </div>

            <span className="trend-count">
              {moodStats[m.id]}
            </span>

          </div>
        ))}

      </div>
      <div className="moodcheck-card-title history-title">
        📋 Recent mood history
      </div>

      {history.length === 0 && (
        <div className="mood-empty">
          No mood check-ins yet.
        </div>
      )}

      <ul>
        {history.map((h, i) => {
          const moodInfo = moods.find(m => m.id === h.mood);

          return (
            <li key={i}>
              <div className="mood-history-top">

                <span>
                  {moodInfo?.emoji} {moodInfo?.label}
                </span>

                <span className="mood-date">
                  {new Date(h.date).toLocaleDateString()}
                </span>

              </div>

              <p className="history-message">
                {h.ai_message}
              </p>

            </li>
          );
        })}
      </ul>

    </div>
  );
};