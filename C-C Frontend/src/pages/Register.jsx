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

  const handleRegister = async () => {

    try {

      await axios.post(
        "http://localhost:8000/api/auth/register",
        {
          name,
          email,
          password,
          mobile,
          preferredRole,
          skills: skills.split(",").map(s => s.trim()),
          experience,
          qualification,
          gender,
          age
        }
      );

      navigate("/login");

    } catch (error) {
      console.error(error);
    }

  };

  return (

    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#1e1e1e",
        color: "white",
        padding: "40px"
      }}
    >

      {/* Page Title */}
      <h1
        style={{
          textAlign: "center",
          marginBottom: "40px"
        }}
      >
        Create Account
      </h1>


      {/* Form Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "25px",
          maxWidth: "900px",
          margin: "0 auto"
        }}
      >

        <input placeholder="Name" onChange={(e)=>setName(e.target.value)} />
        <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
        <input placeholder="Mobile Number" onChange={(e)=>setMobile(e.target.value)} />
        <input placeholder="Preferred Role" onChange={(e)=>setPreferredRole(e.target.value)} />
        <input placeholder="Skills (comma separated)" onChange={(e)=>setSkills(e.target.value)} />
        <input placeholder="Past Experience" onChange={(e)=>setExperience(e.target.value)} />
        <input placeholder="Qualification" onChange={(e)=>setQualification(e.target.value)} />
        <input placeholder="Gender" onChange={(e)=>setGender(e.target.value)} />
        <input type="number" placeholder="Age" onChange={(e)=>setAge(e.target.value)} />

      </div>


      {/* Register Button */}
      <div style={{ textAlign: "center", marginTop: "40px" }}>

        <button
          onClick={handleRegister}
          style={{
            padding: "12px 30px",
            background: "#28a745",
            border: "none",
            color: "white",
            fontSize: "16px",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Register
        </button>

        {/* Login Redirect */}
        <p style={{ marginTop: "20px", color: "#aaa" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            Login
          </Link>
        </p>

      </div>

    </div>

  );

}

export default Register;