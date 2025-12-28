import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

// Pages
import LoginSelection from '@/pages/auth/LoginSelection';
import MemberSignup from '@/pages/auth/MemberSignup';
import Login from '@/pages/auth/Login';
import AdminLogin from '@/pages/auth/AdminLogin';
import LibrarianLogin from '@/pages/auth/LibrarianLogin';
import MemberLogin from '@/pages/auth/MemberLogin';
import Dashboard from '@/pages/Dashboard';
import BooksPage from '@/pages/BooksPage';
import BookDetailsPage from '@/pages/BookDetailsPage';
import MyLoans from '@/pages/MyLoans';
import MyHoldsPage from '@/pages/MyHoldsPage';
import MyFinesPage from '@/pages/MyFinesPage';
import OnlineBooksPage from '@/pages/OnlineBooksPage';
import NotificationDetailsPage from '@/pages/NotificationDetailsPage';
import LoansPage from '@/pages/LoansPage';
import MembersPage from '@/pages/MembersPage';
import MemberDetailsPage from '@/pages/MemberDetailsPage';
import ReportsPage from '@/pages/ReportsPage';
import AccountPage from '@/pages/settings/AccountPage';
import PreferencesPage from '@/pages/settings/PreferencesPage';

// Protected Route Component
function ProtectedRoute({ children, allowedTypes }: { children: React.ReactNode; allowedTypes?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  // Wait for auth to load from storage
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedTypes && user && !allowedTypes.includes(user.accountType)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  const loadAuthFromStorage = useAuthStore((state) => state.loadAuthFromStorage);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    loadAuthFromStorage();
  }, [loadAuthFromStorage]);

  // Apply theme class to document root
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove('theme-dark', 'theme-midnight', 'theme-light');
    
    // Add the current theme class
    if (theme === 'midnight') {
      document.documentElement.classList.add('theme-midnight');
    } else if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.add('theme-dark');
    }
  }, [theme]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/auth/login-selection" replace />} />
      <Route path="/auth/login-selection" element={<LoginSelection />} />
      <Route path="/auth/member/signup" element={<MemberSignup />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/admin/login" element={<AdminLogin />} />
      <Route path="/auth/librarian/login" element={<LibrarianLogin />} />
      <Route path="/auth/member/login" element={<MemberLogin />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/books"
        element={
          <ProtectedRoute>
            <BooksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/books/:id"
        element={
          <ProtectedRoute>
            <BookDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-loans"
        element={
          <ProtectedRoute allowedTypes={['MEMBER']}>
            <MyLoans />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-holds"
        element={
          <ProtectedRoute allowedTypes={['MEMBER']}>
            <MyHoldsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-fines"
        element={
          <ProtectedRoute allowedTypes={['MEMBER']}>
            <MyFinesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/online-books"
        element={
          <ProtectedRoute>
            <OnlineBooksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications/:id"
        element={
          <ProtectedRoute>
            <NotificationDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loans"
        element={
          <ProtectedRoute allowedTypes={['ADMIN']}>
            <LoansPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/members"
        element={
          <ProtectedRoute allowedTypes={['ADMIN']}>
            <MembersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/members/:id"
        element={
          <ProtectedRoute allowedTypes={['ADMIN']}>
            <MemberDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedTypes={['ADMIN']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/account"
        element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/preferences"
        element={
          <ProtectedRoute>
            <PreferencesPage />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">404 - Page Not Found</h1></div>} />
    </Routes>
  );
}

export default App;
