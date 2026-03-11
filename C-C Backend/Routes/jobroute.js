const express = require("express");
const router = express.Router();


// Import controller functions
const {
  addJob,
  getJobs,
  updateJobStatus,
  deleteJob,
  getRecommendedJobs 
} = require("../Controller/jobcontrollers");

const authMiddleware = require("../Middleware/authMiddleware");

// Import external jobs controller
const { getExternalJobs } = require("../Controller/externalJobsController");

router.get("/external", getExternalJobs);

// Route to add a job
router.post("/add", addJob);

// Route to get all jobs
router.get("/all", getJobs);

// Route to update job status
router.put("/update-status", updateJobStatus);

// Route to delete a job
router.delete("/delete", deleteJob);

// Route to get recommended jobs
router.get("/recommended", authMiddleware, getRecommendedJobs);



// Logo proxy — fetches company logo server-side to avoid CORS/rate-limit blocks
const axios = require("axios");
router.get("/logo", async (req, res) => {
  const { domain } = req.query;
  if (!domain) return res.status(400).send("domain required");
  try {
    const response = await axios.get(`https://logo.clearbit.com/${domain}`, {
      responseType: "arraybuffer",
      timeout: 4000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CareerCompanion/1.0)" },
    });
    const contentType = response.headers["content-type"] || "image/png";
    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=86400");
    res.send(response.data);
  } catch (err) {
    res.status(404).send("Logo not found");
  }
});

module.exports = router;