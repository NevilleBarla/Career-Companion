const axios = require("axios");

// -------------------------------------------------------
// LOCATION KNOWLEDGE MAP
// Maps country names to all their states, cities, regions
// So searching "India" also matches "Chennai", "Mumbai" etc.
// -------------------------------------------------------
const LOCATION_MAP = {
  india: [
    // States & UTs
    "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
    "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand", "karnataka",
    "kerala", "madhya pradesh", "maharashtra", "manipur", "meghalaya", "mizoram",
    "nagaland", "odisha", "punjab", "rajasthan", "sikkim", "tamil nadu",
    "telangana", "tripura", "uttar pradesh", "uttarakhand", "west bengal",
    "delhi", "jammu", "kashmir", "ladakh", "chandigarh", "puducherry",
    "andaman", "nicobar", "lakshadweep", "dadra", "daman", "diu",

    // Major cities
    "mumbai", "delhi", "bangalore", "bengaluru", "hyderabad", "chennai",
    "kolkata", "pune", "ahmedabad", "jaipur", "surat", "lucknow", "kanpur",
    "nagpur", "indore", "thane", "bhopal", "visakhapatnam", "vizag", "patna",
    "vadodara", "ghaziabad", "ludhiana", "agra", "nashik", "faridabad",
    "meerut", "rajkot", "varanasi", "srinagar", "aurangabad", "dhanbad",
    "amritsar", "allahabad", "prayagraj", "ranchi", "howrah", "coimbatore",
    "jabalpur", "gwalior", "vijayawada", "jodhpur", "madurai", "raipur",
    "kota", "guwahati", "chandigarh", "solapur", "hubli", "dharwad",
    "mysuru", "mysore", "tiruchirappalli", "trichy", "bareilly", "aligarh",
    "moradabad", "jalandhar", "bhubaneswar", "salem", "warangal", "guntur",
    "bhiwandi", "saharanpur", "gorakhpur", "bikaner", "amravati", "noida",
    "gurugram", "gurgaon", "navi mumbai", "kolhapur", "ajmer", "ulhasnagar",
    "siliguri", "jamshedpur", "bhilai", "cuttack", "firozabad", "kochi",
    "cochin", "thiruvananthapuram", "trivandrum", "kozhikode", "calicut",
    "dehradun", "mangalore", "mangaluru", "tiruppur", "akola", "malegaon",
    "gulbarga", "jalgaon", "udaipur", "sangli", "latur", "secunderabad",
    "shimla", "nanded", "kompally", "ncr", "ap", "tn", "up", "mp", "wb"
  ],

  usa: [
    "new york", "los angeles", "chicago", "houston", "phoenix", "philadelphia",
    "san antonio", "san diego", "dallas", "san jose", "austin", "jacksonville",
    "fort worth", "columbus", "charlotte", "indianapolis", "san francisco",
    "seattle", "denver", "washington", "nashville", "oklahoma", "el paso",
    "boston", "portland", "las vegas", "memphis", "louisville", "baltimore",
    "california", "texas", "florida", "new jersey", "illinois", "pennsylvania",
    "ohio", "georgia", "north carolina", "michigan", "us", "u.s", "united states"
  ],

  uk: [
    "london", "manchester", "birmingham", "glasgow", "liverpool", "bristol",
    "sheffield", "leeds", "edinburgh", "leicester", "coventry", "bradford",
    "cardiff", "belfast", "nottingham", "england", "scotland", "wales",
    "northern ireland", "united kingdom", "great britain", "britain"
  ],

  canada: [
    "toronto", "montreal", "vancouver", "calgary", "edmonton", "ottawa",
    "winnipeg", "quebec", "hamilton", "ontario", "british columbia", "alberta"
  ],

  australia: [
    "sydney", "melbourne", "brisbane", "perth", "adelaide", "gold coast",
    "newcastle", "canberra", "new south wales", "victoria", "queensland",
    "western australia", "south australia", "au", "aus"
  ],

  germany: [
    "berlin", "hamburg", "munich", "münchen", "cologne", "köln", "frankfurt",
    "stuttgart", "düsseldorf", "dortmund", "essen", "leipzig", "bremen",
    "dresden", "hannover", "nuremberg", "nürnberg", "de", "deu"
  ]
};

// -------------------------------------------------------
// Smart location matcher
// Handles: country → cities, city → country, direct match
// -------------------------------------------------------
const locationMatches = (jobLocation, searchLocation) => {
  const jobLoc = (jobLocation || "").toLowerCase().trim();
  const searchLoc = searchLocation.toLowerCase().trim();

  // Always include worldwide/remote jobs
  if (
    jobLoc.includes("worldwide") ||
    jobLoc.includes("anywhere") ||
    jobLoc.includes("global") ||
    jobLoc === "remote" ||
    jobLoc === ""
  ) return true;

  // Direct match
  if (jobLoc.includes(searchLoc)) return true;

  // Country-level search → match all cities/states in that country
  // e.g. user searches "india" → match "Chennai, Tamil Nadu, India"
  if (LOCATION_MAP[searchLoc]) {
    const regions = LOCATION_MAP[searchLoc];
    // Check if job location contains the country name
    if (jobLoc.includes(searchLoc)) return true;
    // Check if job location contains any city/state of that country
    if (regions.some(region => jobLoc.includes(region))) return true;
  }

  // City/state search → also match other jobs in the same country
  // e.g. user searches "chennai" → also show "Mumbai" (both in India)
  for (const [country, regions] of Object.entries(LOCATION_MAP)) {
    if (regions.includes(searchLoc)) {
      // User searched for a region inside this country
      // Match any job that mentions this country or any of its regions
      if (jobLoc.includes(country)) return true;
      if (regions.some(r => jobLoc.includes(r))) return true;
    }
  }

  return false;
};

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
// Filter using smart geo-aware location matching
// -------------------------------------------------------
const filterByLocation = (jobs, location) => {
  if (!location || location.trim() === "") return jobs;
  return jobs.filter(job => locationMatches(job.location, location));
};

// -------------------------------------------------------
// MAIN CONTROLLER
// -------------------------------------------------------
exports.getExternalJobs = async (req, res) => {
  try {
    const role = req.query.role || "developer";
    const location = req.query.location || "";

    const [remotive, arbeitnow, jobicy, adzuna] = await Promise.allSettled([
      fetchRemotive(role),
      fetchArbeitnow(role),
      fetchJobicy(role),
      fetchAdzuna(role, location)
    ]);

    const remotiveJobs  = remotive.status  === "fulfilled" ? remotive.value  : [];
    const arbeitnowJobs = arbeitnow.status === "fulfilled" ? arbeitnow.value : [];
    const jobicyJobs    = jobicy.status    === "fulfilled" ? jobicy.value    : [];
    const adzunaJobs    = adzuna.status    === "fulfilled" ? adzuna.value    : [];

    const allJobs = [
      ...adzunaJobs,
      ...remotiveJobs,
      ...arbeitnowJobs,
      ...jobicyJobs
    ];

    const uniqueJobs   = removeDuplicates(allJobs);
    const filteredJobs = filterByLocation(uniqueJobs, location);

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