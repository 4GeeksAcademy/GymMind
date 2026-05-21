import React from "react";
import { MoodCheck } from "../components/MoodCheck";
import { Link, useNavigate } from "react-router-dom";

export const MoodCheckPage = () => {
    const navigate = useNavigate();
    return (
        <div className="moodcheck-page">
            <nav className="moodcheck-navbar">
                <div className="moodcheck-logo">GYMMIND AI</div>
                <div className="moodcheck-links">
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/myworkout">My Workout</Link>
                    <Link to="/progress">Progress</Link>
                    <Link to="/profile">Profile</Link>
                </div>
                <div className="moodcheck-actions">
                    <div className="moodcheck-edit">
                        <button>Edit profile</button>
                    </div>

                    <button
                        className="moodcheck-signout-btn"
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

            <main className="page-container">
                <header className="moodcheck-header">
                    <h2>DAILY CHECK-IN</h2>
                    <h1>MOOD CHECK</h1>
                    <p>
                        How are you feeling today? Your AI Coach will adapt your experience
                        based on your answer.
                    </p>
                </header>
                <MoodCheck />
            </main>
        </div>
    );
};
