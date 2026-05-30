import React from "react";
import { Link } from "react-router-dom";

export const Privacy = () => {
    return (
        <div className="legal-page">
            <div className="legal-container">
                <Link to="/signup" className="legal-back">← Back to Signup</Link>
                <p className="legal-label">
                    GYMMIND AI LEGAL
                </p>

                <h1>Privacy Policy</h1>
                <p className="legal-date">Effective Date: May 29, 2026</p>
                <div className="legal-divider"></div>

                <h2>1. Information We Collect</h2>
                <p>
                    GymMind AI may collect your name, email address, profile information, fitness goals,
                    workout preferences, nutrition data, progress records, and mood check responses.
                </p>

                <h2>2. How We Use Your Information</h2>
                <p>
                    We use your information to create your account, personalize workouts, provide nutrition
                    recommendations, track progress, and improve your experience.
                </p>

                <h2>3. Google Login</h2>
                <p>
                    If you sign in with Google, we may receive basic profile information such as your name,
                    email address, and profile image, depending on your Google account permissions.
                </p>

                <h2>4. Artificial Intelligence Features</h2>
                <p>
                    GymMind AI may use AI tools to generate workout, nutrition, and motivational recommendations.
                    These suggestions are for educational purposes only.
                </p>

                <h2>5. Data Sharing</h2>
                <p>
                    We do not sell your personal information. We may only share data when necessary to operate
                    the app, comply with the law, or protect users and the platform.
                </p>

                <h2>6. Data Security</h2>
                <p>
                    We use reasonable security practices to protect your information, but no system is completely secure.
                </p>

                <h2>7. Your Choices</h2>
                <p>
                    You may request to update or delete your account information by contacting the GymMind AI team.
                </p>

                <h2>8. Contact</h2>
                <p>
                    For questions about this Privacy Policy, please contact the GymMind AI team.
                </p>
            </div>
        </div>
    );
};