import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Private = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const validateToken = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const response = await fetch(`${backendUrl}/api/protected`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          sessionStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const data = await response.json();
        setMessage(`Logged as user id: ${data.logged_in_as}`);
      } catch (error) {
        console.log(error);
        navigate("/login");
      }
    };

    validateToken();
  }, []);

  return (
    <div className="container text-center mt-5">
      <h1 className="display-4 text-success">Private Page</h1>
      <p className="lead">{message}</p>
    </div>
  );
};
