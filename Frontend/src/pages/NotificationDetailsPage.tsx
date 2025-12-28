import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Bell,
  Calendar,
  BookOpen,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Info,
  Clock,
  FileText,
  UserX,
} from 'lucide-react';

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: string;
  channel: string;
  payload: any;
  createdAt: string;
  readAt: string | null;
}

interface Hold {
  id: number;
  memberId: number;
  reason: string;
  status: string;
  placedAt: string;
}

export default function NotificationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [memberHolds, setMemberHolds] = useState<Hold[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingHold, setRemovingHold] = useState<number | null>(null);

  useEffect(() => {
    fetchNotification();
  }, [id]);

  const fetchNotification = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/notifications/${id}`);
      setNotification(response.data.notification);

      // Mark as read if not already
      if (!response.data.notification.readAt) {
        await api.put(`/notifications/${id}/read`);
      }

      // If admin viewing ADMIN_FINE_PAID notification, fetch member's holds
      if (
        user?.accountType === 'ADMIN' &&
        response.data.notification.type === 'ADMIN_FINE_PAID' &&
        response.data.notification.payload
      ) {
        const payload = typeof response.data.notification.payload === 'string'
          ? JSON.parse(response.data.notification.payload)
          : response.data.notification.payload;

        if (payload.memberId) {
          await fetchMemberHolds(payload.memberId);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberHolds = async (memberId: number) => {
    try {
      const response = await api.get(`/holds/member/${memberId}`);
      setMemberHolds(response.data.holds || []);
    } catch (error) {
      console.error('Failed to fetch member holds:', error);
    }
  };

  const handleRemoveHold = async (holdId: number) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      const toastId = toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-white">Are you sure you want to remove this hold from the member's account?</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Confirm
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
        style: { background: '#1a1f2e', maxWidth: '450px' }
      });
    });

    if (!confirmed) return;

    const loadingToast = toast.loading('Removing hold...');

    try {
      setRemovingHold(holdId);
      await api.delete(`/holds/${holdId}`);
      
      // Refresh holds list
      const payload = notification?.payload
        ? (typeof notification.payload === 'string' ? JSON.parse(notification.payload) : notification.payload)
        : null;
      
      if (payload?.memberId) {
        await fetchMemberHolds(payload.memberId);
      }

      toast.success('Hold removed successfully!', { id: loadingToast });
    } catch (error: any) {
      console.error('Failed to remove hold:', error);
      toast.error(error.response?.data?.error || 'Failed to remove hold', { id: loadingToast });
    } finally {
      setRemovingHold(null);
    }
  };

  const getNotificationIcon = () => {
    switch (notification?.type) {
      case 'LOAN_CREATED':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'LOAN_RETURNED':
        return <CheckCircle className="w-8 h-8 text-blue-400" />;
      case 'LOAN_RETURNED_OVERDUE':
        return <AlertCircle className="w-8 h-8 text-red-400" />;
      case 'DUE_REMINDER':
        return <Clock className="w-8 h-8 text-yellow-400" />;
      case 'OVERDUE_WARNING':
        return <AlertCircle className="w-8 h-8 text-orange-400" />;
      case 'HOLD_PLACED':
        return <AlertCircle className="w-8 h-8 text-red-400" />;
      case 'HOLD_REMOVED':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'FINE_CHARGED':
        return <DollarSign className="w-8 h-8 text-red-400" />;
      case 'FINE_PAID':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'ADMIN_MESSAGE':
        return <Info className="w-8 h-8 text-purple-400" />;
      default:
        return <Bell className="w-8 h-8 text-gray-400" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification?.priority) {
      case 'urgent':
        return 'bg-red-500/10 border-red-500/50 text-red-400';
      case 'high':
        return 'bg-orange-500/10 border-orange-500/50 text-orange-400';
      case 'normal':
        return 'bg-blue-500/10 border-blue-500/50 text-blue-400';
      case 'low':
        return 'bg-gray-500/10 border-gray-500/50 text-gray-400';
      default:
        return 'bg-gray-500/10 border-gray-500/50 text-gray-400';
    }
  };

  const handleAction = () => {
    if (!notification?.payload) return;

    const payload = typeof notification.payload === 'string' 
      ? JSON.parse(notification.payload) 
      : notification.payload;

    // Navigate based on notification type
    switch (notification.type) {
      case 'LOAN_CREATED':
      case 'LOAN_RETURNED':
      case 'LOAN_RETURNED_OVERDUE':
      case 'DUE_REMINDER':
      case 'OVERDUE_WARNING':
        navigate('/my-loans');
        break;
      case 'HOLD_PLACED':
      case 'HOLD_REMOVED':
        navigate('/my-holds');
        break;
      case 'FINE_CHARGED':
      case 'FINE_PAID':
        navigate('/my-fines');
        break;
      case 'ADMIN_MESSAGE':
        // Stay on notification page
        break;
      default:
        if (payload.bookId) {
          navigate(`/books/${payload.bookId}`);
        }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="card-glass text-center max-w-md p-8">
          <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Notification Not Found</h2>
          <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const payload = notification.payload 
    ? (typeof notification.payload === 'string' ? JSON.parse(notification.payload) : notification.payload)
    : null;

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-purple-500/20 backdrop-blur-xl bg-gray-900/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 animate-float">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">Notification Details</h1>
              <p className="text-sm text-gray-400">View notification information</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-glass">
          {/* Icon and Priority Badge */}
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 bg-gray-800/50 rounded-xl">
              {getNotificationIcon()}
            </div>
            <div className={`px-3 py-1 rounded-lg border text-xs font-medium uppercase ${getPriorityColor()}`}>
              {notification.priority}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-4">
            {notification.title}
          </h2>

          {/* Message */}
          <div className="bg-gray-800/30 rounded-lg p-4 mb-6">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {notification.message}
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Received</p>
                <p className="text-gray-300">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="text-gray-300">
                  {notification.type.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Payload Details */}
          {payload && (
            <div className="bg-gray-800/30 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase">Additional Information</h3>
              <div className="space-y-2">
                {payload.bookTitle && (
                  <div className="flex items-start space-x-2">
                    <BookOpen className="w-4 h-4 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Book</p>
                      <p className="text-sm text-gray-300">{payload.bookTitle}</p>
                    </div>
                  </div>
                )}
                {payload.dueDate && (
                  <div className="flex items-start space-x-2">
                    <Calendar className="w-4 h-4 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="text-sm text-gray-300">
                        {new Date(payload.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {payload.fineAmount !== undefined && (
                  <div className="flex items-start space-x-2">
                    <DollarSign className="w-4 h-4 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Fine Amount</p>
                      <p className="text-sm text-gray-300">${payload.fineAmount.toFixed(2)}</p>
                    </div>
                  </div>
                )}
                {payload.amount !== undefined && (
                  <div className="flex items-start space-x-2">
                    <DollarSign className="w-4 h-4 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm text-gray-300">${payload.amount.toFixed(2)}</p>
                    </div>
                  </div>
                )}
                {payload.memberName && (
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Member</p>
                      <p className="text-sm text-gray-300">{payload.memberName} ({payload.memberLoginId})</p>
                    </div>
                  </div>
                )}
                {payload.holdReason && (
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Reason</p>
                      <p className="text-sm text-gray-300">{payload.holdReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Member Holds Section (for ADMIN_FINE_PAID notifications) */}
          {notification.type === 'ADMIN_FINE_PAID' && user?.accountType === 'ADMIN' && memberHolds.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <UserX className="w-5 h-5 text-orange-400" />
                <h3 className="text-sm font-semibold text-orange-400 uppercase">Active Holds on This Member</h3>
              </div>
              <div className="space-y-3">
                {memberHolds.map((hold) => (
                  <div key={hold.id} className="bg-gray-800/50 rounded-lg p-3 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-300 font-medium">{hold.reason}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Placed: {new Date(hold.placedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveHold(hold.id)}
                      disabled={removingHold === hold.id}
                      className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-50"
                    >
                      {removingHold === hold.id ? 'Removing...' : 'Remove Hold'}
                    </button>
                  </div>
                ))}
                <p className="text-xs text-gray-400 italic">
                  Since this member has paid their fine, you can remove holds from their account.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
