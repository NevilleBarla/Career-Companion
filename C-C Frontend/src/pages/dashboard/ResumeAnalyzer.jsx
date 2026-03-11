import { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../config";

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  // Load analysis from localStorage so it persists across navigation
  const [analysis, setAnalysis] = useState(() => {
    try {
      const saved = localStorage.getItem("resumeAnalysis");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const token = localStorage.getItem("token");

  // Save analysis to localStorage whenever it changes
  useEffect(() => {
    if (analysis) {
      localStorage.setItem("resumeAnalysis", JSON.stringify(analysis));
    } else {
      localStorage.removeItem("resumeAnalysis");
    }
  }, [analysis]);

  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please upload a PDF file only.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    handleFile(dropped);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload your resume first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/resume/analyze`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setAnalysis(res.data.analysis);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setFile(null);
    setError("");
    localStorage.removeItem("resumeAnalysis");
  };

  const getScoreColor = (score) => {
    if (score >= 80) return { color: "#6fffc0", bg: "rgba(99,255,180,0.1)" };
    if (score >= 60) return { color: "#ffd166", bg: "rgba(255,209,102,0.1)" };
    return { color: "#ff6b6b", bg: "rgba(255,80,80,0.1)" };
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Work";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

        .resume-page { animation: fadeUp 0.4s ease forwards; max-width: 900px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800;
          color: white; letter-spacing: -0.02em; margin-bottom: 6px;
        }

        .page-title span {
          background: linear-gradient(135deg, #6c63ff, #63b3ff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #444; margin-bottom: 28px;
        }

        .upload-area {
          border: 2px dashed rgba(255,255,255,0.1);
          border-radius: 18px; padding: 48px 32px;
          text-align: center; cursor: pointer;
          transition: all 0.25s ease;
          background: rgba(255,255,255,0.02);
          margin-bottom: 20px;
        }

        .upload-area.drag-over {
          border-color: rgba(108,99,255,0.5);
          background: rgba(108,99,255,0.06);
        }

        .upload-area.has-file {
          border-color: rgba(99,255,180,0.3);
          background: rgba(99,255,180,0.04);
        }

        .upload-icon { font-size: 44px; margin-bottom: 14px; }

        .upload-title {
          font-family: 'Syne', sans-serif;
          font-size: 17px; font-weight: 700;
          color: white; margin-bottom: 8px;
        }

        .upload-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #444; margin-bottom: 16px;
        }

        .upload-btn {
          display: inline-block; padding: 9px 20px;
          background: rgba(108,99,255,0.15);
          border: 1px solid rgba(108,99,255,0.3);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600;
          color: #a09bff; cursor: pointer; transition: all 0.2s;
        }

        .upload-btn:hover { background: rgba(108,99,255,0.25); }

        .file-selected {
          display: flex; align-items: center;
          justify-content: center; gap: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: #6fffc0;
        }

        .analyze-btn {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #6c63ff, #5a54e8);
          border: none; color: white;
          font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border-radius: 12px; cursor: pointer;
          transition: all 0.25s ease; margin-bottom: 28px;
        }

        .analyze-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(108,99,255,0.4);
        }

        .analyze-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .error-box {
          background: rgba(255,80,80,0.08);
          border: 1px solid rgba(255,80,80,0.2);
          border-radius: 10px; padding: 12px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #ff6b6b; margin-bottom: 20px;
        }

        .loading-box {
          text-align: center; padding: 48px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
        }

        .spinner {
          width: 44px; height: 44px;
          border: 3px solid rgba(108,99,255,0.2);
          border-top-color: #6c63ff; border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .loading-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 700;
          color: white; margin-bottom: 6px;
        }

        .loading-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #444;
        }

        .results { animation: fadeUp 0.5s ease forwards; }

        .score-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 32px;
          text-align: center; margin-bottom: 20px;
        }

        .score-circle {
          width: 120px; height: 120px; border-radius: 50%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          margin: 0 auto 16px; border: 4px solid;
        }

        .score-number {
          font-family: 'Syne', sans-serif;
          font-size: 36px; font-weight: 800; line-height: 1;
        }

        .score-out-of {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: #555;
        }

        .score-label {
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 800;
          color: white; margin-bottom: 8px;
        }

        .score-summary {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: #555;
          line-height: 1.7; max-width: 600px; margin: 0 auto;
        }

        .results-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 16px; margin-bottom: 16px;
        }

        .result-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 24px;
        }

        .result-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          color: white; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }

        .result-list { list-style: none; padding: 0; margin: 0; }

        .result-list li {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #888;
          padding: 7px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          line-height: 1.5; display: flex; gap: 8px;
        }

        .result-list li:last-child { border-bottom: none; }

        .skills-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 24px; margin-bottom: 16px;
        }

        .skills-wrap { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }

        .skill-chip {
          padding: 5px 14px;
          background: rgba(108,99,255,0.1);
          border: 1px solid rgba(108,99,255,0.2);
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 500; color: #a09bff;
        }

        .info-row { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }

        .info-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #888;
        }

        .info-badge strong { color: white; }

        .saved-notice {
          display: flex; align-items: center; gap: 8px;
          background: rgba(99,255,180,0.07);
          border: 1px solid rgba(99,255,180,0.15);
          border-radius: 10px; padding: 12px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #6fffc0; margin-bottom: 20px;
        }

        .action-row {
          display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap;
        }

        .reset-btn {
          padding: 10px 24px;
          background: rgba(255,80,80,0.08);
          border: 1px solid rgba(255,80,80,0.2);
          color: #ff6b6b; font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border-radius: 10px; cursor: pointer; transition: all 0.2s;
        }

        .reset-btn:hover {
          background: rgba(255,80,80,0.15);
        }

        .reanalyze-btn {
          padding: 10px 24px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #888; font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          border-radius: 10px; cursor: pointer; transition: all 0.2s;
        }

        .reanalyze-btn:hover { background: rgba(255,255,255,0.07); color: white; }

        @media (max-width: 640px) {
          .results-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="resume-page">
        <h1 className="page-title">Resume <span>Analyzer</span></h1>
        <p className="page-subtitle">
          Upload your resume and get an AI-powered score, skill extraction and improvement tips
        </p>

        {/* Upload section — only show when no analysis */}
        {!analysis && (
          <>
            <div
              className={`upload-area ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("resume-input").click()}
            >
              <input
                id="resume-input"
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {file ? (
                <div className="file-selected">
                  <span style={{ fontSize: "24px" }}>✅</span>
                  <span><strong>{file.name}</strong> ready to analyze</span>
                </div>
              ) : (
                <>
                  <div className="upload-icon">📄</div>
                  <div className="upload-title">Drop your resume here</div>
                  <div className="upload-subtitle">or click to browse — PDF only, max 5MB</div>
                  <span className="upload-btn">Choose PDF File</span>
                </>
              )}
            </div>

            {error && <div className="error-box">⚠ {error}</div>}

            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={loading || !file}
            >
              {loading ? "Analyzing..." : "🔍 Analyze My Resume"}
            </button>
          </>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading-box">
            <div className="spinner" />
            <div className="loading-title">Analyzing your resume...</div>
            <div className="loading-subtitle">Groq AI is reading your resume and generating insights</div>
          </div>
        )}

        {/* Results — persists across navigation */}
        {analysis && !loading && (
          <div className="results">

            <div className="saved-notice">
              ✅ Your skills have been automatically saved to your profile and will improve your job recommendations!
            </div>

            {/* Action buttons */}
            <div className="action-row">
              <button className="reanalyze-btn" onClick={() => { setAnalysis(null); setFile(null); setError(""); localStorage.removeItem("resumeAnalysis"); }}>
                ← Analyze Another Resume
              </button>
              <button className="reset-btn" onClick={handleReset}>
                🗑 Reset Results
              </button>
            </div>

            {/* Score */}
            <div className="score-card">
              <div
                className="score-circle"
                style={{
                  borderColor: getScoreColor(analysis.score).color,
                  background: getScoreColor(analysis.score).bg,
                }}
              >
                <span className="score-number" style={{ color: getScoreColor(analysis.score).color }}>
                  {analysis.score}
                </span>
                <span className="score-out-of">/ 100</span>
              </div>
              <div className="score-label">{getScoreLabel(analysis.score)}</div>
              <p className="score-summary">{analysis.summary}</p>
            </div>

            {/* Info */}
            <div className="info-row">
              {analysis.experienceLevel && (
                <div className="info-badge">
                  🎯 Experience Level: <strong>{analysis.experienceLevel}</strong>
                </div>
              )}
              {analysis.topRoles?.length > 0 && (
                <div className="info-badge">
                  💼 Best Roles: <strong>{analysis.topRoles.join(", ")}</strong>
                </div>
              )}
            </div>

            {/* Strengths + Weaknesses */}
            <div className="results-grid">
              <div className="result-card">
                <div className="result-card-title">✅ Strengths</div>
                <ul className="result-list">
                  {analysis.strengths?.map((s, i) => (
                    <li key={i}><span>•</span>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="result-card">
                <div className="result-card-title">⚠️ Weaknesses</div>
                <ul className="result-list">
                  {analysis.weaknesses?.map((w, i) => (
                    <li key={i}><span>•</span>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suggestions */}
            <div className="result-card" style={{ marginBottom: "16px" }}>
              <div className="result-card-title">💡 Improvement Suggestions</div>
              <ul className="result-list">
                {analysis.suggestions?.map((s, i) => (
                  <li key={i}><span style={{ color: "#6c63ff" }}>→</span>{s}</li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            <div className="skills-card">
              <div className="result-card-title">🛠️ Detected Skills</div>
              <div className="skills-wrap">
                {analysis.skills?.map((skill, i) => (
                  <span key={i} className="skill-chip">{skill}</span>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}

export default ResumeAnalyzer;