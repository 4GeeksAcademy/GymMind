import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Login = () => {
  const navigate = useNavigate();
  const { dispatch } = useGlobalReducer();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = "error") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        dispatch({ type: "login", payload: { token: data.token, user: data.user } });
        navigate("/dashboard");
      } else {
        showNotification(data.error || "Login failed");
      }
    } catch (error) {
      console.log(error);
      showNotification("Login failed");
    }
  };

  return (
    <div className="signin-page">
      {notification && (
        <div style={{
          position: "fixed", top: "24px", left: "50%", transform: "translateX(-50%)",
          background: notification.type === "success" ? "rgba(0,255,136,0.1)" : "rgba(255,80,80,0.1)",
          border: `1px solid ${notification.type === "success" ? "#00ff88" : "#ff6b6b"}`,
          color: notification.type === "success" ? "#00ff88" : "#ff6b6b",
          padding: "12px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: "500",
          zIndex: 9999, backdropFilter: "blur(10px)", whiteSpace: "nowrap"
        }}>
          {notification.msg}
        </div>
      )}
      <nav className="signin-navbar">
        <div className="signin-logo">GYMMIND AI</div>
        <div className="signin-actions">
          <button className="login-btn">Login</button>
          <button className="start-btn" onClick={() => navigate("/signup")}>Start Free</button>
        </div>
      </nav>
      <div className="signin-card">
        <h3>GYMMIND AI</h3>
        <h1>WELCOME BACK</h1>
        <p>Sign in to continue your progress</p>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label>Password</label>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="options">
            <label><input type="checkbox" /> Remember me</label>
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>
          <button type="submit" className="signin-btn">Sign In</button>
          <div className="divider">
            <span></span>
            <p>or continue with</p>
            <span></span>
          </div>
          <button type="button" className="google-btn">
            <span>G</span> Continue with Google
          </button>
          <p className="signup-text">
            Don't have an account? <Link to="/signup">Sign up for free</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
