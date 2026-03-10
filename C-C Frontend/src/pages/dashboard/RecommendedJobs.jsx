import { useEffect, useState } from "react";
import axios from "axios";

function RecommendedJobs() {

  const [jobs, setJobs] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {

    const fetchJobs = async () => {

      try {


        const res = await axios.get(
         "http://localhost:8000/api/jobs/recommended",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setJobs(res.data);

      } catch (error) {
        console.error(error);
      }

    };

    fetchJobs();

  }, []);

  const getScoreColor = (score) => {

    if (score >= 80) return "green";
    if (score >= 50) return "orange";
    return "gray";

  };

  return (

    <div style={{ padding: "20px" }}>

      <h2>Recommended Jobs</h2>

      {jobs.length === 0 ? (
        <p>No recommended jobs yet</p>
      ) : (

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "25px",
            marginTop: "20px"
          }}
        >

          {jobs.map((job) => (

            <div
              key={job._id}
              style={{
                border: "1px solid #444",
                borderRadius: "10px",
                padding: "20px",
                background: "#2b2b2b",
                color: "white",
                boxShadow: "0px 2px 5px rgba(0,0,0,0.4)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                minHeight: "170px"
              }}
            >

              {/* Company Logo + Role */}

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

      <img
  src={`https://logo.clearbit.com/${job.company}.com`}
  alt={job.company}
  onError={(e) => {
    e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  }}
  style={{
    width: "40px",
    height: "40px",
    borderRadius: "6px",
    background: "white",
    padding: "5px"
  }}
/>
                

                <div>
                  <h3 style={{ margin: 0 }}>{job.role}</h3>
                  <p style={{ margin: 0, color: "#aaa" }}>{job.company}</p>
                </div>

              </div>


              {/* Skills */}

              {job.skills && job.skills.length > 0 && (

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>

                  {job.skills.map((skill, index) => (

                    <span
                      key={index}
                      style={{
                        background: "#444",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "12px"
                      }}
                    >
                      {skill}
                    </span>

                  ))}

                </div>

              )}


              {/* Bottom row */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "auto"
                }}
              >

                <div
                  style={{
                    background: getScoreColor(job.matchScore),
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    color: "white"
                  }}
                >
                  Match Score: {job.matchScore}%
                </div>

                <button
                  style={{
                    background: "#007bff",
                    border: "none",
                    color: "white",
                    padding: "6px 14px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Apply
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}

export default RecommendedJobs;