import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    const user = store.user || JSON.parse(sessionStorage.getItem("user"));
    const token = store.token || sessionStorage.getItem("token");

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        dispatch({ type: "logout" });
        navigate("/");
    };

    const isActive = (path) => location.pathname === path ? "active" : "";

    return (
        <>
            <style>{`
                .gm-navbar {
                    display: flex;
                    align-items: center;
                    height: 56px;
                    background: rgba(8,12,16,0.97);
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    padding: 0 20px;
                    width: 100%;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    font-family: 'DM Sans', sans-serif;
                }
                .gm-navbar-logo {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 22px;
                    letter-spacing: 2px;
                    color: #00e5ff;
                    white-space: nowrap;
                    flex-shrink: 0;
                    margin-right: 24px;
                    cursor: pointer;
                    text-decoration: none;
                }
                .gm-navbar-links {
                    display: flex;
                    gap: 24px;
                    flex: 1;
                }
                .gm-navbar-links a {
                    color: #6b7c8f;
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 500;
                    white-space: nowrap;
                    transition: color 0.2s;
                }
                .gm-navbar-links a:hover { color: #f0f4f8; }
                .gm-navbar-links a.active { color: #00e5ff; }
                .gm-navbar-cta {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    flex-shrink: 0;
                    margin-left: 24px;
                }
                .gm-navbar-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(0,229,255,0.1);
                    border: 2px solid #00e5ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 14px;
                    color: #00e5ff;
                    cursor: pointer;
                    overflow: hidden;
                    flex-shrink: 0;
                    text-decoration: none;
                }
                .gm-navbar-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .gm-navbar-btn-logout {
                    background: transparent;
                    border: 1px solid rgba(255,80,80,0.3);
                    color: #ff6b6b;
                    padding: 6px 14px;
                    border-radius: 6px;
                    font-size: 13px;
                    cursor: pointer;
                    font-family: 'DM Sans', sans-serif;
                    transition: background 0.2s;
                }
                .gm-navbar-btn-logout:hover { background: rgba(255,80,80,0.08); }
                .gm-navbar-btn-login {
                    background: #00e5ff;
                    color: #000;
                    padding: 6px 14px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    font-family: 'DM Sans', sans-serif;
                    text-decoration: none;
                }
            `}</style>

            <nav className="gm-navbar">
                <Link to={token ? "/dashboard" : "/"} className="gm-navbar-logo">
                    GymMind AI
                </Link>

                <div className="gm-navbar-links">
                    {token ? (
                        <>
                            <Link to="/dashboard" className={isActive("/dashboard")}>Dashboard</Link>
                            <Link to="/workout" className={isActive("/workout")}>My Workout</Link>
                            <Link to="/moodcheck" className={isActive("/moodcheck")}>Mood Check</Link>
                            <Link to="/progress" className={isActive("/progress")}>Progress</Link>
                            <Link to="/nutrition" className={isActive("/nutrition")}>Nutrition</Link>
                            <Link to="/profile" className={isActive("/profile")}>Profile</Link>
                        </>
                    ) : (
                        <>
                            <a href="#features">Features</a>
                            <a href="#how-it-works">How it works</a>
                            <a href="#pricing">Pricing</a>
                        </>
                    )}
                </div>

                <div className="gm-navbar-cta">
                    {token ? (
                        <>
                            <Link to="/profile" className="gm-navbar-avatar" title="Profile">
                                {user?.photo_url
                                    ? <img src={user.photo_url} alt="profile" />
                                    : (user?.first_name?.[0] || "U").toUpperCase()
                                }
                            </Link>
                            <button className="gm-navbar-btn-logout" onClick={handleLogout}>
                                Sign out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: "#f0f4f8", textDecoration: "none", fontSize: "13px" }}>Login</Link>
                            <Link to="/signup" className="gm-navbar-btn-login">Get started free</Link>
                        </>
                    )}
                </div>
            </nav>
        </>
    );
};

export default Navbar; 