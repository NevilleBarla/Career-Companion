const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["applied", "shortlisted", "interview", "offer", "rejected", "reminder", "info"],
    default: "info"
  },
  seen: { type: Boolean, default: false },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);