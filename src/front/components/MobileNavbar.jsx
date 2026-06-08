import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const MobileNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const goTo = (path) => {
        setIsOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <nav className="mobile-navbar">
            <div className="mobile-navbar-logo" onClick={() => goTo("/dashboard")}>
                GYMMIND AI
            </div>

            <button
                type="button"
                className="hamburger-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                ☰
            </button>

            {isOpen && (
                <div className="mobile-menu">
                    <button onClick={() => goTo("/dashboard")}>Dashboard</button>
                    <button onClick={() => goTo("/workout")}>My Workout</button>
                    <button onClick={() => goTo("/moodcheck")}>Mood Check</button>
                    <button onClick={() => goTo("/progress")}>Progress</button>
                    <button onClick={() => goTo("/nutrition")}>Nutrition</button>
                    <button onClick={() => goTo("/profile")}>Profile</button>
                    <button className="mobile-logout" onClick={handleLogout}>Sign out</button>
                </div>
            )}
        </nav>
    );
};