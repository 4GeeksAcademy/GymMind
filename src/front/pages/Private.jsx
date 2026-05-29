import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Dashboard } from "./Dashboard";

export const Private = () => {
  const navigate = useNavigate();
  const { dispatch } = useGlobalReducer();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    dispatch({ type: "logout" });
    navigate("/login");
  };

  useEffect(() => {
    const validateToken = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
                const response = await fetch(`/api/protected`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          },
        });
        if (!response.ok) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          navigate("/login");
          return;
        }
      } catch (error) {
        console.log(error);
        navigate("/login");
      }
    };
    validateToken();
  }, []);

  return <Dashboard handleLogout={handleLogout} />;
};
