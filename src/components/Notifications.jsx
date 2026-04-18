import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, X, AlertCircle, MessageSquare } from 'lucide-react';
import { apiService } from '../services/api';
import '../styles/Notifications.css';

const Notifications = ({ userId, isAdmin }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserNotifications(userId);
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadNotificationsCount(userId);
      if (response.success) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(n =>
        n.notification_id === notificationId ? { ...n, read_status: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead(userId);
      setNotifications(notifications.map(n => ({ ...n, read_status: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.read_status) {
      await markAsRead(notification.notification_id);
    }

    // Close dropdown
    setIsOpen(false);

    // Navigate based on user role and notification type
    if (isAdmin) {
      // Admin notifications - go to applications page
      navigate('/admin/applications');
    } else {
      // Student notifications
      if (notification.notification_type === 'application') {
        navigate('/applications');
      } else if (notification.scholarship_id) {
        navigate(`/scholarships/${notification.scholarship_id}`);
      } else {
        navigate('/applications');
      }
    }
  };

  return (
    <div className="notifications-container">
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read"
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notifications-list">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={24} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.notification_id}
                  className={`notification-item ${!notification.read_status ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {notification.notification_type === 'application' ? (
                      <CheckCircle size={16} className="icon-success" />
                    ) : notification.notification_type === 'admin_remark' ? (
                      <MessageSquare size={16} className="icon-warning" />
                    ) : (
                      <AlertCircle size={16} className="icon-info" />
                    )}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                  {!notification.read_status && (
                    <div className="unread-dot"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
