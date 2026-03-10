const express = require("express");
const router = express.Router();

// Import auth controller
const { register, login } = require("../Controller/authController");
const { getCurrentUser } = require("../Controller/authController");
const authMiddleware = require("../Middleware/authMiddleware");
const { googleAuth } = require("../Controller/authController");


// Register user
router.get("/me", authMiddleware, getCurrentUser);
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);


module.exports = router;
