import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, AlertCircle, Info, MessageSquare, BookOpen, DollarSign, UserX, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import api from '../lib/api';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  readAt: string | null;
  sentAt: string;
}

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LOAN_CREATED':
      case 'LOAN_CONFIRMATION':
        return <BookOpen className="w-5 h-5 text-green-400" />;
      case 'LOAN_RETURNED':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'LOAN_RETURNED_OVERDUE':
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      case 'DUE_REMINDER':
        return <Clock className="w-5 h-5 text-blue-400" />;
      case 'OVERDUE_WARNING':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'HOLD_PLACED':
        return <UserX className="w-5 h-5 text-orange-400" />;
      case 'HOLD_REMOVED':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'FINE_CHARGED':
        return <DollarSign className="w-5 h-5 text-yellow-400" />;
      case 'FINE_PAID':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'ADMIN_MESSAGE':
        return <MessageSquare className="w-5 h-5 text-purple-400" />;
      // Admin-specific notifications
      case 'ADMIN_BOOK_BORROWED':
        return <BookOpen className="w-5 h-5 text-blue-400" />;
      case 'ADMIN_BOOK_RETURNED':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'ADMIN_BOOK_OVERDUE':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'ADMIN_FINE_CHARGED':
        return <DollarSign className="w-5 h-5 text-yellow-400" />;
      case 'ADMIN_FINE_PAID':
        return <DollarSign className="w-5 h-5 text-green-400" />;
      case 'ADMIN_HOLD_PLACED':
        return <UserX className="w-5 h-5 text-orange-400" />;
      case 'ADMIN_LATE_RETURN':
        return <TrendingUp className="w-5 h-5 text-orange-400" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500';
      case 'high':
        return 'border-l-4 border-orange-500';
      case 'normal':
        return 'border-l-4 border-blue-500';
      default:
        return 'border-l-4 border-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-900/95 border border-purple-500/30 rounded-lg shadow-xl shadow-purple-500/20 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  <Check className="w-4 h-4 inline mr-1" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="w-12 h-12 text-gray-600 mb-2" />
                <p className="text-gray-400">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-purple-500/20">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/notifications/${notification.id}`);
                    }}
                    className={`p-4 hover:bg-purple-500/10 cursor-pointer transition-colors ${
                      !notification.readAt ? 'bg-purple-500/5' : ''
                    } ${getPriorityColor(notification.priority)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-sm font-medium ${!notification.readAt ? 'text-white' : 'text-gray-300'}`}>
                            {notification.title}
                          </h4>
                          {!notification.readAt && (
                            <span className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(notification.sentAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
