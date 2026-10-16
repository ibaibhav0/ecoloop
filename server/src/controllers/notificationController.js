import { NotificationStore } from '../data/store.js';
import { notificationService } from '../services/notificationService.js';

export const getNotifications = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') {
      filter.recipientEmail = req.user.email;
    } else if (req.user.role === 'collector') {
      // Collectors see collector alerts and their direct notifications
      filter.recipientRole = 'collector';
    } else if (req.user.role === 'admin') {
      // Admins see admin alerts or all if requested
      if (req.query.all !== 'true') {
        filter.recipientRole = 'admin';
      }
    }

    const notifications = await NotificationStore.findAll(filter);
    return res.status(200).json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching notifications', error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await NotificationStore.markAsRead(id);
    return res.status(200).json({ success: true, notification: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const sendTestNotification = async (req, res) => {
  try {
    const { email, phone, title = 'EcoLoop Realtime Test', message = 'Test notification from EcoLoop Campus Platform' } = req.body;

    const targetEmail = email || req.user.email;
    const targetPhone = phone || req.user.phone || '+919876543210';

    const result = await notificationService.dispatch({
      recipientEmail: targetEmail,
      recipientPhone: targetPhone,
      recipientName: req.user.name,
      recipientRole: req.user.role,
      type: 'test_notification',
      title,
      message,
      trackingCode: 'ECO-TEST-2026',
    });

    return res.status(200).json({
      success: true,
      message: 'Test notification processed through real email and SMS gateways',
      ...result,
    });
  } catch (error) {
    console.error('Test notification error:', error);
    return res.status(500).json({ success: false, message: 'Server error sending test notification', error: error.message });
  }
};
