const Job = require("../models/Job");
const Notification = require("../models/Notification");
const User = require("../models/User");
const axios = require("axios");

// Status progression messages
const STATUS_MESSAGES = {
  Applied:     { msg: (role, company) => `You applied for ${role} at ${company}. Good luck! 🚀`, type: "applied" },
  Shortlisted: { msg: (role, company) => `Great news! Your application for ${role} at ${company} has been shortlisted! 🎉`, type: "shortlisted" },
  Interview:   { msg: (role, company) => `Interview scheduled for ${role} at ${company}. Prepare well! 💪`, type: "interview" },
  Offer:       { msg: (role, company) => `Congratulations! You received an offer for ${role} at ${company}! 🎊`, type: "offer" },
  Rejected:    { msg: (role, company) => `Your application for ${role} at ${company} was not selected this time. Keep going! 💡`, type: "rejected" },
};

// ADD JOB (Track Application)
exports.addJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { company, role, location, applyLink, source, status, appliedDate, deadline, notes, skills } = req.body;

    const job = new Job({
      userId, company, role, location, applyLink,
      source: source || "Manual",
      status: status || "Applied",
      appliedDate: appliedDate || new Date().toISOString().split("T")[0],
      deadline, notes, skills
    });
    await job.save();

    // Auto-create notification
    const statusInfo = STATUS_MESSAGES["Applied"];
    await Notification.create({
      userId,
      message: statusInfo.msg(role, company),
      type: statusInfo.type,
      jobId: job._id
    });

    res.json({ message: "Application tracked successfully", job });
  } catch (error) {
    res.status(500).json({ message: "Error adding job", error: error.message });
  }
};

// GET ALL JOBS for logged-in user
exports.getJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobs = await Job.find({ userId }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs" });
  }
};

// UPDATE JOB STATUS
exports.updateJobStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, status, notes } = req.body;

    const job = await Job.findOne({ _id: id, userId });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const oldStatus = job.status;
    job.status = status;
    if (notes !== undefined) job.notes = notes;
    await job.save();

    // Create notification only if status changed
    if (oldStatus !== status && STATUS_MESSAGES[status]) {
      const statusInfo = STATUS_MESSAGES[status];
      await Notification.create({
        userId,
        message: statusInfo.msg(job.role, job.company),
        type: statusInfo.type,
        jobId: job._id
      });
    }

    res.json({ message: "Job updated", job });
  } catch (error) {
    res.status(500).json({ message: "Error updating job", error: error.message });
  }
};

// DELETE JOB
exports.deleteJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.body;
    const job = await Job.findOneAndDelete({ _id: id, userId });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Application deleted", job });
  } catch (error) {
    res.status(500).json({ message: "Error deleting job" });
  }
};

// RECOMMENDED JOBS
exports.getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const preferredRole = user.preferredRole || "";
    const userSkills = user.skills || [];
    const preferredLocation = user.preferredLocation || "";

    const response = await axios.get("https://remotive.com/api/remote-jobs?search=developer");
    const jobs = response.data.jobs;

    const scoredJobs = jobs.map(job => {
      const jobRole = job.title.toLowerCase();
      const jobLocation = (job.candidate_required_location || "").toLowerCase();

      const roleKeywords = preferredRole.toLowerCase().split(" ").filter(Boolean);
      let roleScore = 0;
      roleKeywords.forEach(word => { if (jobRole.includes(word)) roleScore += 20; });
      roleScore = Math.min(roleScore, 40);

      let skillMatches = 0;
      userSkills.forEach(skill => {
        if (job.title.toLowerCase().includes(skill.toLowerCase()) ||
            job.description.toLowerCase().includes(skill.toLowerCase())) skillMatches++;
      });
      const skillScore = userSkills.length ? (skillMatches / userSkills.length) * 40 : 0;

      let locationScore = 0;
      if (preferredLocation.trim()) {
        const prefLoc = preferredLocation.toLowerCase().trim();
        if (jobLocation.includes(prefLoc)) locationScore = 20;
        else if (["worldwide","anywhere","global",""].some(w => jobLocation.includes(w))) locationScore = 10;
      } else locationScore = 10;

      return {
        company: job.company_name,
        role: job.title,
        location: job.candidate_required_location,
        applyLink: job.url,
        matchScore: Math.min(Math.round(roleScore + skillScore + locationScore), 100)
      };
    });

    res.json(scoredJobs.filter(j => j.matchScore >= 75).sort((a, b) => b.matchScore - a.matchScore));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recommended jobs", error: error.message });
  }
};