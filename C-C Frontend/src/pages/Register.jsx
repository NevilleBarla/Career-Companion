import { useState } from "react";
import axios from "axios";
import BASE_URL from "../config";
import { useNavigate, useLocation, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState(location.state?.name || "");
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [preferredRole, setPreferredRole] = useState([]);
  const [roleInput, setRoleInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [experience, setExperience] = useState("");
  const [qualification, setQualification] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // ---- Frontend validation before hitting backend ----
  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Name is required";
    if (!email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Enter a valid email";
    if (!password.trim()) errors.password = "Password is required";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters";
    if (!mobile.trim()) errors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(mobile.replace(/\s/g, ""))) errors.mobile = "Enter a valid 10-digit mobile number";
    if (preferredRole.length === 0) errors.preferredRole = "Preferred role is required";
    if (selectedSkills.length === 0) errors.skills = "At least one skill is required";
    if (!experience.trim()) errors.experience = "Experience is required";
    if (!qualification.trim()) errors.qualification = "Qualification is required";
    if (!gender.trim()) errors.gender = "Gender is required";
    if (!age) errors.age = "Age is required";
    return errors;
  };

  const handleRegister = async () => {
    setError("");
    setFieldErrors({});

    // Run frontend validation first
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fill in all required fields correctly.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        name,
        email,
        password,
        mobile,
        preferredRole: preferredRole.join(", "),
        skills: selectedSkills,
        experience,
        qualification,
        gender,
        age: Number(age),
      });
      navigate("/login");
    } catch (err) {
      // Show backend error message (duplicate email/mobile etc.)
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);

      // Highlight specific fields for duplicate errors
      if (msg.toLowerCase().includes("email")) {
        setFieldErrors((prev) => ({ ...prev, email: msg }));
      }
      if (msg.toLowerCase().includes("mobile")) {
        setFieldErrors((prev) => ({ ...prev, mobile: msg }));
      }
    } finally {
      setLoading(false);
    }
  };

  // ---- Job Roles & Skills Data ----
  const JOB_ROLES = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Mobile Developer", "Android Developer", "iOS Developer",
    "DevOps Engineer", "Cloud Engineer", "Site Reliability Engineer",
    "Data Engineer", "Data Scientist", "Machine Learning Engineer",
    "AI Engineer", "Blockchain Developer", "Software Engineer",
    "QA Engineer", "Security Engineer", "UI Designer", "UX Designer",
    "UI/UX Designer", "Product Designer", "Graphic Designer",
    "Product Manager", "Project Manager", "Scrum Master", "Business Analyst",
    "Technical Lead", "Engineering Manager", "Data Analyst",
    "Business Intelligence Analyst", "Database Administrator",
    "Digital Marketing Specialist", "SEO Specialist", "Content Writer",
    "Social Media Manager", "Sales Executive", "Business Development Manager",
    "HR Manager", "Recruiter", "Financial Analyst", "Accountant",
    "Technical Support Engineer", "IT Administrator",
  ];

  const SKILLS_LIST = [
    "React", "Angular", "Vue.js", "Next.js", "TypeScript", "JavaScript",
    "HTML", "CSS", "Tailwind CSS", "Bootstrap", "Redux", "GraphQL",
    "Node.js", "Express.js", "Python", "Django", "FastAPI", "Java",
    "Spring Boot", "PHP", "Laravel", "Go", "Rust", "C++", "C#", ".NET",
    "Kotlin", "Swift", "MongoDB", "MySQL", "PostgreSQL", "Redis",
    "Firebase", "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud",
    "CI/CD", "Jenkins", "GitHub Actions", "Linux", "React Native",
    "Flutter", "Machine Learning", "Deep Learning", "TensorFlow",
    "PyTorch", "Pandas", "NumPy", "Power BI", "Tableau", "Git",
    "GitHub", "Jira", "Figma", "Postman", "REST API", "Microservices",
    "System Design", "Agile", "Scrum",
  ];

  const toggleRole = (role) => {
    setPreferredRole(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
    if (fieldErrors.preferredRole) setFieldErrors(p => ({ ...p, preferredRole: "" }));
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
    if (fieldErrors.skills) setFieldErrors(p => ({ ...p, skills: "" }));
  };

  const addCustomRole = () => {
    const val = roleInput.trim();
    if (val && !preferredRole.includes(val)) {
      setPreferredRole(prev => [...prev, val]);
      if (fieldErrors.preferredRole) setFieldErrors(p => ({ ...p, preferredRole: "" }));
    }
    setRoleInput("");
  };

  const addCustomSkill = () => {
    const val = skillInput.trim();
    if (val && !selectedSkills.includes(val)) {
      setSelectedSkills(prev => [...prev, val]);
      if (fieldErrors.skills) setFieldErrors(p => ({ ...p, skills: "" }));
    }
    setSkillInput("");
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "14px 16px",
    background: fieldErrors[field]
      ? "rgba(255,80,80,0.05)"
      : focusedField === field
      ? "rgba(255,255,255,0.07)"
      : "rgba(255,255,255,0.03)",
    border: fieldErrors[field]
      ? "1px solid rgba(255,80,80,0.5)"
      : focusedField === field
      ? "1px solid #6c63ff"
      : "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "white",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    transition: "all 0.25s ease",
    boxSizing: "border-box",
    boxShadow: fieldErrors[field]
      ? "0 0 0 3px rgba(255,80,80,0.1)"
      : focusedField === field
      ? "0 0 0 3px rgba(108,99,255,0.15)"
      : "none",
  });

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    color: "#666",
    textTransform: "uppercase",
    marginBottom: "6px",
    fontFamily: "'DM Sans', sans-serif",
  };

  const fields = [
    { label: "Full Name", value: name, setter: setName, placeholder: "John Doe", id: "name", type: "text" },
    { label: "Email Address", value: email, setter: setEmail, placeholder: "john@example.com", id: "email", type: "email" },
    { label: "Password", value: password, setter: setPassword, placeholder: "Min. 6 characters", id: "password", type: "password" },
    { label: "Mobile Number", value: mobile, setter: setMobile, placeholder: "10-digit number", id: "mobile", type: "text" },
    { label: "Past Experience", value: experience, setter: setExperience, placeholder: "e.g. 2 years at TCS", id: "experience", type: "text" },
    { label: "Qualification", value: qualification, setter: setQualification, placeholder: "e.g. B.Tech Computer Science", id: "qualification", type: "text" },

    { label: "Age", value: age, setter: setAge, placeholder: "e.g. 22", id: "age", type: "number" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0d0f; }

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
          position: fixed; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%);
          top: -100px; right: -100px; pointer-events: none;
        }

        .bg-orb-2 {
          position: fixed; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,179,255,0.08) 0%, transparent 70%);
          bottom: -100px; left: -100px; pointer-events: none;
        }

        .register-card {
          width: 100%; max-width: 780px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px; padding: 50px 48px;
          backdrop-filter: blur(20px);
          position: relative; z-index: 1;
          animation: fadeUp 0.5s ease forwards;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card-header { text-align: center; margin-bottom: 40px; }

        .brand-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(108,99,255,0.15);
          border: 1px solid rgba(108,99,255,0.3);
          border-radius: 100px; padding: 6px 16px; margin-bottom: 20px;
        }

        .brand-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #6c63ff; animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .brand-text {
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          font-weight: 600; color: #6c63ff; letter-spacing: 0.05em;
        }

        .page-title {
          font-family: 'Syne', sans-serif; font-size: 36px;
          font-weight: 800; color: white; line-height: 1.1; margin-bottom: 10px;
        }

        .page-title span {
          background: linear-gradient(135deg, #6c63ff, #63b3ff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: #555;
        }

        .error-banner {
          background: rgba(255,80,80,0.08);
          border: 1px solid rgba(255,80,80,0.25);
          border-radius: 10px; padding: 13px 16px;
          margin-bottom: 24px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #ff6b6b;
          display: flex; align-items: center; gap: 8px;
          animation: fadeUp 0.3s ease;
        }

        .form-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 20px; margin-bottom: 32px;
        }

        .field-group { display: flex; flex-direction: column; }

        .field-error {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; color: #ff6b6b;
          margin-top: 5px; display: flex; align-items: center; gap: 4px;
        }

        .register-btn {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #6c63ff, #5a54e8);
          border: none; color: white; font-size: 15px;
          font-weight: 600; font-family: 'DM Sans', sans-serif;
          border-radius: 12px; cursor: pointer;
          transition: all 0.25s ease; letter-spacing: 0.02em;
        }

        .register-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(108,99,255,0.4);
        }

        .register-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .divider {
          display: flex; align-items: center;
          gap: 12px; margin: 24px 0;
        }

        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }

        .divider-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: #555; white-space: nowrap;
        }

        .login-link {
          text-align: center;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: #555;
        }

        .login-link a {
          color: #6c63ff; text-decoration: none;
          font-weight: 600; transition: color 0.2s;
        }

        .login-link a:hover { color: #8b85ff; }

        input::placeholder { color: #3a3a3a; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        select option { background: #1a1a2e; color: white; }

        .multi-section { margin-bottom: 0; }
        .multi-section-label {
          display: block; font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; color: #666; text-transform: uppercase;
          margin-bottom: 8px; font-family: 'DM Sans', sans-serif;
        }
        .multi-custom-input {
          display: flex; gap: 8px; margin-bottom: 10px;
        }
        .multi-custom-input input {
          flex: 1; padding: 10px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; color: white;
          font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none;
        }
        .multi-custom-input input:focus {
          border-color: #6c63ff;
        }
        .multi-add-btn {
          padding: 10px 16px;
          background: rgba(108,99,255,0.15);
          border: 1px solid rgba(108,99,255,0.3);
          border-radius: 8px; color: #a09bff;
          font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
        }
        .multi-add-btn:hover { background: rgba(108,99,255,0.25); }
        .chips-wrap {
          display: flex; flex-wrap: wrap; gap: 7px;
          margin-bottom: 10px; min-height: 32px;
        }
        .chip-selected {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px;
          background: rgba(108,99,255,0.15);
          border: 1px solid rgba(108,99,255,0.35);
          border-radius: 100px; font-size: 12px; font-weight: 500;
          color: #a09bff; font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all 0.2s;
        }
        .chip-selected:hover { background: rgba(255,80,80,0.1); border-color: rgba(255,80,80,0.3); color: #ff6b6b; }
        .chip-option {
          display: inline-flex; align-items: center;
          padding: 5px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px; font-size: 12px;
          color: #555; font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all 0.2s;
        }
        .chip-option:hover { background: rgba(108,99,255,0.1); border-color: rgba(108,99,255,0.25); color: #a09bff; }
        .options-scroll {
          max-height: 130px; overflow-y: auto;
          display: flex; flex-wrap: wrap; gap: 7px;
          padding: 4px 2px;
        }
        .options-scroll::-webkit-scrollbar { width: 4px; }
        .options-scroll::-webkit-scrollbar-track { background: transparent; }
        .options-scroll::-webkit-scrollbar-thumb { background: rgba(108,99,255,0.3); border-radius: 4px; }
        .multi-full { grid-column: 1 / -1; }

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
            <h1 className="page-title">Start your <span>journey</span></h1>
            <p className="page-subtitle">Create your account and let AI guide your career path</p>
          </div>

          {/* Global Error Banner */}
          {error && (
            <div className="error-banner">
              ⚠ {error}
            </div>
          )}

          {/* Form Grid */}
          <div className="form-grid">
            {fields.map((field) => (
              <div className="field-group" key={field.id}>
                <label style={labelStyle}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={(e) => {
                    field.setter(e.target.value);
                    // Clear error on typing
                    if (fieldErrors[field.id]) {
                      setFieldErrors((prev) => ({ ...prev, [field.id]: "" }));
                    }
                  }}
                  onFocus={() => setFocusedField(field.id)}
                  onBlur={() => setFocusedField("")}
                  style={inputStyle(field.id)}
                />
                {/* Per-field error message */}
                {fieldErrors[field.id] && (
                  <span className="field-error">
                    ⚠ {fieldErrors[field.id]}
                  </span>
                )}
              </div>
            ))}


            {/* Preferred Role Multi-Select */}
            <div className="multi-section multi-full">
              <label className="multi-section-label">Preferred Role(s) *</label>
              {preferredRole.length > 0 && (
                <div className="chips-wrap">
                  {preferredRole.map(r => (
                    <span key={r} className="chip-selected" onClick={() => toggleRole(r)}>
                      {r} ✕
                    </span>
                  ))}
                </div>
              )}
              <div className="multi-custom-input">
                <input
                  placeholder="Type a custom role and press Add..."
                  value={roleInput}
                  onChange={e => setRoleInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCustomRole()}
                />
                <button className="multi-add-btn" onClick={addCustomRole}>+ Add</button>
              </div>
              <div className="options-scroll">
                {JOB_ROLES.filter(r => !preferredRole.includes(r)).map(r => (
                  <span key={r} className="chip-option" onClick={() => toggleRole(r)}>+ {r}</span>
                ))}
              </div>
              {fieldErrors.preferredRole && <span className="field-error">⚠ {fieldErrors.preferredRole}</span>}
            </div>

            {/* Skills Multi-Select */}
            <div className="multi-section multi-full">
              <label className="multi-section-label">Skills *</label>
              {selectedSkills.length > 0 && (
                <div className="chips-wrap">
                  {selectedSkills.map(s => (
                    <span key={s} className="chip-selected" onClick={() => toggleSkill(s)}>
                      {s} ✕
                    </span>
                  ))}
                </div>
              )}
              <div className="multi-custom-input">
                <input
                  placeholder="Type a custom skill and press Add..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCustomSkill()}
                />
                <button className="multi-add-btn" onClick={addCustomSkill}>+ Add</button>
              </div>
              <div className="options-scroll">
                {SKILLS_LIST.filter(s => !selectedSkills.includes(s)).map(s => (
                  <span key={s} className="chip-option" onClick={() => toggleSkill(s)}>+ {s}</span>
                ))}
              </div>
              {fieldErrors.skills && <span className="field-error">⚠ {fieldErrors.skills}</span>}
            </div>

            {/* Gender Dropdown */}
            <div className="field-group" key="gender">
              <label style={labelStyle}>Gender</label>
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  if (fieldErrors.gender) {
                    setFieldErrors((prev) => ({ ...prev, gender: "" }));
                  }
                }}
                style={{
                  ...inputStyle("gender"),
                  appearance: "none",
                  WebkitAppearance: "none",
                  cursor: "pointer",
                  color: gender ? "white" : "#3a3a3a",
                }}
              >
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
                <option value="Rather not say">Rather not say</option>
              </select>
              {fieldErrors.gender && (
                <span className="field-error">⚠ {fieldErrors.gender}</span>
              )}
            </div>

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