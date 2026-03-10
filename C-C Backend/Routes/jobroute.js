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


module.exports = router;
