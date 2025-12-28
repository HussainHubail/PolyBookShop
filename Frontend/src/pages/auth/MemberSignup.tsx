import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

export default function MemberSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedLoginId, setGeneratedLoginId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/member/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        department: formData.department,
      });

      console.log('Signup response:', response.data);
      setGeneratedLoginId(response.data.data.loginId);
      setShowSuccess(true);
    } catch (err: any) {
      console.error('Signup error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
        <div className="card-glass w-full max-w-lg text-center animate-fadeIn">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Registration Successful!</h2>
            <p className="text-gray-400 mb-6">
              Your account has been created successfully.
            </p>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-400 mb-3">Your Member Login ID:</p>
            <p className="text-3xl font-bold text-purple-400 mb-3 font-mono">{generatedLoginId}</p>
            <p className="text-sm text-yellow-400 mb-2">⚠️ Important: Save this ID!</p>
            <p className="text-xs text-gray-500">
              You will need this Login ID along with your password to access your account.
            </p>
          </div>

          <button
            onClick={() => navigate('/auth/member/login')}
            className="btn-primary w-full"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-8">
      <div className="card w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gradient mb-2">Join PolyBookShop</h2>
          <p className="text-gray-400">Create your member account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="label">
              Full Name *
            </label>
            <input
              type="text"
              id="username"
              className="input"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              minLength={3}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="label">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="john.doe@university.edu"
            />
          </div>

          <div>
            <label htmlFor="department" className="label">
              Department
            </label>
            <input
              type="text"
              id="department"
              className="input"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Computer Science"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password *
            </label>
            <input
              type="password"
              id="password"
              className="input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="input"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              minLength={8}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <div className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/auth/member/login')}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Login here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
