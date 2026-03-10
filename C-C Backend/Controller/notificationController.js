const Notification = require("../models/Notification");

// Add Notification
exports.addNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();

    res.json({
      message: "Notification added",
      notification
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding notification"
    });
  }
};

// Get All Notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching notifications"
    });
  }
};

// Get Unseen Count
exports.getUnseenCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ seen: false });
    res.json({ unseenCount: count });
  } catch (error) {
    res.status(500).json({
      message: "Error counting notifications"
    });
  }
};

// Mark as Seen
exports.markAsSeen = async (req, res) => {
  const { id } = req.body;

  try {
    await Notification.findByIdAndUpdate(id, { seen: true });
    res.json({ message: "Notification marked as seen" });
  } catch (error) {
    res.status(500).json({
      message: "Error updating notification"
    });
  }
};
