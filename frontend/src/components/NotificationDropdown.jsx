import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Bell, CheckCheck, Trash2, Sparkles, DollarSign, Calendar,
  Clock, Key, CheckCircle2, AlertCircle, ExternalLink, X, Tag
} from 'lucide-react';

export default function NotificationDropdown() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  // Poll notifications periodically and on user change
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await API.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      // Re-fetch to synchronize unread count accurately
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif._id);
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const diff = Math.floor((now - new Date(dateStr)) / 1000); // seconds
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SERVICE_REQUEST':
        return <Sparkles className="w-4 h-4 text-purple-700" />;
      case 'QUOTE_SUBMITTED':
        return <DollarSign className="w-4 h-4 text-emerald-700" />;
      case 'QUOTE_ACCEPTED':
      case 'BOOKING_SCHEDULED':
        return <Calendar className="w-4 h-4 text-blue-700" />;
      case 'JOB_IN_PROGRESS':
        return <Key className="w-4 h-4 text-amber-700" />;
      case 'JOB_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-700" />;
      case 'INVOICE_PAID':
        return <DollarSign className="w-4 h-4 text-emerald-700" />;
      default:
        return <Bell className="w-4 h-4 text-teal-700" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        aria-label="View notifications"
        className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all border border-slate-200 focus:outline-none flex items-center justify-center"
      >
        <Bell className="w-4.5 h-4.5 text-teal-700" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-rose-500 to-teal-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-lg shadow-teal-500/30 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : (
          <span className="sr-only">No new notifications</span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fadeIn backdrop-blur-xl">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-700 text-[10px] font-semibold border border-teal-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  title="Mark all as read"
                  className="text-[11px] text-slate-500 hover:text-teal-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-teal-700" /> Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-200">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="font-medium text-slate-600">You're all caught up!</p>
                <p className="text-[11px] text-slate-500">No new alerts or job updates right now.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative group ${
                    notif.isRead
                      ? 'bg-slate-50 hover:bg-slate-50 text-slate-600'
                      : 'bg-teal-950/20 hover:bg-teal-950/40 text-slate-900'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                    notif.isRead
                      ? 'bg-white border-slate-200 text-slate-500'
                      : 'bg-teal-900/40 border-teal-500/30'
                  }`}>
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className={`text-xs font-bold truncate ${notif.isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 flex-shrink-0">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.link && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-teal-700 font-semibold mt-1.5 hover:underline">
                        View details <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Actions / Unread dot */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 ring-2 ring-teal-500/20" />
                    )}
                    <button
                      onClick={(e) => handleDelete(notif._id, e)}
                      title="Dismiss"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-600 transition-opacity rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-center">
              <span className="text-[10px] text-slate-500">
                Connected to CareConnect Real-Time Event Stream
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
