const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: { type: String, default: "" },
  applyLink: { type: String, default: "" },
  source: { type: String, default: "Manual" },
  status: {
    type: String,
    enum: ["Applied", "Shortlisted", "Interview", "Offer", "Rejected"],
    default: "Applied"
  },
  appliedDate: { type: String },
  deadline: { type: String },
  notes: { type: String, default: "" },
  skills: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);