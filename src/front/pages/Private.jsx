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