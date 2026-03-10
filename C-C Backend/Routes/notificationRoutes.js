const express = require("express");
const router = express.Router();

const {
  addNotification,
  getNotifications,
  getUnseenCount,
  markAsSeen
} = require("../Controller/notificationController");



// Add notification
router.post("/add", addNotification);

// Get all notifications
router.get("/all", getNotifications);

// Get unseen count
router.get("/unseen-count", getUnseenCount);

// Mark notification as seen
router.put("/seen", markAsSeen);

module.exports = router;
