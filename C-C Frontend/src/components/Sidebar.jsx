import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  display: "block",
  padding: "10px",
  marginBottom: "8px",
  textDecoration: "none",
  color: isActive ? "#fff" : "#ccc",
  backgroundColor: isActive ? "#333" : "transparent",
  borderRadius: "5px"
});

function Sidebar() {
  return (
    <div
      style={{
        width: "200px",
        padding: "15px",
        borderRight: "1px solid #444",
        minHeight: "100vh"
      }}
    >
      <NavLink to="/dashboard/home" style={linkStyle}>
        Home
      </NavLink>

      <NavLink to="/dashboard/recommended-jobs" style={linkStyle}>
        Recommended Jobs
      </NavLink>

      <NavLink to="/dashboard/available-jobs" style={linkStyle}>
        Available Jobs
      </NavLink>

      <NavLink to="/dashboard/resume" style={linkStyle}>
        Resume Analyzer
      </NavLink>

      <NavLink to="/dashboard/profile" style={linkStyle}>
        Profile
      </NavLink>
    </div>
  );
}

export default Sidebar;
