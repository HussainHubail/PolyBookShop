import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Shield, BookOpen, Users, Copy, Check } from 'lucide-react';

type AccountType = 'ADMIN' | 'LIBRARIAN' | 'MEMBER';

const accountTypeConfig = {
  ADMIN: {
    icon: Shield,
    color: 'text-red-400',
    bgColor: 'bg-gradient-to-br from-red-600 to-red-800',
    borderColor: 'border-red-500/30',
    title: 'Admin Login',
    description: 'System Administrator Access',
  },
  LIBRARIAN: {
    icon: BookOpen,
    color: 'text-purple-400',
    bgColor: 'bg-gradient-to-br from-purple-600 to-purple-800',
    borderColor: 'border-purple-500/30',
    title: 'Librarian Login',
    description: 'Library Staff Access',
  },
  MEMBER: {
    icon: Users,
    color: 'text-blue-400',
    bgColor: 'bg-gradient-to-br from-blue-600 to-blue-800',
    borderColor: 'border-blue-500/30',
    title: 'Member Login',
    description: 'Student & Faculty Access',
  },
};

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const accountType = (searchParams.get('type')?.toUpperCase() || 'MEMBER') as AccountType;
  const config = accountTypeConfig[accountType];
  const Icon = config.icon;

  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<'loginId' | 'password' | null>(null);

  const copyToClipboard = async (text: string, field: 'loginId' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    // Validate account type
    const type = searchParams.get('type')?.toUpperCase();
    if (!type || !['ADMIN', 'LIBRARIAN', 'MEMBER'].includes(type)) {
      navigate('/auth/login?type=member');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Attempting login with:', {
        loginId: formData.loginId,
        accountType,
      });

      const response = await api.post('/auth/login', {
        loginId: formData.loginId,
        password: formData.password,
        accountType,
      });

      console.log('✅ Login response:', response.data);

      const { user, accessToken, refreshToken } = response.data;

      console.log('📦 Extracted data:', {
        user,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
      });

      // Save auth state
      setAuth(user, accessToken, refreshToken);

      console.log('💾 Auth saved to store');

      // Redirect based on account type
      navigate('/dashboard');
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
      <div className="card w-full max-w-md animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 ${config.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-float`}>
            <Icon className={`w-10 h-10 ${config.color}`} />
          </div>
          <h2 className="text-3xl font-bold text-gradient mb-2">{config.title}</h2>
          <p className="text-gray-400">{config.description}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="loginId" className="label">
              Login ID
            </label>
            <input
              type="text"
              id="loginId"
              className="input"
              value={formData.loginId}
              onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
              required
              placeholder={
                accountType === 'ADMIN'
                  ? 'ADM-XXXXX'
                  : accountType === 'LIBRARIAN'
                  ? 'LIB-XXXXX'
                  : 'MEM-XXXXX'
              }
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <button
            onClick={() => navigate('/auth/login-selection')}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            ← Back to login selection
          </button>

          {accountType === 'MEMBER' && (
            <div className="pt-2 border-t border-purple-500/20">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/auth/member/signup')}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Sign up here
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Default Credentials Hint (Development Only) */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-xs font-semibold text-purple-400 mb-3">Development Credentials:</p>
            <div className="space-y-2">
              {accountType === 'ADMIN' && (
                <>
                  <div className="flex items-center justify-between bg-gray-800/50 p-2 rounded">
                    <div className="text-xs text-gray-400">
                      <span className="text-gray-500">ID:</span> <span className="text-white font-mono">ADM-ADMIN1</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('ADM-ADMIN1', 'loginId')}
                      className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                      title="Copy Login ID"
                    >
                      {copiedField === 'loginId' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-gray-800/50 p-2 rounded">
                    <div className="text-xs text-gray-400">
                      <span className="text-gray-500">Pass:</span> <span className="text-white font-mono">Admin@123</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('Admin@123', 'password')}
                      className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                      title="Copy Password"
                    >
                      {copiedField === 'password' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </>
              )}
              {accountType === 'LIBRARIAN' && (
                <>
                  <div className="flex items-center justify-between bg-gray-800/50 p-2 rounded">
                    <div className="text-xs text-gray-400">
                      <span className="text-gray-500">ID:</span> <span className="text-white font-mono">LIB-LIB001</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('LIB-LIB001', 'loginId')}
                      className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                      title="Copy Login ID"
                    >
                      {copiedField === 'loginId' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-gray-800/50 p-2 rounded">
                    <div className="text-xs text-gray-400">
                      <span className="text-gray-500">Pass:</span> <span className="text-white font-mono">Librarian@123</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('Librarian@123', 'password')}
                      className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                      title="Copy Password"
                    >
                      {copiedField === 'password' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
