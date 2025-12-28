import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { BookOpen, Copy, Check, ArrowLeft } from 'lucide-react';

export default function LibrarianLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        loginId: formData.loginId,
        password: formData.password,
        accountType: 'LIBRARIAN',
      });

      const { user, accessToken, refreshToken } = response.data;

      // Save auth state
      setAuth(user, accessToken, refreshToken);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
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
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50 animate-float">
            <BookOpen className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-gradient mb-2">Librarian Login</h2>
          <p className="text-gray-400">Library Staff Access</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 animate-shake">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="loginId" className="label">
              Librarian ID
            </label>
            <input
              type="text"
              id="loginId"
              className="input"
              value={formData.loginId}
              onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
              required
              placeholder="LIB-XXXXX"
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
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              'Login as Librarian'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/auth/login-selection')}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors inline-flex items-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to login selection
          </button>
        </div>

        {/* Default Credentials Hint (Development Only) */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-xs font-semibold text-purple-400 mb-3">Development Credentials:</p>
            <div className="space-y-2">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
