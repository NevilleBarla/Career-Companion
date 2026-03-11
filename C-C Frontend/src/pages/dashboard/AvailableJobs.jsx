import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../config";

const COLORS = [
  ["#6c63ff","#2d2b5e"], ["#63b3ff","#1a3050"], ["#6fffc0","#1a3d30"],
  ["#ffd166","#3d3010"], ["#ff6b6b","#3d1010"], ["#c77dff","#2d1050"],
  ["#ff9f43","#3d2510"], ["#48dbfb","#0a2d35"], ["#ff6b9d","#3d0f25"],
];

const DOMAIN_OVERRIDES = {
  "cognizant": "cognizant.com", "infosys": "infosys.com",
  "wipro": "wipro.com", "tcs": "tcs.com",
  "tata consultancy": "tcs.com", "accenture": "accenture.com",
  "ibm": "ibm.com", "google": "google.com",
  "microsoft": "microsoft.com", "amazon": "amazon.com",
  "meta": "meta.com", "apple": "apple.com",
  "netflix": "netflix.com", "uber": "uber.com",
  "flipkart": "flipkart.com", "swiggy": "swiggy.com",
  "zomato": "zomato.com", "paytm": "paytm.com",
  "razorpay": "razorpay.com", "freshworks": "freshworks.com",
  "zoho": "zoho.com", "hcl": "hcltech.com",
  "tech mahindra": "techmahindra.com", "capgemini": "capgemini.com",
  "deloitte": "deloitte.com", "oracle": "oracle.com",
  "salesforce": "salesforce.com", "sap": "sap.com",
  "adobe": "adobe.com", "cibc": "cibc.com",
  "computacenter": "computacenter.com", "diligente": "diligente.com",
  "entrar": "entrar.in", "miracle software": "miraclesoftware.com",
  "best infosystems": "bestinfosystems.com",
  "kumaran": "kumaransystems.com",
};

const getDomain = (company) => {
  const lower = company.toLowerCase();
  for (const [key, domain] of Object.entries(DOMAIN_OVERRIDES)) {
    if (lower.includes(key)) return domain;
  }
  // Strip common suffixes and guess domain
  const cleaned = company
    .replace(/(india|inc|ltd|limited|pvt|private|llc|corp|corporation|technologies|technology|systems|solutions|services|consulting|group|global|software|infosystems|infotech|digital|enterprises)\s*\.?\s*$/gi, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return cleaned + ".com";
};

function CompanyLogo({ company }) {
  const name = company || "?";
  const [failed, setFailed] = useState(false);
  const initial = name.charAt(0).toUpperCase();
  const colorIdx = name.charCodeAt(0) % COLORS.length;
  const [fg, bg] = COLORS[colorIdx];
  const domain = getDomain(name);

  if (failed) {
    return (
      <div className="company-initial" style={{ background: bg, color: fg }}>
        {initial}
      </div>
    );
  }

  return (
    <img
      src={`https://logo.clearbit.com/${domain}`}
      alt={name}
      className="company-logo"
      onError={() => setFailed(true)}
    />
  );
}


const JOB_ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Mobile Developer", "Android Developer", "iOS Developer",
  "DevOps Engineer", "Cloud Engineer", "Data Engineer", "Data Scientist",
  "Machine Learning Engineer", "AI Engineer", "Software Engineer",
  "QA Engineer", "Security Engineer", "UI Designer", "UX Designer",
  "Product Manager", "Project Manager", "Business Analyst", "Data Analyst",
  "Technical Support Engineer", "IT Administrator", "Content Writer",
  "Digital Marketing Specialist", "SEO Specialist", "HR Manager",
];

const SKILLS_LIST = [
  "React", "Angular", "Vue.js", "Next.js", "TypeScript", "JavaScript",
  "Node.js", "Python", "Django", "Java", "Spring Boot", "PHP", "Go",
  "C++", "C#", ".NET", "Kotlin", "Swift", "MongoDB", "MySQL",
  "PostgreSQL", "Redis", "Firebase", "Docker", "Kubernetes", "AWS",
  "Azure", "Google Cloud", "React Native", "Flutter", "Machine Learning",
  "TensorFlow", "PyTorch", "Power BI", "Tableau", "Git", "Figma",
  "REST API", "Microservices", "System Design", "Agile",
];

// Cache key for localStorage
const CACHE_KEY = "availableJobsCache";

function AvailableJobs() {
  const [jobs, setJobs] = useState(() => {
    try { const c = localStorage.getItem("availableJobsCache"); return c ? JSON.parse(c).jobs : []; } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(() => {
    try { const c = localStorage.getItem("availableJobsCache"); return c ? JSON.parse(c).lastFetched : null; } catch { return null; }
  });
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(() => {
    try { const c = localStorage.getItem("availableJobsCache"); return c ? JSON.parse(c).location || "" : ""; } catch { return ""; }
  });
  const [locationInput, setLocationInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedSource, setSelectedSource] = useState("");

  const token = localStorage.getItem("token");

  // On mount — just load preferred location into input, no auto-fetch
  useEffect(() => {
    const loadUserLocation = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const loc = res.data.preferredLocation || "";
        setLocationInput(loc);
        if (!localStorage.getItem("availableJobsCache")) setLocation(loc);
      } catch (err) { console.error(err); }
    };
    loadUserLocation();
  }, []);

  // Save to cache whenever jobs update
  useEffect(() => {
    if (jobs.length > 0) {
      localStorage.setItem("availableJobsCache", JSON.stringify({ jobs, location, lastFetched: new Date().toISOString() }));
    }
  }, [jobs]);

  // Manual fetch — only called by Refresh or Location Search
  const fetchJobs = async (loc) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/jobs/external?location=${encodeURIComponent(loc ?? location)}`);
      setJobs(res.data);
      setLastFetched(new Date().toISOString());
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = () => { setLocation(locationInput); fetchJobs(locationInput); };
  const handleRefresh = () => fetchJobs(location);
  const formatLastFetched = (ts) => {
    if (!ts) return null;
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const toggleRole = (role) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const clearFilters = () => {
    setSelectedRoles([]);
    setSelectedSkills([]);
    setSelectedSource("");
    setSearch("");
  };

  const activeFilterCount = selectedRoles.length + selectedSkills.length + (selectedSource ? 1 : 0);

  const filtered = jobs.filter(job => {
    const searchMatch =
      job.role?.toLowerCase().includes(search.toLowerCase()) ||
      job.company?.toLowerCase().includes(search.toLowerCase()) ||
      job.location?.toLowerCase().includes(search.toLowerCase());

    const roleMatch = selectedRoles.length === 0 ||
      selectedRoles.some(r => job.role?.toLowerCase().includes(r.toLowerCase()));

    const skillMatch = selectedSkills.length === 0 ||
      selectedSkills.some(s => job.role?.toLowerCase().includes(s.toLowerCase()));

    const sourceMatch = !selectedSource || job.source === selectedSource;

    return searchMatch && roleMatch && skillMatch && sourceMatch;
  });

  const sources = [...new Set(jobs.map(j => j.source).filter(Boolean))];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

        .avail-page { animation: fadeUp 0.4s ease forwards; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-title {
          font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800;
          color: white; letter-spacing: -0.02em; margin-bottom: 5px;
        }
        .page-title span {
          background: linear-gradient(135deg, #6c63ff, #63b3ff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .page-subtitle { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #444; margin-bottom: 20px; }

        /* Top bar */
        .top-bar { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; }

        .search-box {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 10px 16px; flex: 1; min-width: 200px;
          transition: border-color 0.2s;
        }
        .search-box:focus-within { border-color: rgba(108,99,255,0.35); }
        .search-box input {
          background: none; border: none; outline: none;
          color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; width: 100%;
        }
        .search-box input::placeholder { color: #333; }

        .location-box {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 10px 16px; flex: 1; min-width: 180px;
          transition: border-color 0.2s;
        }
        .location-box:focus-within { border-color: rgba(99,179,255,0.35); }
        .location-box input {
          background: none; border: none; outline: none;
          color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; width: 100%;
        }
        .location-box input::placeholder { color: #333; }

        .loc-btn {
          padding: 10px 18px; background: linear-gradient(135deg, #6c63ff, #5a54e8);
          border: none; color: white; font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; border-radius: 10px; cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
        }
        .loc-btn:hover { box-shadow: 0 4px 16px rgba(108,99,255,0.3); transform: translateY(-1px); }
        .refresh-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; color: #888; font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s;
          white-space: nowrap;
        }
        .refresh-btn:hover:not(:disabled) { background: rgba(255,255,255,0.07); color: white; border-color: rgba(255,255,255,0.15); }
        .refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .refresh-btn.spinning svg { animation: spin360 0.7s linear infinite; }
        @keyframes spin360 { to { transform: rotate(360deg); } }
        .last-fetched { font-family: 'DM Sans', sans-serif; font-size: 11px; color: #333; margin-left: 4px; }
        .no-jobs-yet {
          text-align: center; padding: 80px 20px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
        }
        .no-jobs-yet div { font-size: 44px; margin-bottom: 16px; }
        .no-jobs-yet h3 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: white; margin-bottom: 8px; }
        .no-jobs-yet p { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #444; margin-bottom: 20px; }
        .fetch-now-btn {
          padding: 12px 28px; background: linear-gradient(135deg, #6c63ff, #5a54e8);
          border: none; color: white; font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; border-radius: 10px; cursor: pointer;
          transition: all 0.2s;
        }
        .fetch-now-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(108,99,255,0.35); }
        .company-initial {
          width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800;
          color: white;
        }


        /* Filter hamburger button */
        .filter-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 16px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; color: #888; font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s;
          position: relative; white-space: nowrap;
        }
        .filter-btn.active { border-color: rgba(108,99,255,0.4); color: #a09bff; background: rgba(108,99,255,0.08); }
        .filter-btn:hover { background: rgba(255,255,255,0.06); color: white; }
        .filter-count {
          background: #6c63ff; color: white; font-size: 10px; font-weight: 700;
          padding: 2px 6px; border-radius: 100px; line-height: 1.4;
        }
        .hamburger-icon { display: flex; flex-direction: column; gap: 3px; }
        .ham-line {
          width: 16px; height: 2px; background: currentColor;
          border-radius: 2px; transition: all 0.2s;
        }

        /* Filter Panel */
        .filter-panel {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 24px; margin-bottom: 20px;
          animation: fadeUp 0.2s ease forwards;
        }
        .filter-panel-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
        }
        .filter-panel-title {
          font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: white;
        }
        .clear-btn {
          padding: 6px 14px; background: rgba(255,80,80,0.08);
          border: 1px solid rgba(255,80,80,0.2); border-radius: 8px;
          color: #ff6b6b; font-size: 12px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s;
        }
        .clear-btn:hover { background: rgba(255,80,80,0.15); }

        .filter-section { margin-bottom: 20px; }
        .filter-section:last-child { margin-bottom: 0; }
        .filter-section-label {
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; color: #555; text-transform: uppercase; margin-bottom: 10px;
        }
        .filter-chips { display: flex; flex-wrap: wrap; gap: 7px; }
        .filter-chip {
          padding: 5px 12px; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 100px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; color: #555; cursor: pointer; transition: all 0.2s;
        }
        .filter-chip:hover { background: rgba(108,99,255,0.1); border-color: rgba(108,99,255,0.25); color: #a09bff; }
        .filter-chip.active { background: rgba(108,99,255,0.15); border-color: rgba(108,99,255,0.4); color: #a09bff; }
        .source-chips { display: flex; flex-wrap: wrap; gap: 7px; }
        .source-chip {
          padding: 6px 14px; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; color: #555; cursor: pointer; transition: all 0.2s;
        }
        .source-chip:hover { background: rgba(99,179,255,0.08); border-color: rgba(99,179,255,0.2); color: #63b3ff; }
        .source-chip.active { background: rgba(99,179,255,0.1); border-color: rgba(99,179,255,0.35); color: #63b3ff; }

        /* Active filters */
        .active-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; align-items: center; }
        .active-filter-tag {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.2);
          border-radius: 100px; padding: 4px 12px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; color: #a09bff;
        }
        .remove-tag { cursor: pointer; color: #555; font-size: 12px; transition: color 0.2s; }
        .remove-tag:hover { color: #ff6b6b; }
        .loc-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(99,179,255,0.08); border: 1px solid rgba(99,179,255,0.18);
          border-radius: 100px; padding: 5px 12px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; color: #63b3ff;
        }

        .jobs-count { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #444; margin-bottom: 20px; }
        .jobs-count span { color: #6c63ff; font-weight: 600; }

        .jobs-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 16px;
        }

        .job-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 22px; display: flex; flex-direction: column; gap: 12px;
          transition: all 0.25s ease;
        }
        .job-card:hover {
          background: rgba(255,255,255,0.04); border-color: rgba(108,99,255,0.2);
          transform: translateY(-2px);
        }
        .job-card-top { display: flex; align-items: center; gap: 12px; }
        .company-logo {
          width: 42px; height: 42px; border-radius: 10px;
          background: white; padding: 5px; object-fit: contain; flex-shrink: 0;
        }
        .job-role { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: white; margin-bottom: 3px; line-height: 1.3; }
        .job-company { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #555; }
        .job-location { display: inline-flex; align-items: center; gap: 5px; font-family: 'DM Sans', sans-serif; font-size: 12px; color: #444; }
        .job-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .job-tag {
          padding: 3px 10px; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07); border-radius: 100px;
          font-family: 'DM Sans', sans-serif; font-size: 11px; color: #555;
        }
        .source-badge {
          padding: 3px 10px; background: rgba(99,179,255,0.06);
          border: 1px solid rgba(99,179,255,0.12); border-radius: 100px;
          font-family: 'DM Sans', sans-serif; font-size: 11px; color: #63b3ff;
        }
        .apply-btn {
          margin-top: auto; padding: 10px 18px;
          background: linear-gradient(135deg, #6c63ff, #5a54e8);
          border: none; color: white; font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; border-radius: 9px; cursor: pointer;
          transition: all 0.2s ease; width: 100%;
        }
        .apply-btn:hover { box-shadow: 0 6px 20px rgba(108,99,255,0.35); transform: translateY(-1px); }

        .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 16px; }
        .skeleton-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px; padding: 22px; display: flex; flex-direction: column; gap: 12px;
        }
        .skeleton-line {
          border-radius: 6px; background: rgba(255,255,255,0.05);
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        .empty-state { text-align: center; padding: 60px 20px; font-family: 'DM Sans', sans-serif; color: #333; }
        .empty-state div { font-size: 40px; margin-bottom: 12px; }
        .empty-state p { font-size: 14px; }

        .scroll-chips { display: flex; flex-wrap: wrap; gap: 7px; max-height: 100px; overflow-y: auto; padding: 2px; }
        .scroll-chips::-webkit-scrollbar { width: 4px; }
        .scroll-chips::-webkit-scrollbar-thumb { background: rgba(108,99,255,0.3); border-radius: 4px; }
      `}</style>

      <div className="avail-page">
        {/* Header */}
        <h1 className="page-title">Available <span>Jobs</span></h1>
        <p className="page-subtitle">Live job listings filtered by your preferred location and interests</p>

        {/* Top Bar */}
        <div className="top-bar">
          {/* Search */}
          <div className="search-box">
            <span style={{ fontSize: "16px" }}>🔍</span>
            <input
              placeholder="Search role, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="location-box">
            <span style={{ fontSize: "16px" }}>📍</span>
            <input
              placeholder="Enter location..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setLocation(locationInput)}
            />
          </div>

          <button className="loc-btn" onClick={handleLocationSearch}>Search →</button>

          {/* Refresh Button */}
          <button
            className={`refresh-btn ${loading ? "spinning" : ""}`}
            onClick={handleRefresh}
            disabled={loading}
            title={lastFetched ? `Last fetched at ${formatLastFetched(lastFetched)}` : "Fetch jobs"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            {loading ? "Loading..." : "Refresh"}
            {lastFetched && !loading && <span className="last-fetched">{formatLastFetched(lastFetched)}</span>}
          </button>

          {/* Filter Hamburger */}
          <button
            className={`filter-btn ${showFilters || activeFilterCount > 0 ? "active" : ""}`}
            onClick={() => setShowFilters(p => !p)}
          >
            <div className="hamburger-icon">
              <span className="ham-line" />
              <span className="ham-line" />
              <span className="ham-line" />
            </div>
            Filters
            {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-panel-header">
              <span className="filter-panel-title">🎛 Filter Jobs</span>
              {activeFilterCount > 0 && (
                <button className="clear-btn" onClick={clearFilters}>Clear All</button>
              )}
            </div>

            {/* Role filter */}
            <div className="filter-section">
              <div className="filter-section-label">By Role</div>
              <div className="scroll-chips">
                {JOB_ROLES.map(role => (
                  <span
                    key={role}
                    className={`filter-chip ${selectedRoles.includes(role) ? "active" : ""}`}
                    onClick={() => toggleRole(role)}
                  >
                    {selectedRoles.includes(role) ? "✓ " : ""}{role}
                  </span>
                ))}
              </div>
            </div>

            {/* Skills filter */}
            <div className="filter-section">
              <div className="filter-section-label">By Skill</div>
              <div className="scroll-chips">
                {SKILLS_LIST.map(skill => (
                  <span
                    key={skill}
                    className={`filter-chip ${selectedSkills.includes(skill) ? "active" : ""}`}
                    onClick={() => toggleSkill(skill)}
                  >
                    {selectedSkills.includes(skill) ? "✓ " : ""}{skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Source filter */}
            {sources.length > 0 && (
              <div className="filter-section">
                <div className="filter-section-label">By Source</div>
                <div className="source-chips">
                  {sources.map(src => (
                    <span
                      key={src}
                      className={`source-chip ${selectedSource === src ? "active" : ""}`}
                      onClick={() => setSelectedSource(prev => prev === src ? "" : src)}
                    >
                      {selectedSource === src ? "✓ " : ""}{src}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active tags row */}
        {(location || activeFilterCount > 0) && (
          <div className="active-filters">
            {location && (
              <span className="loc-badge">
                📍 {location}
                <span style={{ cursor: "pointer", marginLeft: 4, color: "#555" }}
                  onClick={() => { setLocation(""); setLocationInput(""); }}>✕</span>
              </span>
            )}
            {selectedRoles.map(r => (
              <span key={r} className="active-filter-tag">
                {r} <span className="remove-tag" onClick={() => toggleRole(r)}>✕</span>
              </span>
            ))}
            {selectedSkills.map(s => (
              <span key={s} className="active-filter-tag">
                {s} <span className="remove-tag" onClick={() => toggleSkill(s)}>✕</span>
              </span>
            ))}
            {selectedSource && (
              <span className="active-filter-tag">
                {selectedSource} <span className="remove-tag" onClick={() => setSelectedSource("")}>✕</span>
              </span>
            )}
          </div>
        )}

        {/* Count */}
        {!loading && (
          <div className="jobs-count">
            Showing <span>{filtered.length}</span> of {jobs.length} jobs
          </div>
        )}

        {/* Loading */}
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

        {/* No jobs fetched yet */}
        {!loading && jobs.length === 0 && (
          <div className="no-jobs-yet">
            <div>💼</div>
            <h3>Ready to find jobs?</h3>
            <p>Click the button below to fetch live job listings from 4 sources</p>
            <button className="fetch-now-btn" onClick={handleRefresh}>
              🔍 Fetch Jobs Now
            </button>
          </div>
        )}

        {/* Empty after filter */}
        {!loading && jobs.length > 0 && filtered.length === 0 && (
          <div className="empty-state">
            <div>🔍</div>
            <p>No jobs match your filters. Try adjusting or clearing filters.</p>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && filtered.length > 0 && (
          <div className="jobs-grid">
            {filtered.map((job, index) => (
              <div key={index} className="job-card">
                <div className="job-card-top">
                  <CompanyLogo company={job.company} />
                  <div>
                    <div className="job-role">{job.role}</div>
                    <div className="job-company">{job.company}</div>
                  </div>
                </div>

                {job.location && <div className="job-location">📍 {job.location}</div>}

                <div className="job-tags">
                  <span className="job-tag">🌐 Remote</span>
                  <span className="job-tag">Full-time</span>
                  {job.source && <span className="source-badge">{job.source}</span>}
                </div>

                <button className="apply-btn" onClick={() => window.open(job.applyLink, "_blank")}>
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