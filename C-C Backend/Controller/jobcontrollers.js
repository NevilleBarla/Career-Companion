const Job = require("../models/Job");
const Notification = require("../models/Notification");
const User = require("../models/User");
const axios = require("axios");

const STATUS_MESSAGES = {
  Applied:     { msg: (role, company) => `You applied for ${role} at ${company}. Good luck! 🚀`, type: "applied" },
  Shortlisted: { msg: (role, company) => `Great news! Your application for ${role} at ${company} has been shortlisted! 🎉`, type: "shortlisted" },
  Interview:   { msg: (role, company) => `Interview scheduled for ${role} at ${company}. Prepare well! 💪`, type: "interview" },
  Offer:       { msg: (role, company) => `Congratulations! You received an offer for ${role} at ${company}! 🎊`, type: "offer" },
  Rejected:    { msg: (role, company) => `Your application for ${role} at ${company} was not selected this time. Keep going! 💡`, type: "rejected" },
};

exports.addJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { company, role, location, applyLink, source, status, appliedDate, deadline, notes, skills } = req.body;
    const job = new Job({ userId, company, role, location, applyLink, source: source || "Manual", status: status || "Applied", appliedDate: appliedDate || new Date().toISOString().split("T")[0], deadline, notes, skills });
    await job.save();
    const statusInfo = STATUS_MESSAGES["Applied"];
    await Notification.create({ userId, message: statusInfo.msg(role, company), type: statusInfo.type, jobId: job._id });
    res.json({ message: "Application tracked successfully", job });
  } catch (error) {
    res.status(500).json({ message: "Error adding job", error: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobs = await Job.find({ userId }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs" });
  }
};

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
    if (oldStatus !== status && STATUS_MESSAGES[status]) {
      const statusInfo = STATUS_MESSAGES[status];
      await Notification.create({ userId, message: statusInfo.msg(job.role, job.company), type: statusInfo.type, jobId: job._id });
    }
    res.json({ message: "Job updated", job });
  } catch (error) {
    res.status(500).json({ message: "Error updating job", error: error.message });
  }
};

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

// ── QUALIFICATION LEVEL HELPER ──────────────────────────────────────────
const QUAL_LEVELS = {
  "phd": 5, "doctorate": 5,
  "master": 4, "mtech": 4, "mba": 4, "msc": 4, "me ": 4,
  "bachelor": 3, "btech": 3, "be ": 3, "bsc": 3, "bca": 3, "bba": 3, "b.tech": 3, "b.e": 3,
  "diploma": 2, "associate": 2,
  "12th": 1, "hsc": 1, "high school": 1,
  "10th": 0, "ssc": 0,
};

const getQualLevel = (text) => {
  if (!text) return -1;
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(QUAL_LEVELS)) {
    if (lower.includes(key)) return val;
  }
  return -1;
};

// ── EXPERIENCE HELPER ────────────────────────────────────────────────────
const getExpYears = (text) => {
  if (!text) return 0;
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

const getJobExpRequired = (description) => {
  if (!description) return 0;
  const patterns = [
    /([0-9]+)\+?\s*years? (of )?experience/i,
    /experience[^.]*?([0-9]+)\+?\s*years?/i,
    /minimum ([0-9]+)\s*years?/i,
  ];
  for (const p of patterns) {
    const m = description.match(p);
    if (m) return parseInt(m[1]);
  }
  return 0;
};

// ── RECOMMENDED JOBS ─────────────────────────────────────────────────────
exports.getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const preferredRoles = (user.preferredRole || "").split(",").map(r => r.trim().toLowerCase()).filter(Boolean);
    const userSkills = user.skills || [];
    const preferredLocation = user.preferredLocation || "";
    const userQualLevel = getQualLevel(user.qualification || "");
    const userExpYears = getExpYears(user.experience || "");

    // Fetch from multiple sources in parallel
    const [remotiveRes, arbeitnowRes] = await Promise.allSettled([
      axios.get("https://remotive.com/api/remote-jobs?limit=100", { timeout: 8000 }),
      axios.get("https://www.arbeitnow.com/api/job-board-api", { timeout: 8000 }),
    ]);

    let allJobs = [];

    if (remotiveRes.status === "fulfilled") {
      const jobs = remotiveRes.value.data.jobs || [];
      allJobs.push(...jobs.map(j => ({
        title: j.title,
        company: j.company_name,
        description: j.description || "",
        location: j.candidate_required_location || "Remote",
        applyLink: j.url,
        tags: j.tags || [],
        source: "Remotive",
      })));
    }

    if (arbeitnowRes.status === "fulfilled") {
      const jobs = arbeitnowRes.value.data.data || [];
      allJobs.push(...jobs.map(j => ({
        title: j.title,
        company: j.company_name,
        description: j.description || "",
        location: j.location || "Remote",
        applyLink: j.url,
        tags: j.tags || [],
        source: "Arbeitnow",
      })));
    }

    const scoredJobs = allJobs.map(job => {
      const jobRole = job.title.toLowerCase();
      const jobDesc = job.description.toLowerCase();
      const jobLocation = job.location.toLowerCase();

      // ── ROLE MATCH (max 35 pts) ──
      let roleScore = 0;
      for (const role of preferredRoles) {
        const roleWords = role.split(" ").filter(Boolean);
        let wordHits = 0;
        roleWords.forEach(w => { if (jobRole.includes(w)) wordHits++; });
        const roleHit = wordHits / Math.max(roleWords.length, 1);
        roleScore = Math.max(roleScore, roleHit * 35);
      }

      // ── SKILL MATCH (max 35 pts) ──
      let skillMatches = 0;
      const matchedSkills = [];
      userSkills.forEach(skill => {
        if (jobRole.includes(skill.toLowerCase()) || jobDesc.includes(skill.toLowerCase())) {
          skillMatches++;
          matchedSkills.push(skill);
        }
      });
      const skillScore = userSkills.length ? (skillMatches / userSkills.length) * 35 : 0;

      // ── LOCATION MATCH (max 15 pts) ──
      let locationScore = 0;
      if (preferredLocation.trim()) {
        const prefLoc = preferredLocation.toLowerCase().trim();
        if (jobLocation.includes(prefLoc)) locationScore = 15;
        else if (["worldwide","anywhere","global","remote"].some(w => jobLocation.includes(w))) locationScore = 8;
      } else locationScore = 8;

      // ── QUALIFICATION MATCH (max 10 pts) ──
      let qualScore = 0;
      if (userQualLevel >= 0) {
        const jobQualLevel = getQualLevel(job.description);
        if (jobQualLevel === -1) {
          qualScore = 8; // no requirement stated — assume OK
        } else if (userQualLevel >= jobQualLevel) {
          qualScore = 10; // meets or exceeds
        } else {
          qualScore = Math.max(0, 10 - (jobQualLevel - userQualLevel) * 3);
        }
      } else qualScore = 7;

      // ── EXPERIENCE MATCH (max 5 pts) ──
      let expScore = 0;
      const jobExpRequired = getJobExpRequired(job.description);
      if (jobExpRequired === 0) {
        expScore = 5;
      } else if (userExpYears >= jobExpRequired) {
        expScore = 5;
      } else {
        expScore = Math.max(0, 5 - (jobExpRequired - userExpYears));
      }

      const matchScore = Math.min(Math.round(roleScore + skillScore + locationScore + qualScore + expScore), 100);

      // Breakdown for frontend display
      const breakdown = {
        role: Math.round(roleScore),
        skills: Math.round(skillScore),
        location: Math.round(locationScore),
        qualification: Math.round(qualScore),
        experience: Math.round(expScore),
      };

      return {
        company: job.company,
        role: job.title,
        location: job.location,
        applyLink: job.applyLink,
        source: job.source,
        tags: job.tags,
        matchScore,
        breakdown,
        matchedSkills,
      };
    });

    const result = scoredJobs
      .filter(j => j.matchScore >= 40)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 50);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recommended jobs", error: error.message });
  }
};