import { useNavigate } from "react-router-dom";

function Welcome() {

  const navigate = useNavigate();

  return (

    <div
  style={{
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#1e1e1e",
    color: "white",
    textAlign: "center"
  }}
>

      <h1 style={{ fontSize: "40px", marginBottom: "10px" }}>
        Welcome to Career Companion
      </h1>

      <p style={{ marginBottom: "40px", color: "#bbb" }}>
        Your AI powered job tracking and recommendation platform
      </p>

      <div style={{ display: "flex", gap: "20px" }}>

        <button
          onClick={() => navigate("/register")}
          style={{
            padding: "12px 25px",
            fontSize: "16px",
            borderRadius: "6px",
            border: "none",
            background: "#28a745",
            color: "white",
            cursor: "pointer"
          }}
        >
          New User Registration
        </button>

        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "12px 25px",
            fontSize: "16px",
            borderRadius: "6px",
            border: "none",
            background: "#007bff",
            color: "white",
            cursor: "pointer"
          }}
        >
          Login
        </button>

      </div>

    </div>

  );

}

export default Welcome;