import { BookOpen, ArrowRight, Users, BookMarked, Clock, Download, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginSelection() {
  const navigate = useNavigate();

  const features = [
    { icon: BookMarked, text: 'Variety of Books Available', color: 'text-blue-400' },
    { icon: Clock, text: '24/7 Online Access', color: 'text-purple-400' },
    { icon: Download, text: 'Digital Downloads', color: 'text-green-400' },
    { icon: Users, text: 'Community Driven', color: 'text-orange-400' },
  ];

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="max-w-6xl w-full">
        {/* Animated Header */}
        <div className="text-center mb-16 animate-fadeIn">
          {/* Floating Books Animation */}
          <div className="relative h-32 mb-8">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                {/* Center Book */}
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-float">
                  <BookOpen className="w-10 h-10 text-purple-400" />
                </div>
                
                {/* Orbiting Books */}
                <div className="absolute -top-8 -left-8 w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg animate-orbit-1">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <div className="absolute -top-8 -right-8 w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg animate-orbit-2">
                  <BookOpen className="w-6 h-6 text-red-400" />
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center shadow-lg animate-orbit-3">
                  <BookOpen className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-bold text-gradient mb-8 animate-slideInRight" style={{ animationDelay: '100ms' }}>
            PolyBookShop
          </h1>
          
          {/* Description */}
          <div className="max-w-3xl mx-auto mb-8 animate-fadeIn" style={{ animationDelay: '300ms' }}>
            <p className="text-lg text-gray-400 leading-relaxed mb-4">
              Discover a world of knowledge at your fingertips. PolyBookShop offers a comprehensive digital library experience 
              with thousands of books, seamless borrowing, and instant access to online resources.
            </p>
            <p className="text-md text-gray-500">
              Join our community of readers, researchers, and lifelong learners.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12 animate-slideInRight" style={{ animationDelay: '400ms' }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="card-glass p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300"
                  style={{ animationDelay: `${500 + index * 100}ms` }}
                >
                  <Icon className={`w-8 h-8 ${feature.color}`} />
                  <p className="text-sm text-gray-300 text-center">{feature.text}</p>
                </div>
              );
            })}
          </div>

          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-md mx-auto space-y-4 animate-slideInRight" style={{ animationDelay: '600ms' }}>
          {/* Login Button */}
          <button
            onClick={() => navigate('/auth/member/login')}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl px-8 py-5 text-white font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-white/20 to-purple-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <div className="relative flex items-center justify-center gap-3">
              <span>Login to Your Account</span>
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Sign Up Button */}
          <button
            onClick={() => navigate('/auth/member/signup')}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 border border-purple-500/30 hover:border-purple-500/50 rounded-xl px-8 py-5 text-white font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-500/10 to-purple-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <div className="relative flex items-center justify-center gap-3">
              <Users className="w-5 h-5" />
              <span>Create New Account</span>
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-700"></div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Staff Access</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-700"></div>
          </div>

          {/* Staff Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/auth/admin/login')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 group"
            >
              <Shield className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-red-400">Admin</span>
            </button>
            <button
              onClick={() => navigate('/auth/librarian/login')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 hover:border-purple-500/50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 group"
            >
              <BookOpen className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-purple-400">Librarian</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-sm animate-fadeIn" style={{ animationDelay: '700ms' }}>
          <p className="mb-2">Empowering minds through accessible knowledge</p>
          <p className="text-xs">Secure authentication powered by JWT</p>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}
