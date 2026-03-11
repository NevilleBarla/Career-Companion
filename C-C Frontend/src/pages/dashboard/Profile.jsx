import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../config";

function Profile() {
  const [user, setUser] = useState(null);
  const [preferredRole, setPreferredRole] = useState([]);
  const [roleInput, setRoleInput] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [mobile, setMobile] = useState("");
  const [experience, setExperience] = useState("");
  const [qualification, setQualification] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [original, setOriginal] = useState(null); // snapshot of saved state
  const [isDirty, setIsDirty] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const u = res.data;
        setUser(u);
        setPreferredRole(u.preferredRole ? u.preferredRole.split(",").map(s => s.trim()).filter(Boolean) : []);
        setPreferredLocation(u.preferredLocation || "");
        setSelectedSkills(u.skills || []);
        setMobile(u.mobile || "");
        setExperience(u.experience || "");
        setQualification(u.qualification || "");
        setGender(u.gender || "");
        setAge(u.age || "");
        // Save original snapshot for dirty detection
        setOriginal({
          preferredRole: u.preferredRole ? u.preferredRole.split(",").map(s => s.trim()).filter(Boolean) : [],
          preferredLocation: u.preferredLocation || "",
          selectedSkills: u.skills || [],
          mobile: u.mobile || "",
          experience: u.experience || "",
          qualification: u.qualification || "",
          gender: u.gender || "",
          age: String(u.age || ""),
        });
        setIsDirty(false);
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
        `${BASE_URL}/api/user/profile`,
        {
          preferredRole: preferredRole.join(", "),
          preferredLocation,
          skills: selectedSkills,
          mobile,
          experience,
          qualification,
          gender,
          age: Number(age),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ text: "Profile updated successfully!", type: "success" });
      setIsDirty(false);
      setOriginal({ preferredRole, preferredLocation, selectedSkills, mobile, experience, qualification, gender, age: String(age) });
    } catch (error) {
      setMessage({ text: "Failed to update profile. Try again.", type: "error" });
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
    "Database Administrator", "Digital Marketing Specialist", "SEO Specialist",
    "Content Writer", "Social Media Manager", "Sales Executive",
    "Business Development Manager", "HR Manager", "Recruiter",
    "Financial Analyst", "Accountant", "Technical Support Engineer", "IT Administrator",
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
    setPreferredRole(prev => {
      const next = prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role];
      if (original) setIsDirty(JSON.stringify(next) !== JSON.stringify(original.preferredRole));
      return next;
    });
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => {
      const next = prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill];
      if (original) setIsDirty(JSON.stringify(next) !== JSON.stringify(original.selectedSkills));
      return next;
    });
  };

  const addCustomRole = () => {
    const val = roleInput.trim();
    if (val && !preferredRole.includes(val)) {
      setPreferredRole(prev => { const next = [...prev, val]; if (original) setIsDirty(JSON.stringify(next) !== JSON.stringify(original.preferredRole)); return next; });
    }
    setRoleInput("");
  };

  const addCustomSkill = () => {
    const val = skillInput.trim();
    if (val && !selectedSkills.includes(val)) {
      setSelectedSkills(prev => { const next = [...prev, val]; if (original) setIsDirty(JSON.stringify(next) !== JSON.stringify(original.selectedSkills)); return next; });
    }
    setSkillInput("");
  };

  // Mark dirty whenever any field changes vs original
  const checkDirty = (field, value) => {
    if (!original) return;
    const current = {
      preferredRole, preferredLocation, selectedSkills,
      mobile, experience, qualification, gender, age: String(age),
      [field]: value,
    };
    const changed =
      JSON.stringify(current.preferredRole) !== JSON.stringify(original.preferredRole) ||
      JSON.stringify(current.selectedSkills) !== JSON.stringify(original.selectedSkills) ||
      current.preferredLocation !== original.preferredLocation ||
      current.mobile !== original.mobile ||
      current.experience !== original.experience ||
      current.qualification !== original.qualification ||
      current.gender !== original.gender ||
      String(current.age) !== String(original.age);
    setIsDirty(changed);
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
    { label: "Preferred Location", value: preferredLocation, setter: setPreferredLocation, placeholder: "e.g. India, USA, Remote", id: "preferredLocation" },
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


        .multi-section { margin-bottom: 0; grid-column: 1 / -1; }
        .multi-section-label {
          display: block; font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; color: #555; text-transform: uppercase;
          margin-bottom: 8px; font-family: 'DM Sans', sans-serif;
        }
        .multi-custom-input { display: flex; gap: 8px; margin-bottom: 10px; }
        .multi-custom-input input {
          flex: 1; padding: 10px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; color: white;
          font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none;
        }
        .multi-custom-input input:focus { border-color: #6c63ff; }
        .multi-add-btn {
          padding: 10px 16px; background: rgba(108,99,255,0.15);
          border: 1px solid rgba(108,99,255,0.3); border-radius: 8px;
          color: #a09bff; font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s;
        }
        .multi-add-btn:hover { background: rgba(108,99,255,0.25); }
        .chips-wrap { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 10px; min-height: 32px; }
        .chip-selected {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; background: rgba(108,99,255,0.15);
          border: 1px solid rgba(108,99,255,0.35); border-radius: 100px;
          font-size: 12px; font-weight: 500; color: #a09bff;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s;
        }
        .chip-selected:hover { background: rgba(255,80,80,0.1); border-color: rgba(255,80,80,0.3); color: #ff6b6b; }
        .chip-option {
          display: inline-flex; padding: 5px 12px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px; font-size: 12px; color: #555;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s;
        }
        .chip-option:hover { background: rgba(108,99,255,0.1); border-color: rgba(108,99,255,0.25); color: #a09bff; }
        .options-scroll {
          max-height: 150px; overflow-y: auto;
          display: flex; flex-wrap: wrap; gap: 7px; padding: 4px 2px;
        }
        .options-scroll::-webkit-scrollbar { width: 4px; }
        .options-scroll::-webkit-scrollbar-thumb { background: rgba(108,99,255,0.3); border-radius: 4px; }

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

        .save-btn-wrap {
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
        }
        .dirty-hint {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: #ffd166;
        }
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

        .save-btn:disabled { opacity: 0.35; cursor: not-allowed; filter: grayscale(0.4); }

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
                  onChange={(e) => { field.setter(e.target.value); checkDirty(field.id, e.target.value); }}
                  onFocus={() => setFocusedField(field.id)}
                  onBlur={() => setFocusedField("")}
                  placeholder={field.placeholder}
                  style={inputStyle(field.id)}
                />
              </div>
            ))}
          </div>

          <div className="divider" />

          {/* Preferred Role Multi-Select — full width */}
          <div className="multi-section" style={{ marginBottom: "24px" }}>
            <label className="multi-section-label">Preferred Role(s)</label>
            {preferredRole.length > 0 && (
              <div className="chips-wrap">
                {preferredRole.map(r => (
                  <span key={r} className="chip-selected" onClick={() => toggleRole(r)}>{r} ✕</span>
                ))}
              </div>
            )}
            <div className="multi-custom-input">
              <input placeholder="Type a custom role and press Enter..."
                value={roleInput}
                onChange={e => setRoleInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustomRole()} />
              <button className="multi-add-btn" onClick={addCustomRole}>+ Add</button>
            </div>
            <div className="options-scroll">
              {JOB_ROLES.filter(r => !preferredRole.includes(r)).map(r => (
                <span key={r} className="chip-option" onClick={() => toggleRole(r)}>+ {r}</span>
              ))}
            </div>
          </div>

          <div className="divider" />

          {/* Skills Multi-Select — full width */}
          <div className="multi-section" style={{ marginBottom: "8px" }}>
            <label className="multi-section-label">Skills</label>
            {selectedSkills.length > 0 && (
              <div className="chips-wrap">
                {selectedSkills.map(s => (
                  <span key={s} className="chip-selected" onClick={() => toggleSkill(s)}>{s} ✕</span>
                ))}
              </div>
            )}
            <div className="multi-custom-input">
              <input placeholder="Type a custom skill and press Enter..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustomSkill()} />
              <button className="multi-add-btn" onClick={addCustomSkill}>+ Add</button>
            </div>
            <div className="options-scroll">
              {SKILLS_LIST.filter(s => !selectedSkills.includes(s)).map(s => (
                <span key={s} className="chip-option" onClick={() => toggleSkill(s)}>+ {s}</span>
              ))}
            </div>
          </div>

          {/* Save Button — full width at the very bottom */}
          <div className="save-btn-wrap">
            {isDirty && <span className="dirty-hint">● Unsaved changes</span>}
            {message.text && (
              <div className={`message-box ${message.type}`} style={{ margin: 0 }}>
                {message.type === "success" ? "✅" : "⚠"} {message.text}
              </div>
            )}
            <button className="save-btn" onClick={handleSave} disabled={loading || !isDirty}>
              {loading ? "Saving..." : "Save Changes →"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default Profile;