import React, { useState } from "react";
import "../index.css";


const moods = [
  { id: "great", emoji: "🔥", label: "Great", message: "You're on fire today! Your AI Coach has an intense workout ready. Channel that energy and go all in — today is your day to set a new personal record!" },
  { id: "good", emoji: "😊", label: "Good", message: "Feeling good is the perfect foundation. Stay focused and consistent — every rep today brings you closer to your goal. Let's make it count!" },
  { id: "okay", emoji: "😐", label: "Okay", message: "Even on okay days, showing up is what separates those who reach their goals from those who don't. A moderate session today will keep your momentum going." },
  { id: "tired", emoji: "😴", label: "Tired", message: "Rest is part of the process. Consider a light recovery session or stretching today. Pushing through exhaustion can lead to injury — listen to your body." },
  { id: "low", emoji: "😔", label: "Low", message: "It's okay to have off days — everyone does. Your AI Coach believes in you. Start with just 5 minutes. Once you begin, momentum will carry you through." },
];

export const MoodCheck = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSubmit = () => {
    if (!selectedMood) return alert("Please select a mood first!");
    const moodObj = moods.find(m => m.id === selectedMood);
    setHistory([{ ...moodObj, date: new Date() }, ...history]);
    setSelectedMood(null);
  };

  return (
    <div className="mood-check">
      <h3>Select your mood</h3>

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

      <button className="moodcheck-submit-btn" onClick={handleSubmit}>
        Submit mood check
      </button>

      <h3>Recent Mood History</h3>
      <ul>
        {history.map((h, i) => (
          <li key={i}>
            {h.emoji} {h.label} · {h.date.toLocaleDateString()}
            <p>{h.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
