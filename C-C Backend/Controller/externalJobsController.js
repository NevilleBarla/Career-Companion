const axios = require("axios");

// -------------------------------------------------------
// Each fetcher is fully independent.
// If one fails, it returns [] and never affects the others.
// -------------------------------------------------------

// 1. REMOTIVE
const fetchRemotive = async (role) => {
  try {
    const res = await axios.get(
      `https://remotive.com/api/remote-jobs?search=${role}`,
      { timeout: 8000 }
    );
    return res.data.jobs.map(job => ({
      company: job.company_name,
      role: job.title,
      location: job.candidate_required_location || "Remote",
      applyLink: job.url,
      source: "Remotive"
    }));
  } catch (err) {
    console.error("❌ Remotive failed:", err.message);
    return [];
  }
};

// 2. ARBEITNOW
const fetchArbeitnow = async (role) => {
  try {
    const res = await axios.get(
      `https://www.arbeitnow.com/api/job-board-api?search=${role}`,
      { timeout: 8000 }
    );
    return res.data.data.map(job => ({
      company: job.company_name,
      role: job.title,
      location: job.location || "Remote",
      applyLink: job.url,
      source: "Arbeitnow"
    }));
  } catch (err) {
    console.error("❌ Arbeitnow failed:", err.message);
    return [];
  }
};

// 3. JOBICY
const fetchJobicy = async (role) => {
  try {
    const res = await axios.get(
      `https://jobicy.com/api/v2/remote-jobs?count=20&tag=${role}`,
      { timeout: 8000 }
    );
    return res.data.jobs.map(job => ({
      company: job.companyName,
      role: job.jobTitle,
      location: job.jobGeo || "Remote",
      applyLink: job.url,
      source: "Jobicy"
    }));
  } catch (err) {
    console.error("❌ Jobicy failed:", err.message);
    return [];
  }
};

// 4. ADZUNA (India-specific)
const fetchAdzuna = async (role, location) => {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      console.warn("⚠️  Adzuna keys not set, skipping.");
      return [];
    }

    const locationQuery = location
      ? `&where=${encodeURIComponent(location)}`
      : "";

    const res = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=20&what=${encodeURIComponent(role)}${locationQuery}&content-type=application/json`,
      { timeout: 8000 }
    );

    return res.data.results.map(job => ({
      company: job.company?.display_name || "Unknown",
      role: job.title,
      location: job.location?.display_name || "India",
      applyLink: job.redirect_url,
      source: "Adzuna"
    }));
  } catch (err) {
    console.error("❌ Adzuna failed:", err.message);
    return [];
  }
};

// -------------------------------------------------------
// Remove duplicate jobs by same role + company
// -------------------------------------------------------
const removeDuplicates = (jobs) => {
  const seen = new Set();
  return jobs.filter(job => {
    const key = `${job.role?.toLowerCase().trim()}-${job.company?.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// -------------------------------------------------------
// Filter by location (smart matching)
// -------------------------------------------------------
const filterByLocation = (jobs, location) => {
  if (!location || location.trim() === "") return jobs;

  const loc = location.toLowerCase().trim();

  return jobs.filter(job => {
    const jobLoc = (job.location || "").toLowerCase();
    return (
      jobLoc.includes(loc) ||
      jobLoc.includes("worldwide") ||
      jobLoc.includes("anywhere") ||
      jobLoc.includes("global") ||
      jobLoc.includes("remote") ||
      jobLoc === ""
    );
  });
};

// -------------------------------------------------------
// MAIN CONTROLLER
// All 4 sources run in parallel using Promise.allSettled
// If 3 fail, the 1 that works still returns data
// No source can crash or block any other source
// -------------------------------------------------------
exports.getExternalJobs = async (req, res) => {

  try {

    const role = req.query.role || "developer";
    const location = req.query.location || "";

    // Run all 4 in parallel — Promise.allSettled never throws
    // even if all 4 fail — it always resolves
    const [remotive, arbeitnow, jobicy, adzuna] = await Promise.allSettled([
      fetchRemotive(role),
      fetchArbeitnow(role),
      fetchJobicy(role),
      fetchAdzuna(role, location)
    ]);

    // Safely extract values
    const remotiveJobs  = remotive.status  === "fulfilled" ? remotive.value  : [];
    const arbeitnowJobs = arbeitnow.status === "fulfilled" ? arbeitnow.value : [];
    const jobicyJobs    = jobicy.status    === "fulfilled" ? jobicy.value    : [];
    const adzunaJobs    = adzuna.status    === "fulfilled" ? adzuna.value    : [];

    // Combine — Adzuna (India) jobs appear first
    const allJobs = [
      ...adzunaJobs,
      ...remotiveJobs,
      ...arbeitnowJobs,
      ...jobicyJobs
    ];

    // Deduplicate + filter
    const uniqueJobs   = removeDuplicates(allJobs);
    const filteredJobs = filterByLocation(uniqueJobs, location);

    // Log source health to server console
    console.log("✅ Job sources:", {
      adzuna:    `${adzunaJobs.length} jobs`,
      remotive:  `${remotiveJobs.length} jobs`,
      arbeitnow: `${arbeitnowJobs.length} jobs`,
      jobicy:    `${jobicyJobs.length} jobs`,
      total:     `${filteredJobs.length} after filter`
    });

    res.json(filteredJobs);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch jobs",
      error: error.message
    });
  }

};