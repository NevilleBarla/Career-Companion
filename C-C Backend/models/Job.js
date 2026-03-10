const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "Applied"
  },
  appliedDate: {
    type: String
  },
  deadline: {
    type: String
  },
  skills: {
  type: [String],
  default: []
}
}, {
  timestamps: true
});

module.exports = mongoose.model("Job", jobSchema);
