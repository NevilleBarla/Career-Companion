const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  seen: {
    type: Boolean,
    default: false
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job"
  },
  type: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Notification", notificationSchema);
