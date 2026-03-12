import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../config";

const CACHE_KEY = "recommendedJobsCache";

function RecommendedJobs() {
  const [jobs, setJobs] = useState(() => {
    try { const c = localStorage.getItem(CACHE_KEY); return c ? JSON.parse(c).jobs : []; } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(() => {
    try { const c = localStorage.getItem(CACHE_KEY); return c ? JSON.parse(c).lastFetched : null; } catch { return null; }
  });
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [minScore, setMinScore] = useState(40);
  const [filterSource, setFilterSource] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [expandedBreakdown, setExpandedBreakdown] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        setUser(res.data);
        const loc = res.data.preferredLocation || "";
        setLocationInput(loc);
        // Load cached location filter if exists
        if (!localStorage.getItem("recommendedJobsCache")) setLocationFilter(loc);
      } catch (err) { console.error(err); }
    };
    fetchUser();
  }, []);

  // Save to cache whenever jobs update
  useEffect(() => {
    if (jobs.length > 0) localStorage.setItem(CACHE_KEY, JSON.stringify({ jobs, lastFetched: new Date().toISOString() }));
  }, [jobs]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/jobs/recommended`, { headers: { Authorization: `Bearer ${token}` } });
      setJobs(res.data);
      setLastFetched(new Date().toISOString());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getScoreMeta = (score) => {
    if (score >= 80) return { color: "#6fffc0", bg: "rgba(111,255,192,0.1)", border: "rgba(111,255,192,0.2)", label: "Excellent Match" };
    if (score >= 65) return { color: "#63b3ff", bg: "rgba(99,179,255,0.1)", border: "rgba(99,179,255,0.2)", label: "Strong Match" };
    if (score >= 50) return { color: "#ffd166", bg: "rgba(255,209,102,0.1)", border: "rgba(255,209,102,0.2)", label: "Good Match" };
    return { color: "#888", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.08)", label: "Partial Match" };
  };

  const sources = ["All", ...new Set(jobs.map(j => j.source).filter(Boolean))];

  const filtered = jobs
    .filter(j => j.matchScore >= minScore)
    .filter(j => filterSource === "All" || j.source === filterSource)
    .filter(j => !search || j.role?.toLowerCase().includes(search.toLowerCase()) || j.company?.toLowerCase().includes(search.toLowerCase()))
    .filter(j => {
      if (!locationFilter.trim()) return true;
      const loc = locationFilter.toLowerCase().trim();
      const jobLoc = (j.location || "").toLowerCase();
      return jobLoc.includes(loc) ||
        jobLoc.includes("worldwide") ||
        jobLoc.includes("anywhere") ||
        jobLoc.includes("remote") ||
        jobLoc === "";
    })
    .sort((a, b) => sortBy === "score" ? b.matchScore - a.matchScore : a.role?.localeCompare(b.role));

  const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;

  const hasProfile = user && (user.skills?.length > 0 || user.preferredRole);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        .rec-page { animation: fadeUp 0.4s ease forwards; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

        .page-title { font-family:'Syne',sans-serif; font-size:26px; font-weight:800; color:white; letter-spacing:-0.02em; margin-bottom:5px; }
        .page-title span { background:linear-gradient(135deg,#6c63ff,#63b3ff); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .page-subtitle { font-family:'DM Sans',sans-serif; font-size:13px; color:#444; margin-bottom:20px; }

        /* Profile snapshot banner */
        .profile-banner {
          display:flex; align-items:center; gap:16px; flex-wrap:wrap;
          background:rgba(108,99,255,0.06); border:1px solid rgba(108,99,255,0.15);
          border-radius:14px; padding:14px 18px; margin-bottom:20px;
        }
        .profile-pill {
          display:inline-flex; align-items:center; gap:5px;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
          border-radius:100px; padding:4px 12px;
          font-family:'DM Sans',sans-serif; font-size:12px; color:#888;
        }
        .profile-pill strong { color:#a09bff; }

        /* Toolbar */
        .toolbar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:16px; }
        .search-box {
          display:flex; align-items:center; gap:8px; flex:1; min-width:200px;
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; padding:10px 14px; transition:border-color 0.2s;
        }
        .search-box:focus-within { border-color:rgba(108,99,255,0.35); }
        .search-box input { background:none; border:none; outline:none; color:white; font-family:'DM Sans',sans-serif; font-size:13px; width:100%; }
        .search-box input::placeholder { color:#333; }
        .location-box {
          display:flex; align-items:center; gap:8px; flex:1; min-width:160px;
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; padding:10px 14px; transition:border-color 0.2s;
        }
        .location-box:focus-within { border-color:rgba(99,179,255,0.35); }
        .location-box input { background:none; border:none; outline:none; color:white; font-family:'DM Sans',sans-serif; font-size:13px; width:100%; }
        .location-box input::placeholder { color:#333; }
        .loc-btn {
          padding:10px 18px; background:linear-gradient(135deg,#6c63ff,#5a54e8);
          border:none; color:white; font-size:13px; font-weight:600;
          font-family:'DM Sans',sans-serif; border-radius:10px; cursor:pointer;
          transition:all 0.2s; white-space:nowrap;
        }
        .loc-btn:hover { box-shadow:0 4px 16px rgba(108,99,255,0.3); transform:translateY(-1px); }
        .loc-badge {
          display:inline-flex; align-items:center; gap:6px;
          background:rgba(99,179,255,0.08); border:1px solid rgba(99,179,255,0.18);
          border-radius:100px; padding:5px 12px;
          font-family:'DM Sans',sans-serif; font-size:12px; color:#63b3ff;
        }
        .active-filters { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px; align-items:center; }
        .refresh-btn {
          display:flex; align-items:center; gap:7px; padding:10px 16px;
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; color:#888; font-size:13px; font-weight:600;
          font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.2s; white-space:nowrap;
        }
        .refresh-btn:hover:not(:disabled) { background:rgba(255,255,255,0.07); color:white; }
        .refresh-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .refresh-btn.spinning svg { animation:spin360 0.7s linear infinite; }
        @keyframes spin360 { to { transform:rotate(360deg); } }
        .last-fetched { font-size:11px; color:#333; }
        .filter-btn {
          display:flex; align-items:center; gap:7px; padding:10px 14px;
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; color:#888; font-size:13px; font-weight:600;
          font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.2s; white-space:nowrap;
        }
        .filter-btn.active { border-color:rgba(108,99,255,0.4); color:#a09bff; background:rgba(108,99,255,0.08); }

        /* Filter panel */
        .filter-panel {
          background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08);
          border-radius:16px; padding:22px; margin-bottom:20px;
          animation:fadeUp 0.2s ease forwards;
        }
        .filter-row { display:flex; gap:24px; flex-wrap:wrap; align-items:flex-start; }
        .filter-group { display:flex; flex-direction:column; gap:8px; }
        .filter-group label { font-family:'DM Sans',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.07em; color:#555; text-transform:uppercase; }
        .filter-chips { display:flex; gap:6px; flex-wrap:wrap; }
        .fchip {
          padding:5px 12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
          border-radius:100px; font-size:12px; color:#555; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.2s;
        }
        .fchip.active { background:rgba(108,99,255,0.15); border-color:rgba(108,99,255,0.35); color:#a09bff; }
        .score-slider { width:180px; accent-color:#6c63ff; }
        .sort-select {
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
          border-radius:8px; color:#888; font-size:12px; font-family:'DM Sans',sans-serif;
          padding:6px 10px; outline:none; cursor:pointer;
        }
        .sort-select option { background:#1a1a2e; }

        /* Results count */
        .results-count { font-family:'DM Sans',sans-serif; font-size:12px; color:#444; margin-bottom:20px; }
        .results-count span { color:#6c63ff; font-weight:600; }

        /* Job cards */
        .jobs-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:16px; }
        .job-card {
          background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07);
          border-radius:16px; padding:22px; display:flex; flex-direction:column; gap:14px;
          transition:all 0.25s ease;
        }
        .job-card:hover { background:rgba(255,255,255,0.04); border-color:rgba(108,99,255,0.2); transform:translateY(-2px); }
        .job-card-top { display:flex; align-items:center; gap:12px; }
        .company-initial {
          width:44px; height:44px; border-radius:10px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          font-family:'Syne',sans-serif; font-size:18px; font-weight:800; color:white;
        }
        .job-role { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:white; margin-bottom:3px; line-height:1.3; }
        .job-company { font-family:'DM Sans',sans-serif; font-size:12px; color:#555; }
        .job-location { font-family:'DM Sans',sans-serif; font-size:12px; color:#444; display:flex; align-items:center; gap:5px; }
        .job-tags { display:flex; flex-wrap:wrap; gap:5px; }
        .job-tag { padding:3px 9px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); border-radius:100px; font-size:11px; color:#444; font-family:'DM Sans',sans-serif; }
        .skill-tag { padding:3px 9px; background:rgba(108,99,255,0.08); border:1px solid rgba(108,99,255,0.18); border-radius:100px; font-size:11px; color:#a09bff; font-family:'DM Sans',sans-serif; }

        /* Score bar */
        .score-bar-wrapper { display:flex; flex-direction:column; gap:6px; }
        .score-bar-top { display:flex; justify-content:space-between; align-items:center; }
        .score-label { font-family:'DM Sans',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; }
        .score-number { font-family:'Syne',sans-serif; font-size:14px; font-weight:800; }
        .score-bar-bg { height:5px; border-radius:100px; background:rgba(255,255,255,0.06); overflow:hidden; }
        .score-bar-fill { height:100%; border-radius:100px; transition:width 0.8s ease; }

        /* Score breakdown */
        .breakdown-toggle {
          font-family:'DM Sans',sans-serif; font-size:11px; color:#444; cursor:pointer;
          display:flex; align-items:center; gap:4px; transition:color 0.2s; width:fit-content;
        }
        .breakdown-toggle:hover { color:#a09bff; }
        .breakdown-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
        .breakdown-item {
          background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06);
          border-radius:8px; padding:8px 10px;
        }
        .breakdown-item-label { font-family:'DM Sans',sans-serif; font-size:10px; color:#444; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:4px; }
        .breakdown-item-bar { height:3px; border-radius:100px; background:rgba(255,255,255,0.06); overflow:hidden; margin-bottom:4px; }
        .breakdown-item-fill { height:100%; border-radius:100px; }
        .breakdown-item-val { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; }

        /* Card bottom */
        .card-bottom { display:flex; justify-content:space-between; align-items:center; margin-top:auto; gap:10px; }
        .score-badge { display:inline-flex; align-items:center; padding:4px 10px; border-radius:100px; font-family:'DM Sans',sans-serif; font-size:11px; font-weight:600; }
        .source-tag { font-family:'DM Sans',sans-serif; font-size:11px; color:#444; }
        .apply-btn {
          padding:9px 18px; background:linear-gradient(135deg,#6c63ff,#5a54e8);
          border:none; color:white; font-size:13px; font-weight:600;
          font-family:'DM Sans',sans-serif; border-radius:9px; cursor:pointer; transition:all 0.2s ease;
        }
        .apply-btn:hover { box-shadow:0 6px 20px rgba(108,99,255,0.35); transform:translateY(-1px); }

        /* Skeleton */
        .skeleton-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:16px; }
        .skeleton-card { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:22px; display:flex; flex-direction:column; gap:14px; }
        .skeleton-line { border-radius:6px; background:rgba(255,255,255,0.05); animation:shimmer 1.5s infinite; }
        @keyframes shimmer { 0%,100%{opacity:0.4;} 50%{opacity:0.8;} }

        /* Empty / no profile */
        .empty-state { text-align:center; padding:60px 20px; }
        .empty-icon { font-size:48px; margin-bottom:16px; }
        .empty-title { font-family:'Syne',sans-serif; font-size:18px; font-weight:700; color:white; margin-bottom:8px; }
        .empty-desc { font-family:'DM Sans',sans-serif; font-size:13px; color:#444; max-width:340px; margin:0 auto; line-height:1.6; }

        .no-jobs-yet {
          text-align:center; padding:80px 20px;
          background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:18px;
        }
        .no-jobs-yet div { font-size:44px; margin-bottom:16px; }
        .no-jobs-yet h3 { font-family:'Syne',sans-serif; font-size:18px; font-weight:700; color:white; margin-bottom:8px; }
        .no-jobs-yet p { font-family:'DM Sans',sans-serif; font-size:13px; color:#444; margin-bottom:20px; }
        .fetch-now-btn {
          padding:12px 28px; background:linear-gradient(135deg,#6c63ff,#5a54e8);
          border:none; color:white; font-size:14px; font-weight:600;
          font-family:'DM Sans',sans-serif; border-radius:10px; cursor:pointer; transition:all 0.2s;
        }
        .fetch-now-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(108,99,255,0.35); }
      `}</style>

      <div className="rec-page">
        <h1 className="page-title">Recommended <span>Jobs</span></h1>
        <p className="page-subtitle">Matched to your role, skills, qualification and experience</p>

        {/* Profile Snapshot Banner */}
        {user && (
          <div className="profile-banner">
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "#555" }}>Matching against:</span>
            {user.preferredRole && (
              <span className="profile-pill">🎯 <strong>{user.preferredRole}</strong></span>
            )}
            {user.skills?.length > 0 && (
              <span className="profile-pill">🛠 <strong>{user.skills.length} skills</strong></span>
            )}
            {user.qualification && (
              <span className="profile-pill">🎓 <strong>{user.qualification}</strong></span>
            )}
            {user.experience && (
              <span className="profile-pill">💼 <strong>{user.experience}</strong></span>
            )}
            {user.preferredLocation && (
              <span className="profile-pill">📍 <strong>{user.preferredLocation}</strong></span>
            )}
          </div>
        )}

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <span style={{ fontSize: "15px" }}>🔍</span>
            <input placeholder="Search role or company..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {/* Location filter */}
          <div className="location-box">
            <span style={{ fontSize: "15px" }}>📍</span>
            <input
              placeholder="Filter by location..."
              value={locationInput}
              onChange={e => setLocationInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && setLocationFilter(locationInput)}
            />
          </div>
          <button className="loc-btn" onClick={() => setLocationFilter(locationInput)}>Search →</button>

          <button className={`refresh-btn ${loading ? "spinning" : ""}`} onClick={fetchJobs} disabled={loading}
            title={lastFetched ? `Last fetched at ${formatTime(lastFetched)}` : "Fetch recommendations"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {loading ? "Loading..." : "Refresh"}
            {lastFetched && !loading && <span className="last-fetched">{formatTime(lastFetched)}</span>}
          </button>
          <button className={`filter-btn ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(p => !p)}>
            ⚙ Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>Min Match Score: {minScore}%</label>
                <input type="range" min="40" max="90" step="5" value={minScore}
                  onChange={e => setMinScore(Number(e.target.value))} className="score-slider" />
                <div className="filter-chips">
                  {[40, 60, 75, 85].map(v => (
                    <span key={v} className={`fchip ${minScore === v ? "active" : ""}`} onClick={() => setMinScore(v)}>{v}%+</span>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <label>Source</label>
                <div className="filter-chips">
                  {sources.map(s => (
                    <span key={s} className={`fchip ${filterSource === s ? "active" : ""}`} onClick={() => setFilterSource(s)}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <label>Sort By</label>
                <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="score">Match Score</option>
                  <option value="alpha">Role A–Z</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active location badge */}
        {locationFilter && (
          <div className="active-filters">
            <span className="loc-badge">
              📍 {locationFilter}
              <span style={{ cursor:"pointer", marginLeft:4, color:"#555" }}
                onClick={() => { setLocationFilter(""); setLocationInput(""); }}>✕</span>
            </span>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="results-count">
            Showing <span>{filtered.length}</span> of {jobs.length} matched jobs
          </div>
        )}

        {/* Loading */}
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

        {/* No profile setup */}
        {!loading && !hasProfile && jobs.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <div className="empty-title">Set up your profile first</div>
            <p className="empty-desc">Add your <strong>skills</strong>, <strong>preferred role</strong>, <strong>qualification</strong> and <strong>experience</strong> in your Profile to get personalised recommendations.</p>
          </div>
        )}

        {/* Jobs not fetched yet */}
        {!loading && hasProfile && jobs.length === 0 && (
          <div className="no-jobs-yet">
            <div>🎯</div>
            <h3>Ready for your recommendations?</h3>
            <p>Click below to fetch jobs matched to your profile</p>
            <button className="fetch-now-btn" onClick={fetchJobs}>🔍 Get My Recommendations</button>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && filtered.length > 0 && (
          <div className="jobs-grid">
            {filtered.map((job, index) => {
              const meta = getScoreMeta(job.matchScore);
              const initial = (job.company || "?").charAt(0).toUpperCase();
              const colorIdx = (job.company || "A").charCodeAt(0) % 6;
              const bgColors = ["#2d2b5e","#1a3050","#1a3d30","#3d3010","#3d1010","#2d1050"];
              const fgColors = ["#6c63ff","#63b3ff","#6fffc0","#ffd166","#ff6b6b","#c77dff"];
              const isExpanded = expandedBreakdown === index;

              return (
                <div key={index} className="job-card">
                  <div className="job-card-top">
                    <div className="company-initial" style={{ background: bgColors[colorIdx], color: fgColors[colorIdx] }}>{initial}</div>
                    <div>
                      <div className="job-role">{job.role}</div>
                      <div className="job-company">{job.company}</div>
                    </div>
                  </div>

                  {job.location && <div className="job-location">📍 {job.location}</div>}

                  {/* Matched skills */}
                  {job.matchedSkills?.length > 0 && (
                    <div className="job-tags">
                      {job.matchedSkills.slice(0, 4).map(s => <span key={s} className="skill-tag">✓ {s}</span>)}
                      {job.matchedSkills.length > 4 && <span className="job-tag">+{job.matchedSkills.length - 4}</span>}
                    </div>
                  )}

                  {/* Score bar */}
                  <div className="score-bar-wrapper">
                    <div className="score-bar-top">
                      <span className="score-label" style={{ color: meta.color }}>{meta.label}</span>
                      <span className="score-number" style={{ color: meta.color }}>{job.matchScore}%</span>
                    </div>
                    <div className="score-bar-bg">
                      <div className="score-bar-fill" style={{ width: `${job.matchScore}%`, background: meta.color }} />
                    </div>
                  </div>

                  {/* Breakdown toggle */}
                  {job.breakdown && (
                    <>
                      <div className="breakdown-toggle" onClick={() => setExpandedBreakdown(isExpanded ? null : index)}>
                        {isExpanded ? "▲" : "▼"} Score breakdown
                      </div>
                      {isExpanded && (
                        <div className="breakdown-grid">
                          {[
                            { key: "role", label: "Role", max: 35, color: "#6c63ff" },
                            { key: "skills", label: "Skills", max: 35, color: "#63b3ff" },
                            { key: "location", label: "Location", max: 15, color: "#6fffc0" },
                            { key: "qualification", label: "Qualification", max: 10, color: "#ffd166" },
                            { key: "experience", label: "Experience", max: 5, color: "#c77dff" },
                          ].map(({ key, label, max, color }) => (
                            <div key={key} className="breakdown-item">
                              <div className="breakdown-item-label">{label}</div>
                              <div className="breakdown-item-bar">
                                <div className="breakdown-item-fill" style={{ width: `${(job.breakdown[key] / max) * 100}%`, background: color }} />
                              </div>
                              <div className="breakdown-item-val" style={{ color }}>{job.breakdown[key]}/{max}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  <div className="card-bottom">
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span className="score-badge" style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}>
                        🎯 {job.matchScore}% match
                      </span>
                      {job.source && <span className="source-tag">{job.source}</span>}
                    </div>
                    <button className="apply-btn" onClick={() => window.open(job.applyLink, "_blank")}>Apply Now →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && jobs.length > 0 && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No jobs match filters</div>
            <p className="empty-desc">Try lowering the minimum match score or removing filters.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default RecommendedJobs;