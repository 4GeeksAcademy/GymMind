import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
            } else {
                setMessage(data.error);
            }
        } catch (error) {
            console.error(error);
            setMessage("Something went wrong.");
        }
    };

    return (
        <div className="signin-page">
            <nav className="signin-navbar">
                <div className="signin-logo">GYMMIND AI</div>
                <div className="signin-actions">
                    <button className="login-btn" onClick={() => navigate("/login")}>
                        Login
                    </button>
                </div>
            </nav>

            <div className="signin-card">
                <h3>GYMMIND AI</h3>
                <h1>FORGOT PASSWORD</h1>
                <p>Enter your email and we'll send you a reset link.</p>

                <form onSubmit={handleSubmit}>
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <button type="submit" className="signin-btn">
                        Send Reset Link
                    </button>
                    {message && (
                        <p className="success-message">
                            {message}
                        </p>
                    )}

                    <p className="signup-text">
                        Remember your password? <Link to="/login">Back to Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};