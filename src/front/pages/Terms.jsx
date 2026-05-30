import React from "react";
import { Link } from "react-router-dom";

export const Terms = () => {
    return (
        <div className="legal-page">
            <div className="legal-container">
                <Link to="/signup" className="legal-back">← Back to Signup</Link>
                <p className="legal-label">
                    GYMMIND AI LEGAL
                </p>

                <h1>Terms of Service</h1>
                <p className="legal-date">Effective Date: May 29, 2026</p>
                <div className="legal-divider"></div>

                <h2>1. Acceptance of Terms</h2>
                <p>
                    By creating an account or using GymMind AI, you agree to follow these Terms of Service.
                    If you do not agree, please do not use the platform.
                </p>

                <h2>2. Purpose of GymMind AI</h2>
                <p>
                    GymMind AI provides fitness, nutrition, workout, mood check, and progress tracking tools
                    for educational and personal wellness purposes.
                </p>

                <h2>3. No Medical Advice</h2>
                <p>
                    GymMind AI does not provide medical advice, diagnosis, or treatment. Always consult a doctor,
                    trainer, or qualified health professional before starting any workout or nutrition program.
                </p>

                <h2>4. User Responsibility</h2>
                <p>
                    You are responsible for using the app safely, entering accurate information, and stopping any
                    activity that causes pain, dizziness, or discomfort.
                </p>

                <h2>5. Account Security</h2>
                <p>
                    You are responsible for keeping your login information secure. Do not share your account with others.
                </p>

                <h2>6. Prohibited Use</h2>
                <p>
                    You may not misuse the platform, attempt to access another user’s account, upload harmful content,
                    or use GymMind AI for illegal purposes.
                </p>

                <h2>7. Changes to Terms</h2>
                <p>
                    GymMind AI may update these Terms from time to time. Continued use of the app means you accept
                    the updated Terms.
                </p>

                <h2>8. Contact</h2>
                <p>
                    For questions about these Terms, please contact the GymMind AI team.
                </p>
            </div>
        </div>
    );
};