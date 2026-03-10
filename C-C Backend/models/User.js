const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  mobile: {
    type: String,
    default: ""
  },

  role: {
    type: String,
    default: "JOB_SEEKER"
  },

  preferredRole: {
    type: String,
    default: ""
  },

  skills: {
    type: [String],
    default: []
  },

  experience: {
    type: String,
    default: ""
  },

  qualification: {
    type: String,
    default: ""
  },

  gender: {
    type: String,
    default: ""
  },

  age: {
    type: Number
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);