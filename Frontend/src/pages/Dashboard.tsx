import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { BookOpen, Users, FileText, LogOut, Home, TrendingUp, Clock, CheckCircle, AlertCircle, DollarSign, Download, Settings, User } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

interface DashboardStats {
  totalBooks: number;
  activeMembers: number;
  activeLoans: number;
  completedLoans: number;
  totalUnpaidFines?: number;
  activeHolds?: number;
}

interface MemberStats {
  activeLoans: number;
  totalBorrowed: number;
  unpaidFines: number;
  activeHolds: number;
  maxBorrowedBooks: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    activeMembers: 0,
    activeLoans: 0,
    completedLoans: 0,
  });
  const [memberStats, setMemberStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const dashboardResponse = await api.get('/stats/dashboard');
      setStats(dashboardResponse.data.stats);
      
      if (user?.accountType === 'MEMBER') {
        const memberResponse = await api.get('/stats/member');
        setMemberStats(memberResponse.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await new Promise<boolean>((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-white">Are you sure you want to logout?</p>
          <p className="text-sm text-gray-400">You will need to login again to access your account.</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Logout
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
        style: { background: '#1a1f2e', maxWidth: '400px' }
      });
    });

    if (!confirmed) return;

    clearAuth();
    toast.success('Logged out successfully');
    navigate('/auth/login-selection');
  };

  if (!user) {
    return null;
  }

  const displayStats = user.accountType === 'MEMBER' && memberStats
    ? [
        { label: 'Active Loans', value: memberStats.activeLoans.toString(), icon: FileText, color: 'from-green-600 to-green-800', iconColor: 'text-green-400' },
        { label: 'Total Borrowed', value: memberStats.totalBorrowed.toString(), icon: BookOpen, color: 'from-purple-600 to-purple-800', iconColor: 'text-purple-400' },
        { label: 'Unpaid Fines', value: `$${memberStats.unpaidFines.toFixed(2)}`, icon: DollarSign, color: 'from-red-600 to-red-800', iconColor: 'text-red-400' },
        { label: 'Active Holds', value: memberStats.activeHolds.toString(), icon: AlertCircle, color: 'from-orange-600 to-orange-800', iconColor: 'text-orange-400' },
      ]
    : [
        { label: 'Total Books', value: stats.totalBooks.toString(), icon: BookOpen, color: 'from-purple-600 to-purple-800', iconColor: 'text-purple-400' },
        { label: 'Active Members', value: stats.activeMembers.toString(), icon: Users, color: 'from-blue-600 to-blue-800', iconColor: 'text-blue-400' },
        { label: 'Active Loans', value: stats.activeLoans.toString(), icon: FileText, color: 'from-green-600 to-green-800', iconColor: 'text-green-400' },
        { label: 'Completed', value: stats.completedLoans.toString(), icon: CheckCircle, color: 'from-amber-600 to-amber-800', iconColor: 'text-amber-400' },
      ];

  const quickActions = user.accountType === 'ADMIN'
    ? [
        { icon: Users, label: 'Manage Members', description: 'View and manage all members', path: '/members', available: true },
        { icon: FileText, label: 'View Loans', description: 'Track all book loans', path: '/loans', available: true },
        { icon: TrendingUp, label: 'View Reports', description: 'Analytics and insights', path: '/reports', available: true },
      ]
    : user.accountType === 'LIBRARIAN'
    ? [
        { icon: BookOpen, label: 'Manage Books', description: 'Add, edit, or remove books', path: '/books', available: true },
        { icon: Download, label: 'Online Books', description: 'Manage downloadable PDF books', path: '/online-books', available: true },
      ]
    : [
        { icon: BookOpen, label: 'Browse Books', description: 'Explore available books', path: '/books', available: true },
        { icon: Download, label: 'Online Books', description: 'Download PDF books', path: '/online-books', available: true },
        { icon: FileText, label: 'My Loans', description: 'View your borrowed books', path: '/my-loans', available: true },
        { icon: AlertCircle, label: 'My Holds', description: 'View account holds', path: '/my-holds', available: true },
        { icon: DollarSign, label: 'My Fines', description: 'View and pay fines', path: '/my-fines', available: true },
      ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-purple-500/20 backdrop-blur-xl bg-gray-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 animate-float">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">PolyBookShop</h1>
              <p className="text-sm text-gray-400">{user.accountType} Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={() => navigate('/settings/preferences')}
              className="btn-ghost flex items-center space-x-2"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden md:inline">Settings</span>
            </button>
            <button
              onClick={() => navigate('/settings/account')}
              className="btn-ghost flex items-center space-x-2"
              title="Manage Account"
            >
              <User className="w-5 h-5" />
              <span className="hidden md:inline">Account</span>
            </button>
            <button
              onClick={handleLogout}
              className="btn-ghost flex items-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="card mb-8 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user.username}!
              </h2>
              <p className="text-gray-400">Login ID: <span className="text-purple-400 font-mono">{user.loginId}</span></p>
              <p className="text-sm text-gray-500">Email: {user.email}</p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Users className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="card animate-slideInRight"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-4xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className={`w-8 h-8 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${stat.color} w-0 transition-all duration-1000`}></div>
                </div>
              </div>
            );
          }))}
        </div>

        {/* Quick Actions */}
        <div className="card animate-fadeIn" style={{ animationDelay: '400ms' }}>
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            Quick Actions
          </h3>
          <div className={`grid grid-cols-1 md:grid-cols-2 ${user.accountType === 'ADMIN' ? 'lg:grid-cols-3' : user.accountType === 'LIBRARIAN' ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-4`}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => action.available ? navigate(action.path) : toast.info('Coming soon! This feature is under development.')}
                  className={`group relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 border border-purple-500/30 p-6 rounded-xl transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 active:scale-95 ${!action.available ? 'opacity-60' : ''}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-purple-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <div className="relative z-10">
                    <Icon className="w-8 h-8 text-purple-400 mb-3 transition-transform duration-300 group-hover:scale-110" />
                    <h4 className="font-semibold text-white mb-1">{action.label}</h4>
                    <p className="text-sm text-gray-400">{action.description}</p>
                    {!action.available && (
                      <span className="text-xs text-purple-400 mt-2 block">Coming Soon</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
