import React, { useState, useContext } from "react";
import { Context } from "../hooks/useGlobalReducer";
import { useNavigate, Link } from "react-router-dom";

export const Login = () => {

    const { dispatch } = useContext(Context);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (event) => {

        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            const response = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            if(response.ok){

                localStorage.setItem("token", data.token);

                dispatch({
                    type: "set_token",
                    payload: data.token
                });

                dispatch({
                    type: "set_user",
                    payload: data.user
                });

                navigate("/private");

            } else {
                alert(data.error);
            }

        } catch(error){
            console.log(error);
        }
    };

    return (

        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-md-6">

                    <div className="card shadow p-4">

                        <h1 className="text-center mb-4">
                            Login
                        </h1>

                        <form onSubmit={handleSubmit}>

                            <input
                                className="form-control mb-3"
                                type="email"
                                name="email"
                                placeholder="Email"
                                onChange={handleChange}
                            />

                            <input
                                className="form-control mb-3"
                                type="password"
                                name="password"
                                placeholder="Password"
                                onChange={handleChange}
                            />

                            <button
                                className="btn btn-dark w-100"
                                type="submit"
                            >
                                Login
                            </button>

                        </form>

                        <p className="mt-3 text-center">

                            Don't have an account?

                            <Link to="/signup">
                                Signup
                            </Link>

                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
};