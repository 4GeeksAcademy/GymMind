import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BAD_WORDS = ["fuck", "shit", "ass", "bitch", "bastard", "dick", "pussy", "cunt", "nigger", "faggot"];

const FAKE_DOMAINS = [
    "test.com", "fake.com", "example.com", "mailinator.com", "tempmail.com",
    "guerrillamail.com", "throwaway.email", "yopmail.com", "sharklasers.com",
    "trashmail.com", "dispostable.com", "maildrop.cc", "spamgourmet.com",
    "10minutemail.com", "temp-mail.org", "fakeinbox.com", "nomail.com"
];

const containsBadWords = (value) => {
    const lower = value.toLowerCase();
    return BAD_WORDS.some(word => lower.includes(word));
};

const isFakeDomain = (email) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return FAKE_DOMAINS.includes(domain);
};

const EditProfile = () => {
    const [form, setForm] = useState({
        first_name: "", last_name: "", email: "",
        nickname: "", gender: "", date_of_birth: "",
        weight: "", height: "", phone_number: ""
    });
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();
    const userId = 1;

    const [dobDay, setDobDay] = useState("");
    const [dobMonth, setDobMonth] = useState("");
    const [dobYear, setDobYear] = useState("");

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}`)
            .then(res => res.json())
            .then(data => setForm({
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                email: data.email || "",
                nickname: data.nickname || "",
                gender: data.gender || "",
                date_of_birth: data.date_of_birth || "",
                weight: data.weight || "",
                height: data.height || "",
                phone_number: data.phone_number || ""
            }))
            .catch(() => setError("Could not connect to server"));
    }, []);

    useEffect(() => {
        if (form.date_of_birth) {
            const [y, m, d] = form.date_of_birth.split("-");
            setDobYear(y || "");
            setDobMonth(m ? String(parseInt(m)) : "");
            setDobDay(d ? String(parseInt(d)) : "");
        }
    }, [form.date_of_birth]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({ ...prev, [e.target.name]: null }));
        }
    };

    const handleDobChange = (day, month, year) => {
        if (day && month && year) {
            const mm = String(month).padStart(2, "0");
            const dd = String(day).padStart(2, "0");
            setForm(prev => ({ ...prev, date_of_birth: `${year}-${mm}-${dd}` }));
        }
        if (fieldErrors.date_of_birth) {
            setFieldErrors(prev => ({ ...prev, date_of_birth: null }));
        }
    };

    const validate = () => {
        const errors = {};

        if (!form.first_name.trim()) {
            errors.first_name = "First name is required";
        } else if (!/^[a-zA-ZÀ-ÿ\s]{2,}$/.test(form.first_name.trim())) {
            errors.first_name = "Only letters, minimum 2 characters";
        }

        if (!form.last_name.trim()) {
            errors.last_name = "Last name is required";
        } else if (!/^[a-zA-ZÀ-ÿ\s]{2,}$/.test(form.last_name.trim())) {
            errors.last_name = "Only letters, minimum 2 characters";
        }

        if (!form.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            errors.email = "Enter a valid email address";
        } else if (isFakeDomain(form.email.trim())) {
            errors.email = "Please use a real email address";
        }

        if (form.nickname.trim()) {
            if (form.nickname.trim().length < 3) {
                errors.nickname = "Nickname must be at least 3 characters";
            } else if (containsBadWords(form.nickname)) {
                errors.nickname = "Nickname contains inappropriate words";
            } else if (!/^[a-zA-Z0-9_.-]+$/.test(form.nickname.trim())) {
                errors.nickname = "Only letters, numbers, _ . and - allowed";
            }
        }

        if (form.phone_number.trim()) {
            if (!/^\+?[0-9]{7,15}$/.test(form.phone_number.trim())) {
                errors.phone_number = "Enter a valid phone number (7-15 digits)";
            }
        }

        if (!dobDay || !dobMonth || !dobYear) {
            errors.date_of_birth = "Please select a complete date of birth";
        } else {
            const birthDate = new Date(`${dobYear}-${String(dobMonth).padStart(2, "0")}-${String(dobDay).padStart(2, "0")}`);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
            if (age < 13) {
                errors.date_of_birth = "You must be at least 13 years old";
            } else if (age > 120) {
                errors.date_of_birth = "Enter a valid date of birth";
            }
        }

        return errors;
    };

    const handleSubmit = () => {
        setError(null);
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError("Please fix the errors below before saving.");
            return;
        }
        setFieldErrors({});

        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) setError(data.error);
                else {
                    setShowSuccess(true);
                    setTimeout(() => { setShowSuccess(false); navigate("/profile"); }, 1800);
                }
            })
            .catch(() => setError("Could not connect to server"));
    };

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const textFields = [
        { label: "Nickname", name: "nickname", type: "text", optional: true },
        { label: "First Name", name: "first_name", type: "text", required: true },
        { label: "Last Name", name: "last_name", type: "text", required: true },
        { label: "Email", name: "email", type: "email", required: true },
        { label: "Phone Number", name: "phone_number", type: "text", optional: true },
    ];

    const initials = form.first_name && form.last_name
        ? form.first_name[0].toUpperCase() + form.last_name[0].toUpperCase()
        : "?";

    return (
        <div className="profile-page">
            <div className="profile-container">

                {/* ── Encabezado igual que Profile.jsx ── */}
                <div className="text-center mb-4">
                    <div className="profile-avatar mx-auto mb-3">{initials}</div>
                    <h2 className="profile-name">{form.first_name || "—"} {form.last_name || ""}</h2>
                    <p className="profile-email">{form.email || ""}</p>
                    <p style={{ color: "#666", fontSize: "13px", marginTop: "4px" }}>
                        Editing your profile
                    </p>
                </div>

                {/* Animación de éxito */}
                {showSuccess && (
                    <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", padding: "24px", marginBottom: "16px",
                        background: "#0d1f0d", borderRadius: "16px",
                        border: "1px solid #1a5c1a", animation: "fadeIn 0.3s ease"
                    }}>
                        <div style={{
                            width: "60px", height: "60px", borderRadius: "50%",
                            background: "linear-gradient(135deg, #00b894, #00cec9)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "28px", marginBottom: "12px", animation: "popIn 0.4s ease"
                        }}>✓</div>
                        <p style={{ color: "white", fontWeight: "bold", margin: 0 }}>Profile updated!</p>
                    </div>
                )}

                {!showSuccess && error && <div className="alert alert-danger">{error}</div>}

                {textFields.map((field) => (
                    <div className="mb-3" key={field.name}>
                        <label className="profile-card-label mb-1">
                            {field.label}
                            {field.required && <span style={{ color: "#ff4d4d", marginLeft: "4px" }}>*</span>}
                            {field.optional && <span style={{ color: "#666", marginLeft: "6px", fontSize: "12px" }}>(optional)</span>}
                        </label>
                        <input
                            type={field.type}
                            name={field.name}
                            className="form-control profile-input"
                            value={form[field.name]}
                            onChange={handleChange}
                            style={fieldErrors[field.name] ? {
                                borderColor: "#ff4d4d",
                                boxShadow: "0 0 0 2px rgba(255,77,77,0.25)"
                            } : {}}
                        />
                        {fieldErrors[field.name] && (
                            <small style={{ color: "#ff4d4d" }}>{fieldErrors[field.name]}</small>
                        )}
                    </div>
                ))}

                {/* Género: botones pill */}
                <div className="mb-3">
                    <label className="profile-card-label mb-2">Gender</label>
                    <div className="d-flex gap-3">
                        {["Male", "Female"].map((g) => (
                            <button
                                key={g}
                                type="button"
                                onClick={() => setForm({ ...form, gender: g })}
                                style={{
                                    flex: 1, padding: "12px", borderRadius: "12px",
                                    border: form.gender === g ? "2px solid #0066ff" : "2px solid #333",
                                    background: form.gender === g
                                        ? "linear-gradient(135deg, #0066ff, #00c6ff)"
                                        : "#1a1a2e",
                                    color: "white", fontWeight: "bold", fontSize: "15px",
                                    cursor: "pointer", transition: "all 0.2s ease"
                                }}
                            >
                                {g === "Male" ? "♂ Male" : "♀ Female"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Fecha de nacimiento */}
                <div className="mb-3">
                    <label className="profile-card-label mb-2">
                        Date of Birth <span style={{ color: "#ff4d4d", marginLeft: "4px" }}>*</span>
                    </label>
                    <div className="d-flex gap-2">
                        <select
                            className="form-control profile-input"
                            value={dobDay}
                            style={fieldErrors.date_of_birth ? { borderColor: "#ff4d4d", boxShadow: "0 0 0 2px rgba(255,77,77,0.25)" } : {}}
                            onChange={e => { setDobDay(e.target.value); handleDobChange(e.target.value, dobMonth, dobYear); }}
                        >
                            <option value="">Day</option>
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select
                            className="form-control profile-input"
                            value={dobMonth}
                            style={fieldErrors.date_of_birth ? { borderColor: "#ff4d4d", boxShadow: "0 0 0 2px rgba(255,77,77,0.25)" } : {}}
                            onChange={e => { setDobMonth(e.target.value); handleDobChange(dobDay, e.target.value, dobYear); }}
                        >
                            <option value="">Month</option>
                            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                        <select
                            className="form-control profile-input"
                            value={dobYear}
                            style={fieldErrors.date_of_birth ? { borderColor: "#ff4d4d", boxShadow: "0 0 0 2px rgba(255,77,77,0.25)" } : {}}
                            onChange={e => { setDobYear(e.target.value); handleDobChange(dobDay, dobMonth, e.target.value); }}
                        >
                            <option value="">Year</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    {fieldErrors.date_of_birth && (
                        <small style={{ color: "#ff4d4d" }}>{fieldErrors.date_of_birth}</small>
                    )}
                </div>

                {/* Peso */}
                <div className="mb-3">
                    <label className="profile-card-label mb-2">
                        Weight — <span style={{ color: "white", fontWeight: "bold" }}>{form.weight || "—"} kg</span>
                    </label>
                    <input
                        type="range" name="weight" min="30" max="200" step="1"
                        value={form.weight || 70} onChange={handleChange}
                        className="profile-slider"
                    />
                </div>

                {/* Altura */}
                <div className="mb-4">
                    <label className="profile-card-label mb-2">
                        Height — <span style={{ color: "white", fontWeight: "bold" }}>{form.height || "—"} cm</span>
                    </label>
                    <input
                        type="range" name="height" min="100" max="250" step="1"
                        value={form.height || 170} onChange={handleChange}
                        className="profile-slider"
                    />
                </div>

                <button className="btn profile-btn w-100 mb-2" onClick={handleSubmit}>
                    Save Changes
                </button>

                <button className="btn profile-btn-secondary w-100" onClick={() => navigate("/profile")}>
                    Cancel
                </button>

            </div>
        </div>
    );
};

export default EditProfile;