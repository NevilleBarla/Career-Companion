import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../config";

const STATUS_CONFIG = {
  Applied:     { color: "#63b3ff", bg: "rgba(99,179,255,0.1)",  border: "rgba(99,179,255,0.25)",  icon: "📨" },
  Shortlisted: { color: "#ffd166", bg: "rgba(255,209,102,0.1)", border: "rgba(255,209,102,0.25)", icon: "⭐" },
  Interview:   { color: "#c77dff", bg: "rgba(199,125,255,0.1)", border: "rgba(199,125,255,0.25)", icon: "🎤" },
  Offer:       { color: "#6fffc0", bg: "rgba(111,255,192,0.1)", border: "rgba(111,255,192,0.25)", icon: "🎊" },
  Rejected:    { color: "#ff6b6b", bg: "rgba(255,107,107,0.1)", border: "rgba(255,107,107,0.25)", icon: "❌" },
};

const STATUSES = Object.keys(STATUS_CONFIG);

const EMPTY_FORM = { company: "", role: "", location: "", applyLink: "", source: "Manual", status: "Applied", appliedDate: new Date().toISOString().split("T")[0], deadline: "", notes: "" };

function ApplicationTracker() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [editingNotes, setEditingNotes] = useState(null);
  const [notesText, setNotesText] = useState("");
  const [expandedJob, setExpandedJob] = useState(null);
  const token = localStorage.getItem("token");

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/jobs/all`, { headers: { Authorization: `Bearer ${token}` } });
      setJobs(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleAdd = async () => {
    if (!form.company.trim() || !form.role.trim()) return;
    setSaving(true);
    try {
      await axios.post(`${BASE_URL}/api/jobs/add`, form, { headers: { Authorization: `Bearer ${token}` } });
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchJobs();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${BASE_URL}/api/jobs/update-status`, { id, status }, { headers: { Authorization: `Bearer ${token}` } });
      setJobs(prev => prev.map(j => j._id === id ? { ...j, status } : j));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this application?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/jobs/delete`, { data: { id }, headers: { Authorization: `Bearer ${token}` } });
      setJobs(prev => prev.filter(j => j._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleSaveNotes = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/jobs/update-status`, { id, status: jobs.find(j => j._id === id).status, notes: notesText }, { headers: { Authorization: `Bearer ${token}` } });
      setJobs(prev => prev.map(j => j._id === id ? { ...j, notes: notesText } : j));
      setEditingNotes(null);
    } catch (err) { console.error(err); }
  };

  const filtered = filterStatus === "All" ? jobs : jobs.filter(j => j.status === filterStatus);

  // Stats
  const stats = STATUSES.reduce((acc, s) => { acc[s] = jobs.filter(j => j.status === s).length; return acc; }, {});

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        .tracker-page { animation: fadeUp 0.4s ease forwards; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

        .page-title { font-family:'Syne',sans-serif; font-size:26px; font-weight:800; color:white; letter-spacing:-0.02em; margin-bottom:5px; }
        .page-title span { background:linear-gradient(135deg,#6c63ff,#63b3ff); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .page-subtitle { font-family:'DM Sans',sans-serif; font-size:13px; color:#444; margin-bottom:24px; }

        /* Stats row */
        .stats-row { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:24px; }
        .stat-card {
          flex:1; min-width:100px; padding:14px 18px;
          background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07);
          border-radius:14px; text-align:center;
        }
        .stat-count { font-family:'Syne',sans-serif; font-size:26px; font-weight:800; }
        .stat-label { font-family:'DM Sans',sans-serif; font-size:11px; color:#444; margin-top:2px; }

        /* Toolbar */
        .toolbar { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px; }
        .filter-tabs { display:flex; gap:6px; flex-wrap:wrap; }
        .filter-tab {
          padding:7px 14px; border-radius:100px; font-size:12px; font-weight:600;
          font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.2s;
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#555;
        }
        .filter-tab.active { background:rgba(108,99,255,0.15); border-color:rgba(108,99,255,0.35); color:#a09bff; }
        .add-btn {
          display:flex; align-items:center; gap:7px;
          padding:10px 20px; background:linear-gradient(135deg,#6c63ff,#5a54e8);
          border:none; color:white; font-size:13px; font-weight:600;
          font-family:'DM Sans',sans-serif; border-radius:10px; cursor:pointer;
          transition:all 0.2s;
        }
        .add-btn:hover { box-shadow:0 6px 20px rgba(108,99,255,0.35); transform:translateY(-1px); }

        /* Add Form */
        .add-form {
          background:rgba(255,255,255,0.02); border:1px solid rgba(108,99,255,0.2);
          border-radius:18px; padding:24px; margin-bottom:24px;
          animation:fadeUp 0.2s ease forwards;
        }
        .add-form-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:white; margin-bottom:18px; }
        .form-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
        .form-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:14px; }
        .form-field label { display:block; font-size:11px; font-weight:600; letter-spacing:0.07em; color:#555; text-transform:uppercase; margin-bottom:6px; font-family:'DM Sans',sans-serif; }
        .form-field input, .form-field select, .form-field textarea {
          width:100%; padding:11px 14px;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
          border-radius:9px; color:white; font-size:13px;
          font-family:'DM Sans',sans-serif; outline:none; box-sizing:border-box;
          transition:border-color 0.2s;
        }
        .form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color:#6c63ff; }
        .form-field select option { background:#1a1a2e; }
        .form-field textarea { resize:vertical; min-height:70px; }
        .form-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:4px; }
        .btn-cancel {
          padding:10px 20px; background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08); border-radius:9px;
          color:#555; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer;
        }
        .btn-save {
          padding:10px 24px; background:linear-gradient(135deg,#6c63ff,#5a54e8);
          border:none; color:white; font-size:13px; font-weight:600;
          font-family:'DM Sans',sans-serif; border-radius:9px; cursor:pointer; transition:all 0.2s;
        }
        .btn-save:disabled { opacity:0.5; cursor:not-allowed; }

        /* Job cards */
        .jobs-list { display:flex; flex-direction:column; gap:12px; }
        .job-card {
          background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07);
          border-radius:16px; padding:20px 24px; cursor:pointer;
          transition:all 0.2s;
        }
        .job-card:hover { background:rgba(255,255,255,0.035); border-color:rgba(255,255,255,0.12); }
        .job-card-top { display:flex; align-items:center; justify-content:space-between; gap:12px; }
        .job-card-left { display:flex; align-items:center; gap:14px; flex:1; min-width:0; }
        .company-initial-sm {
          width:40px; height:40px; border-radius:10px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          font-family:'Syne',sans-serif; font-size:16px; font-weight:800; color:white;
        }
        .job-role-name { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:white; }
        .job-company-loc { font-family:'DM Sans',sans-serif; font-size:12px; color:#444; margin-top:2px; }
        .job-card-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }

        /* Status pill selector */
        .status-pill {
          display:inline-flex; align-items:center; gap:5px;
          padding:5px 12px; border-radius:100px; font-size:12px; font-weight:600;
          font-family:'DM Sans',sans-serif; border:1px solid; cursor:pointer;
          transition:all 0.2s;
        }
        .status-select {
          background:transparent; border:none; outline:none; cursor:pointer;
          font-size:12px; font-weight:600; font-family:'DM Sans',sans-serif;
          padding:5px 10px; border-radius:100px;
        }

        .delete-btn {
          width:32px; height:32px; border-radius:8px; border:none;
          background:rgba(255,80,80,0.08); color:#ff6b6b; cursor:pointer;
          font-size:14px; display:flex; align-items:center; justify-content:center;
          transition:all 0.2s;
        }
        .delete-btn:hover { background:rgba(255,80,80,0.18); }

        /* Expanded details */
        .job-expand { border-top:1px solid rgba(255,255,255,0.06); margin-top:16px; padding-top:16px; }
        .expand-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
        .expand-item label { font-size:11px; font-weight:600; letter-spacing:0.07em; color:#444; text-transform:uppercase; font-family:'DM Sans',sans-serif; display:block; margin-bottom:4px; }
        .expand-item span { font-size:13px; color:#888; font-family:'DM Sans',sans-serif; }
        .expand-item a { font-size:13px; color:#6c63ff; font-family:'DM Sans',sans-serif; text-decoration:none; }
        .expand-item a:hover { text-decoration:underline; }
        .notes-area {
          width:100%; padding:10px 13px; background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.08); border-radius:9px;
          color:white; font-size:13px; font-family:'DM Sans',sans-serif;
          outline:none; resize:vertical; min-height:60px; box-sizing:border-box;
          transition:border-color 0.2s;
        }
        .notes-area:focus { border-color:#6c63ff; }
        .notes-save-btn {
          margin-top:7px; padding:7px 16px;
          background:rgba(108,99,255,0.15); border:1px solid rgba(108,99,255,0.3);
          border-radius:8px; color:#a09bff; font-size:12px; font-weight:600;
          font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.2s;
        }
        .notes-save-btn:hover { background:rgba(108,99,255,0.25); }

        /* Pipeline progress bar */
        .pipeline { display:flex; align-items:center; gap:0; margin-bottom:16px; }
        .pipeline-step {
          flex:1; text-align:center; padding:7px 4px; font-size:11px; font-weight:600;
          font-family:'DM Sans',sans-serif; color:#333; transition:all 0.2s;
          position:relative;
        }
        .pipeline-step.done { color:white; }
        .pipeline-step::after {
          content:''; position:absolute; right:-1px; top:50%; transform:translateY(-50%);
          width:0; height:0; border-top:12px solid transparent; border-bottom:12px solid transparent;
          border-left:10px solid transparent; z-index:1;
        }

        /* Empty state */
        .empty-state { text-align:center; padding:80px 20px; }
        .empty-state div { font-size:48px; margin-bottom:16px; }
        .empty-state h3 { font-family:'Syne',sans-serif; font-size:18px; font-weight:700; color:white; margin-bottom:8px; }
        .empty-state p { font-family:'DM Sans',sans-serif; font-size:13px; color:#444; }

        @media(max-width:600px) {
          .form-grid-2, .form-grid-3, .expand-grid { grid-template-columns:1fr; }
          .stats-row { gap:8px; }
        }
      `}</style>

      <div className="tracker-page">
        <h1 className="page-title">Application <span>Tracker</span></h1>
        <p className="page-subtitle">Track every job you apply to — from application to offer</p>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-count" style={{ color: "#a09bff" }}>{jobs.length}</div>
            <div className="stat-label">Total</div>
          </div>
          {STATUSES.map(s => (
            <div className="stat-card" key={s}>
              <div className="stat-count" style={{ color: STATUS_CONFIG[s].color }}>{stats[s] || 0}</div>
              <div className="stat-label">{s}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="filter-tabs">
            {["All", ...STATUSES].map(s => (
              <span key={s} className={`filter-tab ${filterStatus === s ? "active" : ""}`}
                onClick={() => setFilterStatus(s)}>
                {s !== "All" ? STATUS_CONFIG[s].icon + " " : ""}{s}
                {s !== "All" && stats[s] > 0 ? ` (${stats[s]})` : ""}
              </span>
            ))}
          </div>
          <button className="add-btn" onClick={() => setShowForm(p => !p)}>
            {showForm ? "✕ Cancel" : "+ Track Application"}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="add-form">
            <div className="add-form-title">📋 Add New Application</div>
            <div className="form-grid-2">
              <div className="form-field">
                <label>Company *</label>
                <input placeholder="e.g. Google" value={form.company}
                  onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Role *</label>
                <input placeholder="e.g. Frontend Developer" value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))} />
              </div>
            </div>
            <div className="form-grid-3">
              <div className="form-field">
                <label>Location</label>
                <input placeholder="e.g. Bangalore, Remote" value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Source</label>
                <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>
                  {["Manual","Adzuna","Remotive","LinkedIn","Naukri","Indeed","Other"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label>Applied Date</label>
                <input type="date" value={form.appliedDate}
                  onChange={e => setForm(p => ({ ...p, appliedDate: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Deadline</label>
                <input type="date" value={form.deadline}
                  onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
              </div>
            </div>
            <div className="form-field" style={{ marginBottom: "14px" }}>
              <label>Job Link</label>
              <input placeholder="https://..." value={form.applyLink}
                onChange={e => setForm(p => ({ ...p, applyLink: e.target.value }))} />
            </div>
            <div className="form-field" style={{ marginBottom: "14px" }}>
              <label>Notes</label>
              <textarea placeholder="Any notes about this application..." value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className="form-actions">
              <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-save" onClick={handleAdd} disabled={saving || !form.company || !form.role}>
                {saving ? "Saving..." : "Save Application"}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && <div style={{ textAlign: "center", color: "#444", padding: "60px", fontFamily: "'DM Sans',sans-serif" }}>Loading applications...</div>}

        {/* Empty */}
        {!loading && jobs.length === 0 && (
          <div className="empty-state">
            <div>📭</div>
            <h3>No applications yet</h3>
            <p>Click "Track Application" to start tracking your job applications</p>
          </div>
        )}

        {/* Jobs List */}
        {!loading && filtered.length > 0 && (
          <div className="jobs-list">
            {filtered.map(job => {
              const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.Applied;
              const initial = (job.company || "?").charAt(0).toUpperCase();
              const colorIdx = (job.company || "A").charCodeAt(0) % 6;
              const bgColors = ["#2d2b5e","#1a3050","#1a3d30","#3d3010","#3d1010","#2d1050"];
              const fgColors = ["#6c63ff","#63b3ff","#6fffc0","#ffd166","#ff6b6b","#c77dff"];
              const isExpanded = expandedJob === job._id;
              const pipelineIdx = STATUSES.indexOf(job.status);

              return (
                <div key={job._id} className="job-card" onClick={() => setExpandedJob(isExpanded ? null : job._id)}>
                  <div className="job-card-top">
                    <div className="job-card-left">
                      <div className="company-initial-sm" style={{ background: bgColors[colorIdx], color: fgColors[colorIdx] }}>
                        {initial}
                      </div>
                      <div>
                        <div className="job-role-name">{job.role}</div>
                        <div className="job-company-loc">{job.company}{job.location ? ` · ${job.location}` : ""}</div>
                      </div>
                    </div>
                    <div className="job-card-right" onClick={e => e.stopPropagation()}>
                      {/* Status dropdown */}
                      <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: "100px", padding: "2px 4px" }}>
                        <select
                          className="status-select"
                          style={{ color: cfg.color }}
                          value={job.status}
                          onChange={e => handleStatusChange(job._id, e.target.value)}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].icon} {s}</option>)}
                        </select>
                      </div>
                      <button className="delete-btn" onClick={() => handleDelete(job._id)}>🗑</button>
                    </div>
                  </div>

                  {/* Pipeline bar */}
                  {isExpanded && (
                    <div className="job-expand" onClick={e => e.stopPropagation()}>
                      {/* Progress pipeline */}
                      <div className="pipeline">
                        {STATUSES.filter(s => s !== "Rejected").map((s, i) => {
                          const isDone = job.status !== "Rejected" && i <= STATUSES.filter(s => s !== "Rejected").indexOf(job.status);
                          const sCfg = STATUS_CONFIG[s];
                          return (
                            <div key={s} className={`pipeline-step ${isDone ? "done" : ""}`}
                              style={{
                                background: isDone ? sCfg.bg : "rgba(255,255,255,0.02)",
                                color: isDone ? sCfg.color : "#333",
                                borderTop: `1px solid ${isDone ? sCfg.border : "rgba(255,255,255,0.06)"}`,
                                borderBottom: `1px solid ${isDone ? sCfg.border : "rgba(255,255,255,0.06)"}`,
                                borderLeft: i === 0 ? `1px solid ${isDone ? sCfg.border : "rgba(255,255,255,0.06)"}` : "none",
                                borderRight: i === 3 ? `1px solid ${isDone ? sCfg.border : "rgba(255,255,255,0.06)"}` : "none",
                                borderRadius: i === 0 ? "8px 0 0 8px" : i === 3 ? "0 8px 8px 0" : "0",
                              }}>
                              {sCfg.icon} {s}
                            </div>
                          );
                        })}
                      </div>

                      <div className="expand-grid">
                        <div className="expand-item">
                          <label>Applied Date</label>
                          <span>{job.appliedDate || "—"}</span>
                        </div>
                        <div className="expand-item">
                          <label>Deadline</label>
                          <span>{job.deadline || "—"}</span>
                        </div>
                        <div className="expand-item">
                          <label>Source</label>
                          <span>{job.source || "Manual"}</span>
                        </div>
                        <div className="expand-item">
                          <label>Job Link</label>
                          {job.applyLink ? <a href={job.applyLink} target="_blank" rel="noreferrer">View Posting ↗</a> : <span>—</span>}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", color: "#444", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", display: "block", marginBottom: "7px" }}>Notes</label>
                        {editingNotes === job._id ? (
                          <>
                            <textarea className="notes-area" value={notesText}
                              onChange={e => setNotesText(e.target.value)}
                              onClick={e => e.stopPropagation()}
                              placeholder="Add notes about this application..." />
                            <button className="notes-save-btn" onClick={() => handleSaveNotes(job._id)}>Save Notes</button>
                            <button className="notes-save-btn" style={{ marginLeft: 8, color: "#555" }} onClick={() => setEditingNotes(null)}>Cancel</button>
                          </>
                        ) : (
                          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: job.notes ? "#888" : "#333", cursor: "pointer", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.06)" }}
                            onClick={() => { setEditingNotes(job._id); setNotesText(job.notes || ""); }}>
                            {job.notes || "Click to add notes..."}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && jobs.length > 0 && (
          <div className="empty-state">
            <div>🔍</div>
            <h3>No {filterStatus} applications</h3>
            <p>Try selecting a different status filter</p>
          </div>
        )}
      </div>
    </>
  );
}

export default ApplicationTracker;