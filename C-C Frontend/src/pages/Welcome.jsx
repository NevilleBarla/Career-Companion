import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #0d0d0f; overflow-x: hidden; }

        .welcome-page {
          min-height: 100vh;
          width: 100vw;
          background: #0d0d0f;
          color: white;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* ---- Background Effects ---- */
        .bg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        .bg-orb-1 {
          position: fixed;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(108,99,255,0.13) 0%, transparent 65%);
          top: -200px;
          right: -100px;
          pointer-events: none;
          z-index: 0;
        }

        .bg-orb-2 {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,179,255,0.09) 0%, transparent 65%);
          bottom: -150px;
          left: -150px;
          pointer-events: none;
          z-index: 0;
        }

        .bg-orb-3 {
          position: fixed;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,99,150,0.06) 0%, transparent 65%);
          top: 50%;
          left: 30%;
          pointer-events: none;
          z-index: 0;
        }

        /* ---- Navbar ---- */
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 60px;
          position: relative;
          z-index: 10;
          animation: fadeDown 0.6s ease forwards;
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #6c63ff, #63b3ff);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .nav-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .nav-btn-ghost {
          padding: 9px 20px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          color: #aaa;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-btn-ghost:hover {
          border-color: rgba(255,255,255,0.3);
          color: white;
        }

        .nav-btn-solid {
          padding: 9px 20px;
          background: linear-gradient(135deg, #6c63ff, #5a54e8);
          border: none;
          color: white;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-btn-solid:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(108,99,255,0.35);
        }

        /* ---- Hero ---- */
        .hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 24px 80px;
          position: relative;
          z-index: 5;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(108,99,255,0.12);
          border: 1px solid rgba(108,99,255,0.28);
          border-radius: 100px;
          padding: 7px 18px;
          margin-bottom: 32px;
          animation: fadeUp 0.6s ease 0.1s both;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6c63ff;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }

        .badge-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #8b85ff;
          letter-spacing: 0.04em;
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(42px, 7vw, 80px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: white;
          max-width: 820px;
          margin-bottom: 24px;
          animation: fadeUp 0.6s ease 0.2s both;
        }

        .hero-title .gradient-text {
          background: linear-gradient(135deg, #6c63ff 0%, #63b3ff 50%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(15px, 2vw, 18px);
          color: #555;
          max-width: 520px;
          line-height: 1.7;
          margin-bottom: 44px;
          animation: fadeUp 0.6s ease 0.3s both;
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeUp 0.6s ease 0.4s both;
          margin-bottom: 64px;
        }

        .btn-primary {
          padding: 15px 32px;
          background: linear-gradient(135deg, #6c63ff, #5a54e8);
          border: none;
          color: white;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s ease;
          letter-spacing: 0.01em;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 35px rgba(108,99,255,0.4);
        }

        .btn-secondary {
          padding: 15px 32px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #bbb;
          font-size: 15px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .btn-secondary:hover {
          border-color: rgba(255,255,255,0.25);
          color: white;
          background: rgba(255,255,255,0.07);
        }

        /* ---- Feature Cards ---- */
        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          max-width: 900px;
          width: 100%;
          animation: fadeUp 0.6s ease 0.5s both;
        }

        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 24px;
          text-align: left;
          transition: all 0.25s ease;
        }

        .feature-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(108,99,255,0.25);
          transform: translateY(-3px);
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          margin-bottom: 14px;
        }

        .feature-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: white;
          margin-bottom: 6px;
        }

        .feature-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #555;
          line-height: 1.6;
        }

        /* ---- Stats Row ---- */
        .stats-row {
          display: flex;
          gap: 40px;
          justify-content: center;
          margin-top: 48px;
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.06);
          width: 100%;
          max-width: 900px;
          animation: fadeUp 0.6s ease 0.65s both;
          flex-wrap: wrap;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #6c63ff, #63b3ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: #444;
          margin-top: 4px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .navbar { padding: 20px 24px; }
          .features { grid-template-columns: 1fr; max-width: 420px; }
          .stats-row { gap: 24px; }
          .nav-logo span { display: none; }
        }
      `}</style>

      <div className="welcome-page">
        <div className="bg-grid" />
        <div className="bg-orb-1" />
        <div className="bg-orb-2" />
        <div className="bg-orb-3" />

        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-logo">
            <div className="logo-icon">🧭</div>
            <span>Career Companion</span>
          </div>
          <div className="nav-actions">
            <button className="nav-btn-ghost" onClick={() => navigate("/login")}>
              Sign In
            </button>
            <button className="nav-btn-solid" onClick={() => navigate("/register")}>
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="hero">

          <div className="hero-badge">
            <div className="badge-dot" />
            <span className="badge-text">AI-Powered Career Platform</span>
          </div>

          <h1 className="hero-title">
            Your career,<br />
            guided by <span className="gradient-text">intelligence</span>
          </h1>

          <p className="hero-subtitle">
            Land your dream job faster. AI-matched opportunities, smart resume analysis, 
            and real-time application tracking — all in one place.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate("/register")}>
              Start for free →
            </button>
            <button className="btn-secondary" onClick={() => navigate("/login")}>
              I have an account
            </button>
          </div>

          {/* Feature Cards */}
          <div className="features">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: "rgba(108,99,255,0.15)" }}>
                🎯
              </div>
              <div className="feature-title">AI Job Matching</div>
              <div className="feature-desc">
                Get jobs scored and ranked based on your skills and preferred role.
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: "rgba(99,179,255,0.12)" }}>
                📄
              </div>
              <div className="feature-title">Resume Analyzer</div>
              <div className="feature-desc">
                Upload your resume and get an AI score with improvement tips.
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: "rgba(99,255,180,0.1)" }}>
                📊
              </div>
              <div className="feature-title">Application Tracker</div>
              <div className="feature-desc">
                Track every application with status updates and deadline alerts.
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Live Jobs</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">AI</div>
              <div className="stat-label">Powered Matching</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Free to Use</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">Real-time</div>
              <div className="stat-label">Job Updates</div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Welcome;