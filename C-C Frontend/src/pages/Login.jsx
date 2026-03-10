import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    try {

      const res = await axios.post(
        "http://localhost:8000/api/auth/login",
        {
          email,
          password
        }
      );

      localStorage.setItem("token", res.data.token);

      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      alert("Login failed");
    }

  };

  return (

    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#1e1e1e",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >

      <div
        style={{
          background: "#2b2b2b",
          padding: "40px",
          borderRadius: "10px",
          width: "400px",
          boxShadow: "0px 5px 20px rgba(0,0,0,0.5)",
          color: "white"
        }}
      >

        <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
          Login
        </h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "5px",
            border: "1px solid #555",
            background: "#1e1e1e",
            color: "white"
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "25px",
            borderRadius: "5px",
            border: "1px solid #555",
            background: "#1e1e1e",
            color: "white"
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "12px",
            background: "#007bff",
            border: "none",
            color: "white",
            fontSize: "16px",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Login
        </button>

        {/* Divider */}
        <p style={{ textAlign: "center", margin: "20px 0", color: "#aaa" }}>
          OR
        </p>

        {/* Google Login Button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {

              const user = jwt_decode(credentialResponse.credential);

              try {

                const res = await axios.post(
                  "http://localhost:8000/api/auth/google",
                  {
                    email: user.email,
                    name: user.name
                  }
                );

                if (res.data.token) {

                  localStorage.setItem("token", res.data.token);
                  navigate("/dashboard");

                } else {

                  navigate("/register", {
                    state: { email: user.email, name: user.name }
                  });

                }

              } catch (error) {
                console.error(error);
              }

            }}
            onError={() => {
              console.log("Google Login Failed");
            }}
          />
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#aaa" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#007bff",
              fontWeight: "bold",
              textDecoration: "none"
            }}
          >
            Register
          </Link>
        </p>

      </div>

    </div>

  );

}

export default Login;