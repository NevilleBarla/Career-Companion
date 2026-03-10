const Job = require("../models/Job");
const Notification = require("../models/Notification");
const User = require("../models/User");
const axios = require("axios");


// ---------------- ADD JOB ----------------

exports.addJob = async (req, res) => {
  try {

    const { company, role, status, skills } = req.body;

    const job = new Job({ company, role, status, skills });
    await job.save();

    res.json({ message: "Job added successfully", job });

  } catch (error) {
    res.status(500).json({ message: "Error adding job", error: error.message });
  }
};


// ---------------- GET ALL JOBS ----------------

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs" });
  }
};


// ---------------- UPDATE JOB STATUS ----------------

exports.updateJobStatus = async (req, res) => {
  try {

    const { id, status } = req.body;

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.status = status;
    await job.save();

    res.json({ message: "Job status updated", job });

  } catch (error) {
    res.status(500).json({ message: "Error updating job", error: error.message });
  }
};


// ---------------- DELETE JOB ----------------

exports.deleteJob = async (req, res) => {
  try {

    const { id } = req.body;

    const job = await Job.findByIdAndDelete(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json({ message: "Job deleted successfully", job });

  } catch (error) {
    res.status(500).json({ message: "Error deleting job" });
  }
};


// ---------------- RECOMMENDED JOBS ----------------

exports.getRecommendedJobs = async (req, res) => {

  try {

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const preferredRole = user.preferredRole || "";
    const userSkills = user.skills || [];
    const preferredLocation = user.preferredLocation || "";

    // Fetch live jobs from Remotive API
    const response = await axios.get(
      "https://remotive.com/api/remote-jobs?search=developer"
    );

    const jobs = response.data.jobs;

    const scoredJobs = jobs.map(job => {

      const jobRole = job.title.toLowerCase();
      const jobLocation = (job.candidate_required_location || "").toLowerCase();

      // ----- ROLE MATCH (max 40 pts) -----
      const roleKeywords = preferredRole.toLowerCase().split(" ").filter(Boolean);
      let roleScore = 0;
      roleKeywords.forEach(word => {
        if (jobRole.includes(word)) roleScore += 20;
      });
      roleScore = Math.min(roleScore, 40);

      // ----- SKILL MATCH (max 40 pts) -----
      let skillMatches = 0;
      userSkills.forEach(skill => {
        if (
          job.title.toLowerCase().includes(skill.toLowerCase()) ||
          job.description.toLowerCase().includes(skill.toLowerCase())
        ) {
          skillMatches++;
        }
      });
      const skillScore = userSkills.length
        ? (skillMatches / userSkills.length) * 40
        : 0;

      // ----- LOCATION MATCH (max 20 pts) -----
      let locationScore = 0;
      if (preferredLocation.trim() !== "") {
        const prefLoc = preferredLocation.toLowerCase().trim();
        if (jobLocation.includes(prefLoc)) {
          locationScore = 20; // exact region match
        } else if (
          jobLocation.includes("worldwide") ||
          jobLocation.includes("anywhere") ||
          jobLocation.includes("global") ||
          jobLocation === ""
        ) {
          locationScore = 10; // worldwide jobs are acceptable
        }
      } else {
        // No location preference set — don't penalize
        locationScore = 10;
      }

      const matchScore = Math.min(Math.round(roleScore + skillScore + locationScore), 100);

      return {
        company: job.company_name,
        role: job.title,
        location: job.candidate_required_location,
        applyLink: job.url,
        matchScore
      };

    });

    // Show only strong matches
    const recommendedJobs = scoredJobs
      .filter(job => job.matchScore >= 75)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(recommendedJobs);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch recommended jobs",
      error: error.message
    });
  }

};