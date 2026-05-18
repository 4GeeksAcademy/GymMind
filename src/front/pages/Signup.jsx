import React, { useState } from "react";

export const Signup = () => {

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: ""
    });

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (formData.password !== formData.confirm_password) {
            alert("Passwords do not match");
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
                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            console.log(data);

            if (response.ok) {
                alert("Account created successfully");
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
                    <a href="#">Features</a>
                    <a href="#">How it Works</a>
                    <a href="#">Pricing</a>
                </div>

                <div className="signup-actions">
                    <button className="login-btn">
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

                        <input type="checkbox" />

                        <p>
                            I accept the <span>Terms of Service</span> and{" "}
                            <span>Privacy Policy</span>
                        </p>

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

                    <button
                        type="button"
                        className="google-btn"
                    >
                        <span>G</span> Continue with Google
                    </button>

                    <p className="signin-text">
                        Already have an account? <span>Sign In</span>
                    </p>

                </form>

            </div>

        </div>
    );
};