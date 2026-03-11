const Notification = require("../models/Notification");

// Get all notifications for user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// Get unseen count
exports.getUnseenCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({ userId, seen: false });
    res.json({ unseenCount: count });
  } catch (error) {
    res.status(500).json({ message: "Error counting notifications" });
  }
};

// Mark one as seen
exports.markAsSeen = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.body;
    await Notification.findOneAndUpdate({ _id: id, userId }, { seen: true });
    res.json({ message: "Marked as seen" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
};

// Mark all as seen
exports.markAllSeen = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ userId, seen: false }, { seen: true });
    res.json({ message: "All marked as seen" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications" });
  }
};