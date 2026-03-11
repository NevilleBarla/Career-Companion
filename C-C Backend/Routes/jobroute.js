const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { addJob, getJobs, updateJobStatus, deleteJob, getRecommendedJobs } = require("../Controller/jobcontrollers");
const { getExternalJobs } = require("../Controller/externalJobsController");
const axios = require("axios");

// External jobs (no auth needed)
router.get("/external", getExternalJobs);

// Logo proxy
router.get("/logo", async (req, res) => {
  const { domain } = req.query;
  if (!domain) return res.status(400).send("domain required");
  try {
    const response = await axios.get(`https://logo.clearbit.com/${domain}`, {
      responseType: "arraybuffer", timeout: 4000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CareerCompanion/1.0)" },
    });
    res.set("Content-Type", response.headers["content-type"] || "image/png");
    res.set("Cache-Control", "public, max-age=86400");
    res.send(response.data);
  } catch (err) { res.status(404).send("Logo not found"); }
});

// All tracker routes require auth
router.post("/add", authMiddleware, addJob);
router.get("/all", authMiddleware, getJobs);
router.put("/update-status", authMiddleware, updateJobStatus);
router.delete("/delete", authMiddleware, deleteJob);
router.get("/recommended", authMiddleware, getRecommendedJobs);

module.exports = router;