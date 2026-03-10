import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState(location.state?.name || "");
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [preferredRole, setPreferredRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [qualification, setQualification] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:8000/api/auth/register", {
        name,
        email,
        password,
        mobile,
        preferredRole,
        skills: skills.split(",").map((s) => s.trim()),
        experience,
        qualification,
        gender,
        age,
      });
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "14px 16px",
    background: focusedField === field ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
    border: focusedField === field ? "1px solid #6c63ff" : "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "white",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    transition: "all 0.25s ease",
    boxSizing: "border-box",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(108,99,255,0.15)" : "none",
  });

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    color: "#888",
    textTransform: "uppercase",
    marginBottom: "6px",
    fontFamily: "'DM Sans', sans-serif",
  };

  const fields = [
    { label: "Full Name", value: name, setter: setName, placeholder: "John Doe", id: "name", type: "text" },
    { label: "Email Address", value: email, setter: setEmail, placeholder: "john@example.com", id: "email", type: "email" },
    { label: "Password", value: password, setter: setPassword, placeholder: "Min. 8 characters", id: "password", type: "password" },
    { label: "Mobile Number", value: mobile, setter: setMobile, placeholder: "+91 98765 43210", id: "mobile", type: "text" },
    { label: "Preferred Role", value: preferredRole, setter: setPreferredRole, placeholder: "e.g. Frontend Developer", id: "role", type: "text" },
    { label: "Skills", value: skills, setter: setSkills, placeholder: "React, Node.js, Python...", id: "skills", type: "text" },
    { label: "Past Experience", value: experience, setter: setExperience, placeholder: "e.g. 2 years at TCS", id: "experience", type: "text" },
    { label: "Qualification", value: qualification, setter: setQualification, placeholder: "e.g. B.Tech Computer Science", id: "qualification", type: "text" },
    { label: "Gender", value: gender, setter: setGender, placeholder: "e.g. Male / Female", id: "gender", type: "text" },
    { label: "Age", value: age, setter: setAge, placeholder: "e.g. 22", id: "age", type: "number" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0d0d0f;
        }

        .register-page {
          min-height: 100vh;
          width: 100vw;
          background: #0d0d0f;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
        }

        .bg-orb-1 {
          position: fixed;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%);
          top: -100px;
          right: -100px;
          pointer-events: none;
        }

        .bg-orb-2 {
          position: fixed;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,179,255,0.08) 0%, transparent 70%);
          bottom: -100px;
          left: -100px;
          pointer-events: none;
        }

        .register-card {
          width: 100%;
          max-width: 780px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 50px 48px;
          backdrop-filter: blur(20px);
          position: relative;
          z-index: 1;
          animation: fadeUp 0.5s ease forwards;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(108,99,255,0.15);
          border: 1px solid rgba(108,99,255,0.3);
          border-radius: 100px;
          padding: 6px 16px;
          margin-bottom: 20px;
        }

        .brand-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6c63ff;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .brand-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #6c63ff;
          letter-spacing: 0.05em;
        }

        .page-title {
          font-family: 'Syne', sans-serif;
          font-size: 36px;
          font-weight: 800;
          color: white;
          line-height: 1.1;
          margin-bottom: 10px;
        }

        .page-title span {
          background: linear-gradient(135deg, #6c63ff, #63b3ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #666;
          font-weight: 400;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 32px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          animation: fadeUp 0.5s ease forwards;
          opacity: 0;
        }

        .register-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #6c63ff, #5a54e8);
          border: none;
          color: white;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s ease;
          letter-spacing: 0.02em;
          position: relative;
          overflow: hidden;
        }

        .register-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(108,99,255,0.4);
        }

        .register-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .register-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.25s;
        }

        .register-btn:hover::after {
          opacity: 1;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }

        .divider-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: #555;
          white-space: nowrap;
        }

        .login-link {
          text-align: center;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #555;
        }

        .login-link a {
          color: #6c63ff;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }

        .login-link a:hover {
          color: #8b85ff;
        }

        input::placeholder {
          color: #444;
        }

        input[type=number]::-webkit-inner-spin-button {
          -webkit-appearance: none;
        }

        @media (max-width: 600px) {
          .register-card { padding: 32px 24px; }
          .form-grid { grid-template-columns: 1fr; }
          .page-title { font-size: 28px; }
        }
      `}</style>

      <div className="register-page">
        <div className="bg-orb-1" />
        <div className="bg-orb-2" />

        <div className="register-card">

          {/* Header */}
          <div className="card-header">
            <div className="brand-badge">
              <div className="brand-dot" />
              <span className="brand-text">Career Companion</span>
            </div>
            <h1 className="page-title">
              Start your <span>journey</span>
            </h1>
            <p className="page-subtitle">Create your account and let AI guide your career path</p>
          </div>

          {/* Form Grid */}
          <div className="form-grid">
            {fields.map((field, i) => (
              <div
                className="field-group"
                key={field.id}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <label style={labelStyle}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  onFocus={() => setFocusedField(field.id)}
                  onBlur={() => setFocusedField("")}
                  style={inputStyle(field.id)}
                />
              </div>
            ))}
          </div>

          {/* Register Button */}
          <button
            className="register-btn"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account →"}
          </button>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">Already have an account?</span>
            <div className="divider-line" />
          </div>

          {/* Login Link */}
          <div className="login-link">
            <Link to="/login">Sign in instead →</Link>
          </div>

        </div>
      </div>
    </>
  );
}

export default Register;