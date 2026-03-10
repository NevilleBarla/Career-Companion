const Job = require("../models/Job");
const Notification = require("../models/Notification");
const User = require("../models/User");
const axios = require("axios");


// ---------------- ADD JOB ----------------

exports.addJob = async (req, res) => {
  try {

    const { company, role, status, skills } = req.body;

    const job = new Job({
      company,
      role,
      status,
      skills
    });

    await job.save();

    res.json({
      message: "Job added successfully",
      job
    });

  } catch (error) {

    res.status(500).json({
      message: "Error adding job",
      error: error.message
    });

  }
};


// ---------------- GET ALL JOBS ----------------

exports.getJobs = async (req, res) => {
  try {

    const jobs = await Job.find().sort({ createdAt: -1 });

    res.json(jobs);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching jobs"
    });

  }
};


// ---------------- UPDATE JOB STATUS ----------------

exports.updateJobStatus = async (req, res) => {
  try {

    const { id, status } = req.body;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    job.status = status;

    await job.save();

    res.json({
      message: "Job status updated",
      job
    });

  } catch (error) {

    res.status(500).json({
      message: "Error updating job",
      error: error.message
    });

  }
};


// ---------------- DELETE JOB ----------------

exports.deleteJob = async (req, res) => {
  try {

    const { id } = req.body;

    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    res.json({
      message: "Job deleted successfully",
      job
    });

  } catch (error) {

    res.status(500).json({
      message: "Error deleting job"
    });

  }
};


// ---------------- RECOMMENDED JOBS ----------------

exports.getRecommendedJobs = async (req, res) => {

  try {

    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const preferredRole = user.preferredRole || "";
    const userSkills = user.skills || [];

    // Fetch live jobs from Remotive API
    const response = await axios.get(
      "https://remotive.com/api/remote-jobs?search=developer"
    );

    const jobs = response.data.jobs;

    const scoredJobs = jobs.map(job => {

      const jobRole = job.title.toLowerCase();

      // ----- ROLE MATCH -----

      const roleKeywords = preferredRole.toLowerCase().split(" ");

let roleScore = 0;

roleKeywords.forEach(word => {
  if (jobRole.includes(word)) {
    roleScore += 25;
  }
});

      // ----- SKILL MATCH -----

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
        ? (skillMatches / userSkills.length) * 50
        : 0;

      const matchScore = Math.round(roleScore + skillScore);

      return {
        company: job.company_name,
        role: job.title,
        location: job.candidate_required_location,
        applyLink: job.url,
        matchScore
      };

    });


    // Show only strong matches
    const recommendedJobs = scoredJobs.filter(
      job => job.matchScore >= 75
    );


    res.json(recommendedJobs);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch recommended jobs",
      error: error.message
    });

  }

};