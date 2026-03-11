import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../../config";

function RecommendedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/jobs/recommended`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setJobs(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const getScoreMeta = (score) => {
    if (score >= 80) return { color: "#6fffc0", bg: "rgba(99,255,180,0.1)", border: "rgba(99,255,180,0.2)", label: "Excellent Match" };
    if (score >= 50) return { color: "#ffd166", bg: "rgba(255,209,102,0.1)", border: "rgba(255,209,102,0.2)", label: "Good Match" };
    return { color: "#888", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.08)", label: "Partial Match" };
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

        .rec-page { animation: fadeUp 0.4s ease forwards; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header { margin-bottom: 28px; }

        .page-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800;
          color: white; letter-spacing: -0.02em; margin-bottom: 5px;
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

        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .job-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 22px;
          display: flex; flex-direction: column; gap: 14px;
          transition: all 0.25s ease;
        }

        .job-card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(108,99,255,0.2);
          transform: translateY(-2px);
        }

        .job-card-top {
          display: flex; align-items: center; gap: 12px;
        }

        .company-logo {
          width: 44px; height: 44px; border-radius: 10px;
          background: white; padding: 5px;
          object-fit: contain; flex-shrink: 0;
        }

        .job-role {
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          color: white; margin-bottom: 3px; line-height: 1.3;
        }

        .job-company {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: #555;
        }

        .job-location {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: #444;
          display: flex; align-items: center; gap: 5px;
        }

        .score-bar-wrapper {
          display: flex; flex-direction: column; gap: 6px;
        }

        .score-bar-top {
          display: flex; justify-content: space-between;
          align-items: center;
        }

        .score-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
        }

        .score-number {
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 800;
        }

        .score-bar-bg {
          height: 5px; border-radius: 100px;
          background: rgba(255,255,255,0.06); overflow: hidden;
        }

        .score-bar-fill {
          height: 100%; border-radius: 100px;
          transition: width 0.8s ease;
        }

        .score-badge {
          display: inline-flex; align-items: center;
          padding: 4px 10px; border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 600;
        }

        .card-bottom {
          display: flex; justify-content: space-between;
          align-items: center; margin-top: auto; gap: 10px;
        }

        .apply-btn {
          padding: 9px 18px; flex: 1;
          background: linear-gradient(135deg, #6c63ff, #5a54e8);
          border: none; color: white;
          font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border-radius: 9px; cursor: pointer;
          transition: all 0.2s ease;
        }

        .apply-btn:hover {
          box-shadow: 0 6px 20px rgba(108,99,255,0.35);
          transform: translateY(-1px);
        }

        /* Skeleton */
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .skeleton-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px; padding: 22px;
          display: flex; flex-direction: column; gap: 14px;
        }

        .skeleton-line {
          border-radius: 6px; background: rgba(255,255,255,0.05);
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        .empty-state {
          text-align: center; padding: 60px 20px;
        }

        .empty-icon { font-size: 48px; margin-bottom: 16px; }

        .empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px; font-weight: 700;
          color: white; margin-bottom: 8px;
        }

        .empty-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #444; max-width: 340px; margin: 0 auto;
          line-height: 1.6;
        }

        .info-banner {
          display: flex; align-items: center; gap: 12px;
          background: rgba(108,99,255,0.08);
          border: 1px solid rgba(108,99,255,0.15);
          border-radius: 12px; padding: 14px 18px;
          margin-bottom: 24px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #a09bff;
        }
      `}</style>

      <div className="rec-page">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Recommended <span>Jobs</span></h1>
          <p className="page-subtitle">AI-matched jobs based on your skills and preferred role</p>
        </div>

        {/* Info Banner */}
        {!loading && jobs.length > 0 && (
          <div className="info-banner">
            🎯 Showing <strong style={{ margin: "0 4px" }}>{jobs.length}</strong> jobs with 75%+ match score for your profile
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="skeleton-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div style={{ display: "flex", gap: "12px" }}>
                  <div className="skeleton-line" style={{ width: 44, height: 44, borderRadius: 10 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton-line" style={{ height: 15, width: "65%", marginBottom: 8 }} />
                    <div className="skeleton-line" style={{ height: 11, width: "40%" }} />
                  </div>
                </div>
                <div className="skeleton-line" style={{ height: 5, width: "100%", borderRadius: 100 }} />
                <div className="skeleton-line" style={{ height: 36, borderRadius: 9 }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <div className="empty-title">No matches found yet</div>
            <p className="empty-desc">
              Update your <strong>skills</strong> and <strong>preferred role</strong> in your Profile to get personalized job recommendations.
            </p>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && jobs.length > 0 && (
          <div className="jobs-grid">
            {jobs.map((job, index) => {
              const meta = getScoreMeta(job.matchScore);
              return (
                <div key={index} className="job-card">
                  {/* Top */}
                  <div className="job-card-top">
                    <img
                      src={`https://logo.clearbit.com/${job.company?.toLowerCase().replace(/\s/g, "")}.com`}
                      alt={job.company}
                      className="company-logo"
                      onError={(e) => {
                        e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                      }}
                    />
                    <div>
                      <div className="job-role">{job.role}</div>
                      <div className="job-company">{job.company}</div>
                    </div>
                  </div>

                  {/* Location */}
                  {job.location && (
                    <div className="job-location">📍 {job.location}</div>
                  )}

                  {/* Match Score Bar */}
                  <div className="score-bar-wrapper">
                    <div className="score-bar-top">
                      <span
                        className="score-label"
                        style={{ color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      <span
                        className="score-number"
                        style={{ color: meta.color }}
                      >
                        {job.matchScore}%
                      </span>
                    </div>
                    <div className="score-bar-bg">
                      <div
                        className="score-bar-fill"
                        style={{
                          width: `${job.matchScore}%`,
                          background: meta.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="card-bottom">
                    <span
                      className="score-badge"
                      style={{
                        background: meta.bg,
                        border: `1px solid ${meta.border}`,
                        color: meta.color,
                      }}
                    >
                      🎯 {job.matchScore}% match
                    </span>
                    <button
                      className="apply-btn"
                      onClick={() => window.open(job.applyLink, "_blank")}
                    >
                      Apply Now →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default RecommendedJobs;