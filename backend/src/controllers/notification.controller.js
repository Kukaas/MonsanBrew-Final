import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

// Create helper functions to emit notifications
export const createNotificationForUser = async ({
  userId,
  type,
  title,
  message,
  orderId,
}) => {
  if (!userId) return null;
  const notif = new Notification({
    userId,
    type,
    title,
    message,
    orderId,
    roleTarget: null,
  });
  await notif.save();
  return notif;
};

export const createNotificationForRole = async ({
  role,
  type,
  title,
  message,
  orderId,
}) => {
  if (!role) return null;
  const notif = new Notification({
    roleTarget: role,
    type,
    title,
    message,
    orderId,
    userId: null,
  });
  await notif.save();
  return notif;
};

// API: Get notifications for a user (includes targeted role broadcasts)
export const getNotifications = async (req, res) => {
  try {
    const { userId, role } = req.query;
    if (!userId && !role) {
      return res
        .status(400)
        .json({ error: "userId or role is required to fetch notifications." });
    }

    const filter = {
      $or: [],
    };
    if (userId) {
      filter.$or.push({ userId });
    }
    if (role) {
      filter.$or.push({ roleTarget: role });
    }
    if (filter.$or.length === 0) {
      return res.status(400).json({ error: "Invalid query." });
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(100); // keep it reasonable

    res.json({ notifications });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
};

// API: Mark a notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Notification ID is required." });
    const notif = await Notification.findById(id);
    if (!notif) return res.status(404).json({ error: "Notification not found." });
    notif.isRead = true;
    await notif.save();
    res.json({ message: "Notification marked as read.", notification: notif });
  } catch (err) {
    console.error("Mark notification read error:", err);
    res.status(500).json({ error: "Failed to mark notification as read." });
  }
};

// API: Mark all notifications as read for a user
export const markAllNotificationsRead = async (req, res) => {
  try {
    const { userId, role } = req.body || {};
    if (!userId && !role) {
      return res
        .status(400)
        .json({ error: "userId or role is required to mark notifications as read." });
    }
    const filter = { $or: [] };
    if (userId) filter.$or.push({ userId, isRead: false });
    if (role) filter.$or.push({ roleTarget: role, isRead: false });
    if (filter.$or.length === 0) {
      return res.status(400).json({ error: "Invalid request." });
    }
    await Notification.updateMany(filter, { $set: { isRead: true } });
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    console.error("Mark all notifications read error:", err);
    res.status(500).json({ error: "Failed to mark all as read." });
  }
};


