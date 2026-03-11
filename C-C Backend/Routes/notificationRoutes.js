const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const { getNotifications, getUnseenCount, markAsSeen, markAllSeen } = require("../Controller/notificationController");

router.use(authMiddleware);

router.get("/all", getNotifications);
router.get("/unseen-count", getUnseenCount);
router.put("/seen", markAsSeen);
router.put("/seen-all", markAllSeen);

module.exports = router;