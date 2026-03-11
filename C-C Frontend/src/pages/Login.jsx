import { useState } from "react";
import axios from "axios";
import BASE_URL from "../../config";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #0d0d0f; }

        .login-page {
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
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%);
          top: -150px;
          left: -150px;
          pointer-events: none;
        }

        .bg-orb-2 {
          position: fixed;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,179,255,0.07) 0%, transparent 70%);
          bottom: -100px;
          right: -100px;
          pointer-events: none;
        }

        .bg-grid {
          position: fixed;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 48px 44px;
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
          margin-bottom: 36px;
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
          font-size: 34px;
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
          color: #555;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 18px;
          animation: fadeUp 0.4s ease forwards;
          opacity: 0;
        }

        .field-group:nth-child(1) { animation-delay: 0.1s; }
        .field-group:nth-child(2) { animation-delay: 0.18s; }

        .field-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .error-box {
          background: rgba(255, 80, 80, 0.08);
          border: 1px solid rgba(255, 80, 80, 0.25);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #ff6b6b;
          animation: fadeUp 0.3s ease;
        }

        .login-btn {
          width: 100%;
          padding: 15px;
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
          margin-top: 8px;
          position: relative;
          overflow: hidden;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(108,99,255,0.4);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 24px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }

        .divider-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: #444;
        }

        .google-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .register-link {
          text-align: center;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #555;
          padding-top: 4px;
        }

        .register-link a {
          color: #6c63ff;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }

        .register-link a:hover {
          color: #8b85ff;
        }

        input::placeholder { color: #3a3a3a; }

        @media (max-width: 480px) {
          .login-card { padding: 36px 24px; }
          .page-title { font-size: 28px; }
        }
      `}</style>

      <div className="login-page">
        <div className="bg-orb-1" />
        <div className="bg-orb-2" />
        <div className="bg-grid" />

        <div className="login-card">

          {/* Header */}
          <div className="card-header">
            <div className="brand-badge">
              <div className="brand-dot" />
              <span className="brand-text">Career Companion</span>
            </div>
            <h1 className="page-title">
              Welcome <span>back</span>
            </h1>
            <p className="page-subtitle">Sign in to continue your career journey</p>
          </div>

          {/* Google Login */}
          <div className="google-wrapper">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                const user = jwtDecode(credentialResponse.credential);
                try {
                  const res = await axios.post(
                    `${BASE_URL}/api/auth/google`,
                    { email: user.email, name: user.name }
                  );
                  if (res.data.token) {
                    localStorage.setItem("token", res.data.token);
                    navigate("/dashboard");
                  } else {
                    navigate("/register", {
                      state: { email: user.email, name: user.name },
                    });
                  }
                } catch (error) {
                  console.error(error);
                  setError("Google login failed. Please try again.");
                }
              }}
              onError={() => setError("Google login failed. Please try again.")}
            />
          </div>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">or sign in with email</span>
            <div className="divider-line" />
          </div>

          {/* Error */}
          {error && <div className="error-box">⚠ {error}</div>}

          {/* Email Field */}
          <div className="field-group">
            <label className="field-label">Email Address</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField("")}
              onKeyDown={handleKeyDown}
              style={inputStyle("email")}
            />
          </div>

          {/* Password Field */}
          <div className="field-group">
            <label className="field-label">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField("")}
              onKeyDown={handleKeyDown}
              style={inputStyle("password")}
            />
          </div>

          {/* Login Button */}
          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          {/* Register Link */}
          <div className="register-link" style={{ marginTop: "24px" }}>
            Don't have an account? <Link to="/register">Create one →</Link>
          </div>

        </div>
      </div>
    </>
  );
}

export default Login;