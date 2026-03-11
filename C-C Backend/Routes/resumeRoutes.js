const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../Middleware/authMiddleware");
const { analyzeResume } = require("../Controller/resumeController");

// Store file in memory (no disk storage needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  }
});

// POST /api/resume/analyze
router.post("/analyze", authMiddleware, upload.single("resume"), analyzeResume);

module.exports = router;