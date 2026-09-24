const Notification = require('../models/Notification');
const { ensureInitialNotifications } = require('../services/notificationService');

// @desc    Get user notifications and unread count
// @route   GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    // Ensure demo / initial notifications exist if user has none
    await ensureInitialNotifications(req.user);

    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({ notification, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read', unreadCount: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({ message: 'Notification removed', unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
