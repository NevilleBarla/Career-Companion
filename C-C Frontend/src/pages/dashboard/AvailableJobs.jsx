import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../config";

function AvailableJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [locationInput, setLocationInput] = useState("");

  const token = localStorage.getItem("token");

  // Load user's preferred location on mount
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const loc = res.data.preferredLocation || "";
        setLocation(loc);
        setLocationInput(loc);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserLocation();
  }, []);

  // Fetch jobs whenever location changes
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/api/jobs/external?location=${encodeURIComponent(location)}`
        );
        setJobs(res.data);
      } catch (error) {
        console.error("Failed to fetch jobs", error);

      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [location]);

  const filtered = jobs.filter(
    (job) =>
      job.role?.toLowerCase().includes(search.toLowerCase()) ||
      job.company?.toLowerCase().includes(search.toLowerCase()) ||
      job.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleLocationSearch = () => {
    setLocation(locationInput);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

        .avail-page { animation: fadeUp 0.4s ease forwards; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; flex-wrap: wrap;
          gap: 16px; margin-bottom: 20px;
        }

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

        .filters-row {
          display: flex; gap: 12px; flex-wrap: wrap;
          margin-bottom: 20px; align-items: center;
        }

        .search-box {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 10px 16px;
          flex: 1; min-width: 200px;
          transition: border-color 0.2s;
        }

        .search-box:focus-within {
          border-color: rgba(108,99,255,0.35);
        }

        .search-box input {
          background: none; border: none; outline: none;
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 13px; width: 100%;
        }

        .search-box input::placeholder { color: #333; }

        .location-box {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 10px 16px;
          flex: 1; min-width: 200px;
          transition: border-color 0.2s;
        }

        .location-box:focus-within {
          border-color: rgba(99,179,255,0.35);
        }

        .location-box input {
          background: none; border: none; outline: none;
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 13px; width: 100%;
        }

        .location-box input::placeholder { color: #333; }

        .location-btn {
          padding: 10px 18px;
          background: linear-gradient(135deg, #6c63ff, #5a54e8);
          border: none; color: white;
          font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border-radius: 10px; cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
        }

        .location-btn:hover {
          box-shadow: 0 4px 16px rgba(108,99,255,0.3);
          transform: translateY(-1px);
        }

        .active-location-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(99,179,255,0.08);
          border: 1px solid rgba(99,179,255,0.18);
          border-radius: 100px; padding: 5px 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: #63b3ff;
          margin-bottom: 16px;
        }

        .clear-loc {
          cursor: pointer; color: #555;
          font-size: 14px; line-height: 1;
          transition: color 0.2s;
        }

        .clear-loc:hover { color: #ff6b6b; }

        .jobs-count {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: #444; margin-bottom: 20px;
        }

        .jobs-count span { color: #6c63ff; font-weight: 600; }

        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 16px;
        }

        .job-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 22px;
          display: flex; flex-direction: column; gap: 12px;
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
          width: 42px; height: 42px; border-radius: 10px;
          background: white; padding: 5px;
          object-fit: contain; flex-shrink: 0;
        }

        .job-role {
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          color: white; margin-bottom: 3px; line-height: 1.3;
        }

        .job-company {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: #555;
        }

        .job-location {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: #444;
        }

        .job-tags {
          display: flex; gap: 6px; flex-wrap: wrap;
        }

        .job-tag {
          padding: 3px 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; color: #555;
        }

        .apply-btn {
          margin-top: auto; padding: 10px 18px;
          background: linear-gradient(135deg, #6c63ff, #5a54e8);
          border: none; color: white;
          font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border-radius: 9px; cursor: pointer;
          transition: all 0.2s ease; width: 100%;
        }

        .apply-btn:hover {
          box-shadow: 0 6px 20px rgba(108,99,255,0.35);
          transform: translateY(-1px);
        }

        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 16px;
        }

        .skeleton-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px; padding: 22px;
          display: flex; flex-direction: column; gap: 12px;
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
          font-family: 'DM Sans', sans-serif; color: #333;
        }

        .empty-state div { font-size: 40px; margin-bottom: 12px; }
        .empty-state p { font-size: 14px; }
      `}</style>

      <div className="avail-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Available <span>Jobs</span></h1>
            <p className="page-subtitle">Live remote job listings filtered by your preferred location</p>
          </div>
        </div>

        {/* Filters Row */}
        <div className="filters-row">
          <div className="search-box">
            <span style={{ fontSize: "16px" }}>🔍</span>
            <input
              placeholder="Search role, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="location-box">
            <span style={{ fontSize: "16px" }}>📍</span>
            <input
              placeholder="Enter location (e.g. India, USA, Remote)"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLocationSearch()}
            />
          </div>

          <button className="location-btn" onClick={handleLocationSearch}>
            Search →
          </button>
        </div>

        {/* Active location badge */}
        {location && (
          <div style={{ marginBottom: "16px" }}>
            <span className="active-location-badge">
              📍 Showing jobs for: <strong style={{ marginLeft: 4 }}>{location}</strong>
              <span
                className="clear-loc"
                onClick={() => { setLocation(""); setLocationInput(""); }}
                title="Clear location filter"
              >
                ✕
              </span>
            </span>
          </div>
        )}

        {/* Count */}
        {!loading && (
          <div className="jobs-count">
            Showing <span>{filtered.length}</span> of {jobs.length} jobs
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="skeleton-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div style={{ display: "flex", gap: "12px" }}>
                  <div className="skeleton-line" style={{ width: 42, height: 42, borderRadius: 10 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton-line" style={{ height: 14, width: "70%", marginBottom: 8 }} />
                    <div className="skeleton-line" style={{ height: 11, width: "45%" }} />
                  </div>
                </div>
                <div className="skeleton-line" style={{ height: 11, width: "55%" }} />
                <div className="skeleton-line" style={{ height: 36, width: "100%", borderRadius: 9 }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div>🔍</div>
            <p>No jobs found{location ? ` in "${location}"` : ""}. Try a different location or clear the filter.</p>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && filtered.length > 0 && (
          <div className="jobs-grid">
            {filtered.map((job, index) => (
              <div key={index} className="job-card">
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

                {job.location && (
                  <div className="job-location">📍 {job.location}</div>
                )}

                <div className="job-tags">
                  <span className="job-tag">🌐 Remote</span>
                  <span className="job-tag">Full-time</span>
                </div>

                <button
                  className="apply-btn"
                  onClick={() => window.open(job.applyLink, "_blank")}
                >
                  Apply Now →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default AvailableJobs;