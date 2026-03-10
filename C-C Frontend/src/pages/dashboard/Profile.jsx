import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [preferredRole, setPreferredRole] = useState("");
  const [skills, setSkills] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPreferredRole(res.data.preferredRole || "");
        setSkills(res.data.skills ? res.data.skills.join(", ") : "");

      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  // Update profile
  const handleSave = async () => {
    try {

      const skillsArray = skills
        .split(",")
        .map(skill => skill.trim());

      await axios.put(
        "http://localhost:8000/api/user/profile",
        { 
          preferredRole,
          skills: skillsArray
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Profile updated successfully ✅");

    } catch (error) {
      setMessage("Failed to update profile ❌");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Profile</h2>

      <div style={{ marginTop: "20px" }}>
        <label>Preferred Role:</label>
        <br />
        <input
          type="text"
          value={preferredRole}
          onChange={(e) => setPreferredRole(e.target.value)}
          placeholder="Enter your preferred role"
          style={{
            padding: "8px",
            width: "300px",
            marginTop: "5px"
          }}
        />
      </div>

      {/* NEW SKILLS INPUT */}

      <div style={{ marginTop: "20px" }}>
        <label>Skills (comma separated):</label>
        <br />
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Node.js, MongoDB, Express"
          style={{
            padding: "8px",
            width: "300px",
            marginTop: "5px"
          }}
        />
      </div>

      <button
        onClick={handleSave}
        style={{
          marginTop: "15px",
          padding: "8px 16px",
          cursor: "pointer"
        }}
      >
        Save
      </button>

      {message && (
        <p style={{ marginTop: "10px" }}>{message}</p>
      )}
    </div>
  );
}

export default Profile;