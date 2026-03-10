const express = require("express");
const router = express.Router();

const {
  updateProfile,
  getProfile
} = require("../Controller/usercontroller");

const authMiddleware = require("../Middleware/authMiddleware");


router.put("/profile", authMiddleware, updateProfile);

router.get("/profile", authMiddleware, getProfile);


module.exports = router;