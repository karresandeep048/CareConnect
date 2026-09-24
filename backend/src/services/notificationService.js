const Notification = require('../models/Notification');

/**
 * Create a new notification for a user
 */
const createNotification = async ({ recipient, sender, title, message, type = 'SYSTEM', relatedId = null, link = '' }) => {
  try {
    if (!recipient) return null;
    const notification = await Notification.create({
      recipient,
      sender: sender || null,
      title,
      message,
      type,
      relatedId,
      link
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error.message);
    return null;
  }
};

/**
 * Seed initial sample notifications for a user if they don't have any yet
 */
const ensureInitialNotifications = async (user) => {
  try {
    const count = await Notification.countDocuments({ recipient: user._id });
    if (count > 0) return;

    if (user.role === 'customer') {
      await Notification.create([
        {
          recipient: user._id,
          title: 'Welcome to CareConnect!',
          message: 'Explore verified home specialists or describe your repair needs using our AI NLP assistant.',
          type: 'SYSTEM',
          link: '/customer-dashboard?tab=requests',
          isRead: false
        },
        {
          recipient: user._id,
          title: 'Direct Specialist Routing Available',
          message: 'You can now select dedicated providers based on category (Appliance, Electrical, Plumbing, HVAC) when creating requests.',
          type: 'SERVICE_REQUEST',
          link: '/customer-dashboard?tab=requests',
          isRead: false
        }
      ]);
    } else if (user.role === 'provider') {
      await Notification.create([
        {
          recipient: user._id,
          title: 'Welcome to Provider Workspace!',
          message: 'Your profile is active. Check the Open Requests Feed to submit transparent price quotes.',
          type: 'SYSTEM',
          link: '/provider-dashboard?tab=feed',
          isRead: false
        },
        {
          recipient: user._id,
          title: 'Direct Customer Job Requests Active',
          message: 'Customers can now select you directly for category-specific repair work in your service area.',
          type: 'SERVICE_REQUEST',
          link: '/provider-dashboard?tab=feed',
          isRead: false
        }
      ]);
    }
  } catch (error) {
    console.error('[NotificationService] Error seeding notifications:', error.message);
  }
};

module.exports = {
  createNotification,
  ensureInitialNotifications
};
