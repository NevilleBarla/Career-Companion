import { useEffect, useState } from "react";
import axios from "axios";

function AvailableJobs() {

  const [jobs, setJobs] = useState([]);

  useEffect(() => {

    const fetchJobs = async () => {

      try {

        const res = await axios.get(
          "http://localhost:8000/api/jobs/external"
        );

        setJobs(res.data);

      } catch (error) {

        console.error("Failed to fetch jobs", error);

      }

    };

    fetchJobs();

  }, []);


  return (

    <div style={{ padding: "20px" }}>

      <h2>Available Jobs</h2>

      {jobs.length === 0 ? (

        <p>No jobs available right now</p>

      ) : (

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "25px",
            marginTop: "20px"
          }}
        >

          {jobs.map((job, index) => (

            <div
              key={index}
              style={{
                border: "1px solid #444",
                borderRadius: "10px",
                padding: "20px",
                background: "#2b2b2b",
                color: "white",
                boxShadow: "0px 2px 5px rgba(0,0,0,0.4)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                minHeight: "150px"
              }}
            >

              <h3 style={{ margin: 0 }}>{job.role}</h3>

              <p style={{ margin: 0 }}>
                <strong>Company:</strong> {job.company}
              </p>

              {job.location && (
                <p style={{ margin: 0 }}>
                  <strong>Location:</strong> {job.location}
                </p>
              )}

              <button
                onClick={() => window.open(job.applyLink, "_blank")}
                style={{
                  marginTop: "auto",
                  background: "#007bff",
                  border: "none",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Apply Now
              </button>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}

export default AvailableJobs;