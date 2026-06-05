import React, { useState } from "react";
import { Link } from "react-router-dom";

export const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password.length < 8) {
            setMessage("Password must be at least 8 characters");
            return;
        }
        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        setMessage("Password validation successful");
    };

    return (
        <div className="signin-page">
            <div className="signin-card">
                <h3>GYMMIND AI</h3>
                <h1>RESET PASSWORD</h1>
                <p>Create a new password for your account.</p>

                <form onSubmit={handleSubmit}>
                    <label>New Password</label>
                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            type="button"
                            className="password-toggle reset-password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <label>Confirm Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <button type="submit" className="signin-btn">
                        Update Password
                    </button>

                    {message && (
                        <p className="success-message">
                            {message}
                        </p>
                    )}

                    <p className="signup-text">
                        <Link to="/login">Back to Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};