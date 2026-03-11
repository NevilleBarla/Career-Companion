import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../../config";
import { useNavigate } from "react-router-dom";

function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const cards = [
    {
      icon: "🎯",
      title: "Recommended Jobs",
      desc: "AI-matched jobs based on your skills and preferred role",
      color: "rgba(108,99,255,0.12)",
      border: "rgba(108,99,255,0.2)",
      link: "/dashboard/recommended-jobs",
    },
    {
      icon: "💼",
      title: "Available Jobs",
      desc: "Browse all live remote job listings updated in real-time",
      color: "rgba(99,179,255,0.1)",
      border: "rgba(99,179,255,0.18)",
      link: "/dashboard/available-jobs",
    },
    {
      icon: "📄",
      title: "Resume Analyzer",
      desc: "Upload your resume and get an AI score with tips",
      color: "rgba(99,255,180,0.08)",
      border: "rgba(99,255,180,0.15)",
      link: "/dashboard/resume",
    },
    {
      icon: "👤",
      title: "My Profile",
      desc: "Update your skills, role preference and personal info",
      color: "rgba(255,180,99,0.08)",
      border: "rgba(255,180,99,0.15)",
      link: "/dashboard/profile",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

        .home-page { animation: fadeUp 0.4s ease forwards; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .home-header { margin-bottom: 36px; }

        .home-greeting {
          font-family: 'Syne', sans-serif;
          font-size: 30px;
          font-weight: 800;
          color: white;
          margin-bottom: 6px;
          letter-spacing: -0.02em;
        }

        .home-greeting span {
          background: linear-gradient(135deg, #6c63ff, #63b3ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .home-subtext {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #444;
        }

        .skills-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 16px;
          margin-bottom: 36px;
        }

        .skill-chip {
          padding: 5px 12px;
          background: rgba(108,99,255,0.1);
          border: 1px solid rgba(108,99,255,0.2);
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: #a09bff;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99,255,180,0.07);
          border: 1px solid rgba(99,255,180,0.15);
          border-radius: 100px;
          padding: 5px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: #6fffc0;
          margin-bottom: 12px;
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: white;
          margin-bottom: 16px;
          letter-spacing: -0.01em;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }

        .dash-card {
          background: rgba(255,255,255,0.03);
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.25s ease;
          border: 1px solid rgba(255,255,255,0.06);
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .dash-card:hover {
          transform: translateY(-3px);
          border-color: rgba(108,99,255,0.25);
          background: rgba(255,255,255,0.05);
        }

        .card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 4px;
        }

        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: white;
        }

        .card-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #444;
          line-height: 1.6;
        }

        .card-arrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: #333;
          margin-top: auto;
          transition: color 0.2s;
        }

        .dash-card:hover .card-arrow { color: #6c63ff; }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 32px 0;
        }
      `}</style>

      <div className="home-page">
        {/* Header */}
        <div className="home-header">
          <h1 className="home-greeting">
            Welcome back,{" "}
            <span>{user ? user.name.split(" ")[0] : "..."}</span> 👋
          </h1>
          <p className="home-subtext">
            Here's your career dashboard — everything you need in one place.
          </p>
        </div>

        {/* Role + Skills */}
        {user && (
          <>
            {user.preferredRole && (
              <div className="role-badge">
                🎯 Looking for: <strong>{user.preferredRole}</strong>
              </div>
            )}
            {user.skills && user.skills.length > 0 && (
              <div className="skills-row">
                {user.skills.map((skill, i) => (
                  <span key={i} className="skill-chip">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        <div className="divider" />

        {/* Quick Access Cards */}
        <div className="section-title">Quick Access</div>
        <div className="cards-grid">
          {cards.map((card) => (
            <div
              key={card.title}
              className="dash-card"
              onClick={() => navigate(card.link)}
            >
              <div
                className="card-icon"
                style={{
                  background: card.color,
                  border: `1px solid ${card.border}`,
                }}
              >
                {card.icon}
              </div>
              <div className="card-title">{card.title}</div>
              <div className="card-desc">{card.desc}</div>
              <div className="card-arrow">Go there →</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;