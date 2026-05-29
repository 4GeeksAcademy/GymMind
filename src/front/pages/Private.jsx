import React, { useContext } from "react";
import { Context } from "../hooks/useGlobalReducer";
import { Navigate } from "react-router-dom";

export const Private = () => {

    const { store } = useContext(Context);

    if(!store.token){
        return <Navigate to="/login" />;
    }

    return (

        <div className="container mt-5">

            <div className="card p-5 shadow">

                <h1>Private Page</h1>

                <h3>You are logged in</h3>

            </div>

        </div>
    );
};

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
