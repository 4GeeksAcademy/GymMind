import React, { useState, useEffect } from "react";
import "../index.css";

const moods = [
  { id: "great", emoji: "🔥", label: "Great" },
  { id: "good", emoji: "😊", label: "Good" },
  { id: "okay", emoji: "😐", label: "Okay" },
  { id: "tired", emoji: "😴", label: "Tired" },
  { id: "low", emoji: "😔", label: "Low" },
];

export const MoodCheck = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [history, setHistory] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const user = JSON.parse(sessionStorage.getItem("user"));
  const token = sessionStorage.getItem("token");

  // GET HISTORY
  const fetchMoodHistory = async () => {
    try {
      const response = await fetch(
        `${backendUrl}/api/mood/${user.id}`,
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
          user_id: user.id,
          mood: selectedMood,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return alert(data.error);
      }

      fetchMoodHistory();
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

              <p>{h.ai_message}</p>

            </li>
          );
        })}
      </ul>

    </div>
  );
};