import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { 
  Home, BookOpen, FileText, Users, TrendingUp, 
  Settings, User, LogOut, ChevronLeft, ChevronRight,
  Download, AlertCircle, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();

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

  const memberMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Browse Books', path: '/books' },
    { icon: Download, label: 'Online Books', path: '/online-books' },
    { icon: FileText, label: 'My Loans', path: '/my-loans' },
    { icon: AlertCircle, label: 'My Holds', path: '/my-holds' },
    { icon: DollarSign, label: 'My Fines', path: '/my-fines' },
  ];

  const adminMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Books', path: '/books' },
    { icon: Download, label: 'Online Books', path: '/online-books' },
    { icon: FileText, label: 'Loans', path: '/loans' },
    { icon: Users, label: 'Members', path: '/members' },
    { icon: TrendingUp, label: 'Reports', path: '/reports' },
  ];

  const librarianMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Books', path: '/books' },
    { icon: Download, label: 'Online Books', path: '/online-books' },
    { icon: FileText, label: 'Loans', path: '/loans' },
  ];

  const menuItems = user?.accountType === 'MEMBER' 
    ? memberMenuItems 
    : user?.accountType === 'ADMIN' 
    ? adminMenuItems 
    : librarianMenuItems;

  const settingsItems = [
    { icon: User, label: 'Manage Account', path: '/settings/account' },
    { icon: Settings, label: 'Settings', path: '/settings/preferences' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-gray-900/95 backdrop-blur-xl border-r border-purple-500/20 
        transition-all duration-300 z-50 flex flex-col
        ${isOpen ? 'w-64' : 'w-0 lg:w-20'}
      `}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-6 w-6 h-6 bg-purple-600 hover:bg-purple-700 rounded-full 
                     hidden lg:flex items-center justify-center transition-colors shadow-lg"
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4 text-white" />
          ) : (
            <ChevronRight className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Header */}
        <div className="p-4 border-b border-purple-500/20">
          <div className={`flex items-center gap-3 ${!isOpen && 'lg:justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl 
                          flex items-center justify-center shadow-lg shadow-purple-500/50 animate-float">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            {isOpen && (
              <div>
                <h1 className="font-bold text-white text-lg">PolyBookShop</h1>
                <p className="text-xs text-gray-400">{user?.accountType}</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-purple-500/20">
          <div className={`flex items-center gap-3 ${!isOpen && 'lg:justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full 
                          flex items-center justify-center text-white font-semibold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{user?.username}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' 
                      : 'text-gray-400 hover:bg-purple-500/10 hover:text-white'
                    }
                    ${!isOpen && 'lg:justify-center'}
                  `}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Settings Section */}
          <div className="mt-6 pt-6 border-t border-purple-500/20">
            <div className="space-y-1 px-2">
              {settingsItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${isActive 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' 
                        : 'text-gray-400 hover:bg-purple-500/10 hover:text-white'
                      }
                      ${!isOpen && 'lg:justify-center'}
                    `}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-purple-500/20">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all
              ${!isOpen && 'lg:justify-center'}
            `}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content spacer */}
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-64' : 'lg:ml-20'}`} />
    </>
  );
}
