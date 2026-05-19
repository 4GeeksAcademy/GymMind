import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Login = () => {
  const navigate = useNavigate();
  const { dispatch } = useGlobalReducer();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));

        dispatch({
          type: "login",
          payload: { token: data.token, user: data.user },
        });

        navigate("/private");
        alert("Login successful");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      console.log(error);
      alert("Login failed");
    }
  };

  return (
    <div className="signin-page">
      <nav className="signin-navbar">
        <div className="signin-logo">GYMMIND AI</div>
        <div className="signin-links">
          <a href="#">Features</a>
          <a href="#">How it Works</a>
          <a href="#">Pricing</a>
        </div>
        <div className="signin-actions">
          <button className="login-btn">Login</button>
          <button className="start-btn">Start Free</button>
        </div>
      </nav>

      <div className="signin-card">
        <h3>GYMMIND AI</h3>
        <h1>WELCOME BACK</h1>
        <p>Sign in to continue your progress</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#">Forgot your password?</a>
          </div>

          <button type="submit" className="signin-btn">
            Sign In
          </button>

          <div className="divider">
            <span></span>
            <p>or continue with</p>
            <span></span>
          </div>

          <button type="button" className="google-btn">
            <span>G</span> Continue with Google
          </button>

          <p className="signup-text">
            Don’t have an account? <span>Sign up for free</span>
          </p>
        </form>
      </div>
    </div>
  );
};
