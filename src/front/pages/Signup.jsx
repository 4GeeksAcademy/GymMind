import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Link } from "react-router-dom";



export const Signup = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: ""
    });

    const [termsAccepted, setTermsAccepted] = useState(false);

    const [submitAttempted, setSubmitAttempted] = useState(false);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {

        event.preventDefault();
        setSubmitAttempted(true);

        if (formData.password !== formData.confirm_password) {
            alert("Passwords do not match");
            return;
        }

        if (!termsAccepted) {
                return;
            }

        try {

            const response = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        email: formData.email,
                        password: formData.password
                    })
                }
            );

            const data = await response.json();

            console.log(data);

            if (response.ok) {
                alert("Account created successfully");
                navigate("/dashboard");
            } else {
                alert(data.error);
            }

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="signup-page">

            <nav className="signup-navbar">

                <div className="signup-logo">
                    GYMMIND AI
                </div>

                <div className="signup-links">
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How it Works</a>
                    <a href="#pricing">Pricing</a>
                </div>

                <div className="signup-actions">
                    <button
                        className="login-btn"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>

                    <button className="start-btn">
                        Start Free
                    </button>
                </div>

            </nav>

            <div className="signup-card">

                <h3>GYMMIND AI</h3>

                <h1>CREATE YOUR ACCOUNT</h1>

                <p>
                    Start free — your transformation starts today
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="name-row">

                        <div>
                            <label>First Name</label>

                            <input
                                type="text"
                                name="first_name"
                                placeholder="Jessica"
                                value={formData.first_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label>Last Name</label>

                            <input
                                type="text"
                                name="last_name"
                                placeholder="Garcia"
                                value={formData.last_name}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        placeholder="you@email.com"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        placeholder="Minimum 8 characters"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <div className="password-lines">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <label>Confirm Password</label>

                    <input
                        type="password"
                        name="confirm_password"
                        placeholder="••••••••"
                        value={formData.confirm_password}
                        onChange={handleChange}
                    />

                    <div className="terms">
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                        />
                        <p>
                            I accept the{" "}
                            <Link to="/terms" target="_blank">
                                Terms of Service
                            </Link>
                            {" "}and{" "}
                            <Link to="/privacy" target="_blank">
                                Privacy Policy
                            </Link>
                        </p>
                        {!termsAccepted && submitAttempted && (
                            <p className="terms-error">
                                You must accept the Terms of Service and Privacy Policy.
                            </p>
                        )}
                    </div>

                    <button
                        className="create-btn"
                        type="submit"
                    >
                        Create Free Account
                    </button>

                    <div className="divider">
                        <span></span>

                        <p>or sign up with</p>

                        <span></span>
                    </div>

                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                            const response = await fetch(
                                import.meta.env.VITE_BACKEND_URL + "/api/google-login",
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        credential: credentialResponse.credential
                                    })
                                }
                            );

                            const data = await response.json();

                            if (response.ok) {
                                sessionStorage.setItem("token", data.token);
                                sessionStorage.setItem("user", JSON.stringify(data.user));
                                navigate("/dashboard");
                            } else {
                                alert(data.error);
                            }
                        }}
                        onError={() => {
                            alert("Google login failed");
                        }}
                    />

                    <p className="signin-text">
                        Already have an account?
                        <span onClick={() => navigate("/login")}
                            className="signin-link">
                            Sign In
                        </span>
                    </p>

                </form>

            </div>

            <section id="features" className="signup-section">
                <h2>Features</h2>
                <div className="section-grid">
                    <div className="section-card">
                        <h4>AI Workout Plans</h4>
                        <p> Get personalized workout routines based on your firnes goal, experience level, and availabe training days.</p>
                    </div>

                    <div className="section-card">
                        <h>Goal-Based Trainign</h>
                        <p>Choose between fat loss, muscle gain, or body recomposition and receive a plan designed for your objetive.</p>
                    </div>

                    <div className="section-card">
                        <h4>Smart Progress Tracking</h4>
                        <p>Track your workouts, weight, progress photos, and body changes over time.</p>
                    </div>

                    <div className="section-card">
                        <h4>Nutrition Guidance</h4>
                        <p>Receive simple nutrition recommendations to support your workout plan and fitness goal.</p>
                    </div>

                    <div className="section-card">
                        <h4>AI Coach Assistant</h4>
                        <p>Ask questions, get workout suggestions, and receive guidance based on your profile.</p>
                    </div>

                    <div className="section-card">
                        <h4>workout Calendar</h4>
                        <p>Organize your weekly training schedule and stay consistent with your routine.</p>
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="signup-section">

                <h2>How it Works</h2>

                <div className="steps">
                    <p><strong>1.</strong>Create your account.</p>
                    <p><strong>2.</strong>Complete your fitness profile.</p>
                    <p><strong>3.</strong>Choose your goal: fat loss, muscle gain or recomposition.</p>
                    <p><strong>4.</strong>Complete your daily mood check to help the AI understand your energy and motivation levels.</p>
                    <p><strong>5.</strong>Receive your personalized AI workout plan</p>
                    <p><strong>6.</strong>Track your progress and adjust yuor plan over time.</p>
                </div>
            </section>

            <section id="pricing" className="signup-section">

                <h2>Pricing</h2>

                <div className="section-grid">
                    <div className="pricing-card">
                        <h3>Free</h3>
                        <h1>$0</h1>
                        <p className="price-subtitle">
                            Perfect to get started
                        </p>
                        <ul>
                            <li>Basic AI workout plans</li>
                            <li>Fitness Profile</li>
                            <li>Workout calendar</li>
                        </ul>

                        <button>Start Free</button>
                    </div>

                    <div className="pricing-card featured-plan">
                        <div className="popular-badge">
                            MOST POPULAR
                        </div>
                        <h3>Pro</h3>
                        <h1>$9.99</h1>
                        <p className="price-subtitle">
                            Advanced AI experience
                        </p>

                        <ul>
                            <li>Everything in Free</li>
                            <li>Mood check access</li>
                            <li>Advanced AI workout plans</li>
                            <li>Nutrition recommendations</li>
                            <li>Progress tracking</li>
                        </ul>
                        <button>Upgrade Now</button>
                    </div>

                    <div className="pricing-card">
                        <h3>Elite</h3>
                        <h1>$19.99</h1>

                        <p className="price-subtitle">
                            Full Premium Experience
                        </p>

                        <ul>
                            <li>Everything in Pro</li>
                            <li>Priority AI recommendations</li>
                            <li>Custom adaptive workouts</li>
                            <li>AI Coach Assistant</li>
                            <li>Advanced analytics</li>
                        </ul>

                        <button> Go Elite</button>
                    </div>
                </div>
            </section>

        </div>
    );
};