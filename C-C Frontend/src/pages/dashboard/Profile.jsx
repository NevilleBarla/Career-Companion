import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState(null);
  const [preferredRole, setPreferredRole] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [mobile, setMobile] = useState("");
  const [experience, setExperience] = useState("");
  const [qualification, setQualification] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const u = res.data;
        setUser(u);
        setPreferredRole(u.preferredRole || "");
        setPreferredLocation(u.preferredLocation || "");
        setSkills(u.skills ? u.skills.join(", ") : "");
        setMobile(u.mobile || "");
        setExperience(u.experience || "");
        setQualification(u.qualification || "");
        setGender(u.gender || "");
        setAge(u.age || "");
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      await axios.put(
        "http://localhost:8000/api/user/profile",
        {
          preferredRole,
          preferredLocation,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          mobile,
          experience,
          qualification,
          gender,
          age: Number(age),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ text: "Profile updated successfully!", type: "success" });
    } catch (error) {
      setMessage({ text: "Failed to update profile. Try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "13px 16px",
    background: focusedField === field ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
    border: focusedField === field ? "1px solid #6c63ff" : "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "white",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(108,99,255,0.12)" : "none",
  });

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    color: "#555",
    textTransform: "uppercase",
    marginBottom: "7px",
    fontFamily: "'DM Sans', sans-serif",
  };

  const fields = [
    { label: "Preferred Role", value: preferredRole, setter: setPreferredRole, placeholder: "e.g. Frontend Developer", id: "preferredRole" },
    { label: "Preferred Location", value: preferredLocation, setter: setPreferredLocation, placeholder: "e.g. India, USA, Remote", id: "preferredLocation" },
    { label: "Skills (comma separated)", value: skills, setter: setSkills, placeholder: "React, Node.js, Python...", id: "skills" },
    { label: "Mobile Number", value: mobile, setter: setMobile, placeholder: "+91 98765 43210", id: "mobile" },
    { label: "Past Experience", value: experience, setter: setExperience, placeholder: "e.g. 2 years at TCS", id: "experience" },
    { label: "Qualification", value: qualification, setter: setQualification, placeholder: "e.g. B.Tech Computer Science", id: "qualification" },
    { label: "Gender", value: gender, setter: setGender, placeholder: "e.g. Male / Female", id: "gender" },
    { label: "Age", value: age, setter: setAge, placeholder: "e.g. 22", id: "age", type: "number" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

        .profile-page { animation: fadeUp 0.4s ease forwards; max-width: 860px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header { margin-bottom: 32px; }

        .page-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800;
          color: white; letter-spacing: -0.02em; margin-bottom: 6px;
        }

        .page-title span {
          background: linear-gradient(135deg, #6c63ff, #63b3ff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #444;
        }

        .profile-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 32px;
          margin-bottom: 20px;
        }

        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          color: #888; letter-spacing: 0.05em;
          text-transform: uppercase; margin-bottom: 22px;
          display: flex; align-items: center; gap: 8px;
        }

        .user-banner {
          display: flex; align-items: center; gap: 20px;
          margin-bottom: 0;
        }

        .avatar {
          width: 60px; height: 60px;
          background: linear-gradient(135deg, #6c63ff, #63b3ff);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800; color: white;
          flex-shrink: 0;
        }

        .user-info-name {
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 800; color: white;
          margin-bottom: 4px;
        }

        .user-info-email {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #444;
        }

        .skills-preview {
          display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;
        }

        .skill-chip {
          padding: 4px 12px;
          background: rgba(108,99,255,0.1);
          border: 1px solid rgba(108,99,255,0.2);
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 500; color: #a09bff;
        }

        .form-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .field-group { display: flex; flex-direction: column; }

        .field-group.full-width { grid-column: 1 / -1; }

        .save-btn {
          padding: 14px 32px;
          background: linear-gradient(135deg, #6c63ff, #5a54e8);
          border: none; color: white;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border-radius: 10px; cursor: pointer;
          transition: all 0.25s ease;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(108,99,255,0.35);
        }

        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .message-box {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 16px; border-radius: 9px;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          font-weight: 500; margin-left: 14px;
          animation: fadeUp 0.3s ease;
        }

        .message-box.success {
          background: rgba(99,255,180,0.08);
          border: 1px solid rgba(99,255,180,0.2);
          color: #6fffc0;
        }

        .message-box.error {
          background: rgba(255,80,80,0.08);
          border: 1px solid rgba(255,80,80,0.2);
          color: #ff6b6b;
        }

        .divider {
          height: 1px; background: rgba(255,255,255,0.05);
          margin: 24px 0;
        }

        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input::placeholder { color: #2e2e2e; }

        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr; }
          .user-banner { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="profile-page">
        <div className="page-header">
          <h1 className="page-title">My <span>Profile</span></h1>
          <p className="page-subtitle">Update your information to get better job recommendations</p>
        </div>

        {/* User Banner */}
        {user && (
          <div className="profile-card">
            <div className="user-banner">
              <div className="avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div>
                <div className="user-info-name">{user.name}</div>
                <div className="user-info-email">{user.email}</div>
                {user.skills && user.skills.length > 0 && (
                  <div className="skills-preview">
                    {user.skills.slice(0, 5).map((s, i) => (
                      <span key={i} className="skill-chip">{s}</span>
                    ))}
                    {user.skills.length > 5 && (
                      <span className="skill-chip">+{user.skills.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <div className="profile-card">
          <div className="card-title">✏️ Edit Information</div>

          <div className="form-grid">
            {fields.map((field) => (
              <div
                key={field.id}
                className={`field-group ${field.id === "skills" ? "full-width" : ""}`}
              >
                <label style={labelStyle}>{field.label}</label>
                <input
                  type={field.type || "text"}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  onFocus={() => setFocusedField(field.id)}
                  onBlur={() => setFocusedField("")}
                  placeholder={field.placeholder}
                  style={inputStyle(field.id)}
                />
              </div>
            ))}
          </div>

          <div className="divider" />

          <div style={{ display: "flex", alignItems: "center" }}>
            <button className="save-btn" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes →"}
            </button>
            {message.text && (
              <div className={`message-box ${message.type}`}>
                {message.type === "success" ? "✅" : "⚠"} {message.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;