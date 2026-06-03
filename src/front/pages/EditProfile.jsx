import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

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
    const { store } = useGlobalReducer();
    const userId = store.user?.id || JSON.parse(sessionStorage.getItem("user") || "{}").id;
    const [form, setForm] = useState({
        first_name: "", last_name: "", email: "",
        nickname: "", gender: "", date_of_birth: "",
        weight: "", height: "", phone_number: ""
    });
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const navigate = useNavigate();

    const [dobDay, setDobDay] = useState("");
    const [dobMonth, setDobMonth] = useState("");
    const [dobYear, setDobYear] = useState("");

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!token || !userId) {
            navigate("/login");
            return;
        }
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                setForm({
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                    email: data.email || "",
                    nickname: data.nickname || "",
                    gender: data.gender || "",
                    date_of_birth: data.date_of_birth || "",
                    weight: data.weight || "",
                    height: data.height || "",
                    phone_number: data.phone_number || ""
                });
                if (data.photo_url) setPhotoPreview(data.photo_url);
            })
            .catch(() => setError("Could not connect to server"));
    }, [userId]);

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

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
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

    const handleSubmit = async () => {
        setError(null);
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError("Please fix the errors below before saving.");
            return;
        }
        setFieldErrors({});

        try {
            // 1. Guardar datos del perfil
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
                return;
            }

            // 2. Si hay foto nueva, subirla
            if (photoFile) {
                const formData = new FormData();
                formData.append("photo", photoFile);
                const photoRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}/photo`, {
                    method: "POST",
                    body: formData
                });
                const photoData = await photoRes.json();
                if (photoData.error) {
                    setError(photoData.error);
                    return;
                }
            }

            setShowSuccess(true);
            setTimeout(() => { setShowSuccess(false); navigate("/profile"); }, 1800);

        } catch {
            setError("Could not connect to server");
        }
    };

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const initials = form.first_name && form.last_name
        ? form.first_name[0].toUpperCase() + form.last_name[0].toUpperCase()
        : "?";

    const inputStyle = (fieldName) => ({
        background: "#0d1318",
        border: fieldErrors[fieldName] ? "1px solid #ff4d4d" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        color: "#f0f4f8",
        padding: "10px 14px",
        fontSize: "13px",
        width: "100%",
        outline: "none",
        boxShadow: fieldErrors[fieldName] ? "0 0 0 2px rgba(255,77,77,0.2)" : "none",
        fontFamily: "'DM Sans', sans-serif",
    });

    const selectStyle = (hasError) => ({
        background: "#0d1318",
        border: hasError ? "1px solid #ff4d4d" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        color: "#f0f4f8",
        padding: "10px 14px",
        fontSize: "13px",
        outline: "none",
        boxShadow: hasError ? "0 0 0 2px rgba(255,77,77,0.2)" : "none",
        fontFamily: "'DM Sans', sans-serif",
        flex: 1,
    });

    const genderColor = (g) => {
        if (form.gender !== g) return {
            border: "2px solid rgba(255,255,255,0.08)",
            background: "#0d1318",
            color: "#6b7c8f",
        };
        if (g === "Male") return {
            border: "2px solid #00e5ff",
            background: "rgba(0,229,255,0.1)",
            color: "#00e5ff",
        };
        return {
            border: "2px solid #f472b6",
            background: "rgba(244,114,182,0.1)",
            color: "#f472b6",
        };
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

                :root {
                    --bg: #080c10; --bg2: #0d1318; --accent: #00e5ff; --accent2: #00ff88;
                    --text: #f0f4f8; --muted: #6b7c8f; --border: rgba(255,255,255,0.08);
                }

                .ep-body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; }

                .ep-nav { display: flex; align-items: center; height: 56px; background: rgba(8,12,16,0.97); border-bottom: 1px solid var(--border); padding: 0 20px; width: 100%; }
                .ep-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 2px; color: var(--accent); white-space: nowrap; flex-shrink: 0; margin-right: 24px; }
                .ep-nav-links { display: flex; gap: 24px; flex: 1; }
                .ep-nav-links a { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; white-space: nowrap; transition: color 0.2s; cursor: pointer; }
                .ep-nav-links a.active { color: var(--accent); }
                .ep-nav-cta { display: flex; gap: 8px; align-items: center; flex-shrink: 0; margin-left: 24px; }
                .ep-btn-danger { background: transparent; border: 1px solid rgba(255,80,80,0.3); color: #ff6b6b; padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }

                .ep-page { padding: 32px 24px; max-width: 800px; margin: 0 auto; }
                .ep-section-label { font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); margin-bottom: 4px; }
                .ep-page-title { font-family: 'Bebas Neue', sans-serif; font-size: 36px; letter-spacing: 2px; margin-bottom: 24px; }

                .ep-hero { background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 24px 28px; display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
                .ep-avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #0066ff, #00c6ff); display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: white; flex-shrink: 0; border: 3px solid var(--accent); overflow: hidden; }
                .ep-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .ep-hero-name { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 1px; }
                .ep-hero-email { color: var(--muted); font-size: 13px; }
                .ep-hero-tag { font-size: 12px; color: var(--accent); margin-top: 4px; }

                .ep-photo-btn { background: transparent; border: 1px solid var(--border); color: var(--muted); border-radius: 8px; padding: 6px 14px; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; margin-top: 8px; }
                .ep-photo-btn:hover { border-color: var(--accent); color: var(--accent); }

                .ep-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 16px; }
                .ep-card-title { font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 1px; margin-bottom: 18px; color: var(--text); }
                .ep-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

                .ep-label { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; display: block; }
                .ep-required { color: #ff4d4d; margin-left: 3px; }
                .ep-optional { color: var(--muted); font-size: 11px; font-weight: 400; margin-left: 6px; text-transform: none; letter-spacing: 0; }
                .ep-error { color: #ff4d4d; font-size: 12px; margin-top: 4px; display: block; }

                .ep-gender-btn { flex: 1; padding: 12px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }

                .ep-slider { width: 100%; cursor: pointer; margin-top: 6px; accent-color: var(--accent); }

                .ep-number-input { background: #0d1318; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: var(--accent); font-size: 15px; font-weight: 700; width: 72px; text-align: center; padding: 6px 8px; outline: none; font-family: 'DM Sans', sans-serif; -moz-appearance: textfield; }
                .ep-number-input::-webkit-outer-spin-button,
                .ep-number-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                input[type=number]::-webkit-outer-spin-button,
                input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                input[type=number] { -moz-appearance: textfield; }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }

                .ep-btn-save { background: var(--accent); color: #000; border: none; border-radius: 10px; padding: 12px; font-size: 14px; font-weight: 700; cursor: pointer; width: 100%; font-family: 'DM Sans', sans-serif; margin-bottom: 10px; transition: opacity 0.2s; }
                .ep-btn-save:hover { opacity: 0.85; }
                .ep-btn-cancel { background: transparent; border: 1px solid var(--border); color: var(--muted); border-radius: 10px; padding: 12px; font-size: 14px; cursor: pointer; width: 100%; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
                .ep-btn-cancel:hover { border-color: var(--muted); color: var(--text); }

                option { background: #0d1318; color: #f0f4f8; }
            `}</style>

            <div className="ep-body">

                <nav className="ep-nav">
                    <div className="ep-logo">GymMind AI</div>
                    <div className="ep-nav-links">
                        <a onClick={() => navigate("/dashboard")}>Dashboard</a>
                        <a onClick={() => navigate("/dashboard")}>My Workout</a>
                        <a onClick={() => navigate("/dashboard")}>Progress</a>
                        <a className="active" onClick={() => navigate("/profile")}>Profile</a>
                    </div>
                    <div className="ep-nav-cta">
                        <button className="ep-btn-danger" onClick={() => {
                            sessionStorage.removeItem("token");
                            sessionStorage.removeItem("user");
                            navigate("/login");
                        }}>Sign out</button>
                    </div>
                </nav>

                <div className="ep-page">

                    <div className="ep-section-label">My Account</div>
                    <div className="ep-page-title">EDIT PROFILE</div>

                    {/* HERO con foto */}
                    <div className="ep-hero">
                        <div className="ep-avatar">
                            {photoPreview
                                ? <img src={photoPreview} alt="avatar" />
                                : initials
                            }
                        </div>
                        <div>
                            <div className="ep-hero-name">{form.first_name || "—"} {form.last_name || ""}</div>
                            <div className="ep-hero-email">{form.email || ""}</div>
                            <div className="ep-hero-tag">✏️ Editing your profile</div>
                            {/* Input oculto + botón visible */}
                            <input
                                type="file"
                                id="photo-input"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handlePhotoChange}
                            />
                            <button
                                className="ep-photo-btn"
                                onClick={() => document.getElementById("photo-input").click()}
                            >
                                📷 {photoPreview ? "Change photo" : "Upload photo"}
                            </button>
                        </div>
                    </div>

                    {showSuccess && (
                        <div style={{
                            display: "flex", flexDirection: "column", alignItems: "center",
                            justifyContent: "center", padding: "28px", marginBottom: "16px",
                            background: "#0d1f0d", borderRadius: "16px",
                            border: "1px solid #1a5c1a", animation: "fadeIn 0.3s ease"
                        }}>
                            <div style={{
                                width: "64px", height: "64px", borderRadius: "50%",
                                background: "linear-gradient(135deg, #00b894, #00cec9)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "30px", marginBottom: "12px", animation: "popIn 0.4s ease"
                            }}>✓</div>
                            <p style={{ color: "white", fontWeight: "bold", margin: 0, fontSize: "15px" }}>Profile updated!</p>
                        </div>
                    )}

                    {!showSuccess && error && (
                        <div style={{
                            background: "rgba(255,77,77,0.1)", border: "1px solid rgba(255,77,77,0.3)",
                            borderRadius: "10px", padding: "12px 16px", marginBottom: "16px",
                            color: "#ff6b6b", fontSize: "13px"
                        }}>{error}</div>
                    )}

                    {/* PERSONAL INFO */}
                    <div className="ep-card">
                        <div className="ep-card-title">Personal Information</div>
                        <div className="ep-grid-2">
                            {[
                                { label: "First Name", name: "first_name", type: "text", required: true },
                                { label: "Last Name", name: "last_name", type: "text", required: true },
                                { label: "Nickname", name: "nickname", type: "text", optional: true },
                                { label: "Phone Number", name: "phone_number", type: "text", optional: true },
                            ].map((field) => (
                                <div key={field.name}>
                                    <label className="ep-label">
                                        {field.label}
                                        {field.required && <span className="ep-required">*</span>}
                                        {field.optional && <span className="ep-optional">(optional)</span>}
                                    </label>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        style={inputStyle(field.name)}
                                    />
                                    {fieldErrors[field.name] && (
                                        <span className="ep-error">{fieldErrors[field.name]}</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: "16px" }}>
                            <label className="ep-label">Email <span className="ep-required">*</span></label>
                            <input
                                type="email" name="email" value={form.email}
                                onChange={handleChange} style={inputStyle("email")}
                            />
                            {fieldErrors.email && <span className="ep-error">{fieldErrors.email}</span>}
                        </div>

                        <div style={{ marginTop: "16px" }}>
                            <label className="ep-label">Gender</label>
                            <div style={{ display: "flex", gap: "12px" }}>
                                {["Male", "Female"].map((g) => (
                                    <button
                                        key={g}
                                        type="button"
                                        className="ep-gender-btn"
                                        onClick={() => setForm({ ...form, gender: g })}
                                        style={genderColor(g)}
                                    >
                                        {g === "Male" ? "♂ Male" : "♀ Female"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: "16px" }}>
                            <label className="ep-label">Date of Birth <span className="ep-required">*</span></label>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <select value={dobDay} style={selectStyle(!!fieldErrors.date_of_birth)}
                                    onChange={e => { setDobDay(e.target.value); handleDobChange(e.target.value, dobMonth, dobYear); }}>
                                    <option value="">Day</option>
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <select value={dobMonth} style={selectStyle(!!fieldErrors.date_of_birth)}
                                    onChange={e => { setDobMonth(e.target.value); handleDobChange(dobDay, e.target.value, dobYear); }}>
                                    <option value="">Month</option>
                                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                </select>
                                <select value={dobYear} style={selectStyle(!!fieldErrors.date_of_birth)}
                                    onChange={e => { setDobYear(e.target.value); handleDobChange(dobDay, dobMonth, e.target.value); }}>
                                    <option value="">Year</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            {fieldErrors.date_of_birth && <span className="ep-error">{fieldErrors.date_of_birth}</span>}
                        </div>
                    </div>

                    {/* MEASUREMENTS */}
                    <div className="ep-card">
                        <div className="ep-card-title">📏 Measurements</div>

                        {/* WEIGHT */}
                        <div style={{ marginBottom: "32px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "12px" }}>
                                <div>
                                    <label className="ep-label" style={{ margin: 0 }}>Weight</label>
                                    <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>30 — 200 kg</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,229,255,0.07)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: "10px", padding: "6px 12px" }}>
                                    <input
                                        type="number"
                                        min="30" max="200"
                                        value={form.weight === "" ? "" : form.weight}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === "" || raw === "-") { setForm({ ...form, weight: "" }); return; }
                                            const val = Number(raw);
                                            if (!isNaN(val)) setForm({ ...form, weight: val });
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            if (isNaN(val) || val < 30) setForm({ ...form, weight: 30 });
                                            else if (val > 200) setForm({ ...form, weight: 200 });
                                        }}
                                        style={{ background: "transparent", border: "none", color: "#00e5ff", fontSize: "22px", fontWeight: "700", width: "56px", textAlign: "center", outline: "none", fontFamily: "'DM Sans', sans-serif", MozAppearance: "textfield", WebkitAppearance: "none" }}
                                    />
                                    <span style={{ color: "var(--muted)", fontSize: "13px", fontWeight: "500" }}>kg</span>
                                </div>
                            </div>
                            <div style={{ position: "relative", height: "6px", borderRadius: "99px", background: "rgba(255,255,255,0.08)", margin: "0 0 6px" }}>
                                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", borderRadius: "99px", background: "linear-gradient(90deg, #0066ff, #00e5ff)", width: `${((Number(form.weight) || 70) - 30) / 170 * 100}%`, transition: "width 0.1s" }} />
                                <input
                                    type="range" min="30" max="200" step="1"
                                    value={Number(form.weight) || 70}
                                    onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                                    style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: "100%", opacity: 0, cursor: "pointer", height: "20px", margin: 0 }}
                                />
                                <div style={{ position: "absolute", top: "50%", transform: "translate(-50%, -50%)", left: `${((Number(form.weight) || 70) - 30) / 170 * 100}%`, width: "18px", height: "18px", borderRadius: "50%", background: "#00e5ff", border: "3px solid #080c10", boxShadow: "0 0 8px rgba(0,229,255,0.6)", pointerEvents: "none", transition: "left 0.1s" }} />
                            </div>
                        </div>

                        {/* HEIGHT */}
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "12px" }}>
                                <div>
                                    <label className="ep-label" style={{ margin: 0 }}>Height</label>
                                    <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>100 — 250 cm</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,229,255,0.07)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: "10px", padding: "6px 12px" }}>
                                    <input
                                        type="number"
                                        min="100" max="250"
                                        value={form.height === "" ? "" : form.height}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === "" || raw === "-") { setForm({ ...form, height: "" }); return; }
                                            const val = Number(raw);
                                            if (!isNaN(val)) setForm({ ...form, height: val });
                                        }}
                                        onBlur={(e) => {
                                            const val = Number(e.target.value);
                                            if (isNaN(val) || val < 100) setForm({ ...form, height: 100 });
                                            else if (val > 250) setForm({ ...form, height: 250 });
                                        }}
                                        style={{ background: "transparent", border: "none", color: "#00e5ff", fontSize: "22px", fontWeight: "700", width: "56px", textAlign: "center", outline: "none", fontFamily: "'DM Sans', sans-serif", MozAppearance: "textfield", WebkitAppearance: "none" }}
                                    />
                                    <span style={{ color: "var(--muted)", fontSize: "13px", fontWeight: "500" }}>cm</span>
                                </div>
                            </div>
                            <div style={{ position: "relative", height: "6px", borderRadius: "99px", background: "rgba(255,255,255,0.08)", margin: "0 0 6px" }}>
                                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", borderRadius: "99px", background: "linear-gradient(90deg, #0066ff, #00e5ff)", width: `${((Number(form.height) || 170) - 100) / 150 * 100}%`, transition: "width 0.1s" }} />
                                <input
                                    type="range" min="100" max="250" step="1"
                                    value={Number(form.height) || 170}
                                    onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
                                    style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: "100%", opacity: 0, cursor: "pointer", height: "20px", margin: 0 }}
                                />
                                <div style={{ position: "absolute", top: "50%", transform: "translate(-50%, -50%)", left: `${((Number(form.height) || 170) - 100) / 150 * 100}%`, width: "18px", height: "18px", borderRadius: "50%", background: "#00e5ff", border: "3px solid #080c10", boxShadow: "0 0 8px rgba(0,229,255,0.6)", pointerEvents: "none", transition: "left 0.1s" }} />
                            </div>
                        </div>
                    </div>

                    <button className="ep-btn-save" onClick={handleSubmit}>Save Changes</button>
                    <button className="ep-btn-cancel" onClick={() => navigate("/profile")}>Cancel</button>

                </div>
            </div>
        </>
    );
};

export default EditProfile;