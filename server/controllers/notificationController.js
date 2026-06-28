import Notification from '../models/Notification.js';

/**
 * @desc    Get recent notifications for logged in user
 * @route   GET /api/notifications
 * @access  Private
 */
const iconMap = {
  friend_request: '👥',
  friend_accepted: '🤝',
  new_message: '💬',
  achievement: '🏆',
  reminder: '🔔',
  goal_deadline: '🎯',
  streak_alert: '🔥',
  milestone: '📍'
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const mapped = notifications.map(n => {
      const obj = n.toObject();
      if (iconMap[obj.type]) {
        obj.icon = iconMap[obj.type];
      }
      return obj;
    });

    return res.status(200).json(mapped);
  } catch (error) {
    console.error('[getNotifications] Error:', error.message);
    return next(error);
  }
};

/**
 * @desc    Get social notifications for logged in user
 * @route   GET /api/notifications/social
 * @access  Private
 */
export const getSocialNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
      type: { $in: ['friend_request', 'friend_accepted', 'new_message'] }
    })
      .sort({ createdAt: -1 });

    const mapped = notifications.map(n => {
      const obj = n.toObject();
      if (iconMap[obj.type]) {
        obj.icon = iconMap[obj.type];
      }
      return obj;
    });

    return res.status(200).json(mapped);
  } catch (error) {
    console.error('[getSocialNotifications] Error:', error.message);
    return next(error);
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res, next) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findOne({ _id: id, user: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    const updated = await notification.save();

    return res.status(200).json(updated);
  } catch (error) {
    console.error('[markAsRead] Error:', error.message);
    return next(error);
  }
};

/**
 * @desc    Mark all user notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id }, { $set: { isRead: true } });
    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('[markAllAsRead] Error:', error.message);
    return next(error);
  }
};

/**
 * @desc    Delete a single notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (req, res, next) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findOneAndDelete({ _id: id, user: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('[deleteNotification] Error:', error.message);
    return next(error);
  }
};

/**
 * @desc    Delete all notifications for logged in user
 * @route   DELETE /api/notifications/clear-all
 * @access  Private
 */
export const clearAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    return res.status(200).json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('[clearAllNotifications] Error:', error.message);
    return next(error);
  }
};

/**
 * @desc    Get count of unread notifications
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
    return res.status(200).json({ count });
  } catch (error) {
    console.error('[getUnreadCount] Error:', error.message);
    return next(error);
  }
};
