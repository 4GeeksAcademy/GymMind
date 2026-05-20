import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const userId = 1;
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) setError(data.error);
                else setUser(data);
            })
            .catch(() => setError("Could not connect to server"));
    }, []);

    if (error) return <p className="text-danger text-center mt-5">{error}</p>;
    if (!user) return <p className="text-secondary text-center mt-5">Loading...</p>;

    const initials = user.first_name[0].toUpperCase() + user.last_name[0].toUpperCase();

    return (
        <div className="profile-page">
            <div className="profile-container">

                <div className="text-center mb-4">
                    <div className="profile-avatar mx-auto mb-3">{initials}</div>
                    <h2 className="profile-name">{user.first_name} {user.last_name}</h2>
                    <p className="profile-email">{user.email}</p>
                </div>

                <div className="mb-4">
                    {[
                        { label: "Nickname", value: user.nickname },
                        { label: "First Name", value: user.first_name },
                        { label: "Last Name", value: user.last_name },
                        { label: "Gender", value: user.gender },
                        { label: "Date of Birth", value: user.date_of_birth },
                        { label: "Weight", value: user.weight ? `${user.weight} kg` : null },
                        { label: "Height", value: user.height ? `${user.height} cm` : null },
                        { label: "Email", value: user.email },
                        { label: "Phone Number", value: user.phone_number },
                    ].map((item) => item.value ? (
                        <div key={item.label} className="profile-card">
                            <span className="profile-card-label">{item.label}</span>
                            <span className="profile-card-value">{item.value}</span>
                        </div>
                    ) : null)}
                </div>

                <button className="btn profile-btn w-100 mb-2" onClick={() => navigate("/edit-profile")}>
                    Edit Profile
                </button>

                <button className="btn profile-btn-secondary w-100" onClick={() => navigate("/dashboard")}> {/* 👈 ESTE YA ESTABA */}
                    Back to Dashboard
                </button>

            </div>
        </div>
    );
};

export default Profile;