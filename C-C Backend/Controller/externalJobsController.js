const axios = require("axios");

exports.getExternalJobs = async (req, res) => {

  try {

    const role = req.query.role || "developer";

    const response = await axios.get(
      `https://remotive.com/api/remote-jobs?search=${role}`
    );

    const jobs = response.data.jobs.map(job => ({
      company: job.company_name,
      role: job.title,
      location: job.candidate_required_location,
      applyLink: job.url
    }));

    res.json(jobs);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch external jobs"
    });

  }

};