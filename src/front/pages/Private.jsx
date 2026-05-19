import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Private = () => {
  const navigate = useNavigate();
  const { dispatch } = useGlobalReducer();
  const [message, setMessage] = useState("Loading...");
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    dispatch({ type: "logout" });

    navigate("/login");
  };

  useEffect(() => {
    const validateToken = async () => {
      const token = sessionStorage.getItem("token");
      console.log("Token enviado:", token);

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const response = await fetch(`${backendUrl}/api/protected`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`

          },
        });

        if (!response.ok) {
          setMessage("Session expired, redirecting...");
          setTimeout(() => {
            sessionStorage.removeItem("token");
            navigate("/login");
          }, 1500);
          return;
        }

      } catch (error) {
        console.log(error);
        navigate("/login");
      }
    };

    validateToken();
  }, []);

  return (
    <div className="private-page">

      <nav className="private-navbar">
        <div className="private-logo">GYMMIND AI</div>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <div className="private-card">
        <h1>WELCOME BACK</h1>

        <span className="private-status">
          Authenticated successfully
        </span>
      </div>

    </div>
  );
};
