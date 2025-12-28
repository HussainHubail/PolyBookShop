import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { 
  TrendingUp, 
  ArrowLeft, 
  BookOpen, 
  Users, 
  DollarSign, 
  AlertCircle, 
  BarChart3,
  TrendingDown,
  Award,
  Calendar,
  X,
  Info,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Analytics {
  mostBorrowedBooks: Array<{
    bookTitle: string;
    author: string;
    category: string;
    coverImageUrl?: string;
    borrowCount: number;
  }>;
  loanStatistics: {
    totalActiveLoans: number;
    overdueLoans: number;
    overduePercentage: string;
  };
  categoryDistribution: Array<{
    category: string;
    count: number;
  }>;
  financialData: {
    totalRevenue: number;
    unpaidFines: number;
  };
  monthlyTrends: Array<{
    month: string;
    loans: number;
  }>;
  memberStatistics: {
    totalMembers: number;
    activeMembers: number;
    inactiveMembers: number;
  };
  topBorrowers: Array<{
    memberName: string;
    loginId: string;
    totalLoans: number;
  }>;
  bookStatistics: {
    totalBooks: number;
    totalCopies: number;
    availableCopies: number;
    borrowedCopies: number;
  };
}

type ModalType = 'book' | 'borrower' | 'category' | 'month' | 'books' | 'members' | 'revenue' | 'overdue' | null;

interface ModalData {
  type: ModalType;
  title: string;
  data: any;
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/analytics');
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: ModalType, title: string, data: any) => {
    setModalData({ type, title, data });
  };

  const closeModal = () => {
    setModalData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="card text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Analytics</h2>
          <p className="text-gray-400 mb-4">Unable to fetch analytics data</p>
          <button onClick={fetchAnalytics} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-purple-500/20 backdrop-blur-xl bg-gray-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 animate-float">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">Analytics & Reports</h1>
              <p className="text-sm text-gray-400">Library insights and statistics - Click any card for details</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => openModal('books', 'Book Statistics', analytics.bookStatistics)}
            className="card bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30 hover:border-purple-500 transition-all hover:scale-105 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-purple-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm text-gray-400 mb-1">Total Books</p>
            <p className="text-3xl font-bold text-white">{analytics.bookStatistics.totalBooks}</p>
            <p className="text-xs text-gray-500 mt-2">{analytics.bookStatistics.totalCopies} total copies</p>
            <p className="text-xs text-purple-400 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" /> Click for details
            </p>
          </button>

          <button
            onClick={() => openModal('members', 'Member Statistics', analytics.memberStatistics)}
            className="card bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30 hover:border-blue-500 transition-all hover:scale-105 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm text-gray-400 mb-1">Active Members</p>
            <p className="text-3xl font-bold text-white">{analytics.memberStatistics.activeMembers}</p>
            <p className="text-xs text-gray-500 mt-2">of {analytics.memberStatistics.totalMembers} total</p>
            <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" /> Click for details
            </p>
          </button>

          <button
            onClick={() => openModal('revenue', 'Financial Data', analytics.financialData)}
            className="card bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30 hover:border-green-500 transition-all hover:scale-105 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm text-gray-400 mb-1">Fine Revenue</p>
            <p className="text-3xl font-bold text-white">${analytics.financialData.totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">${analytics.financialData.unpaidFines.toFixed(2)} unpaid</p>
            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" /> Click for details
            </p>
          </button>

          <button
            onClick={() => openModal('overdue', 'Overdue Loans', analytics.loanStatistics)}
            className={`card bg-gradient-to-br ${
              parseFloat(analytics.loanStatistics.overduePercentage) > 20 
                ? 'from-red-600/20 to-red-800/20 border-red-500/30 hover:border-red-500' 
                : 'from-orange-600/20 to-orange-800/20 border-orange-500/30 hover:border-orange-500'
            } transition-all hover:scale-105 cursor-pointer text-left`}
          >
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className={`w-8 h-8 ${
                parseFloat(analytics.loanStatistics.overduePercentage) > 20 ? 'text-red-400' : 'text-orange-400'
              }`} />
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-sm text-gray-400 mb-1">Overdue Loans</p>
            <p className="text-3xl font-bold text-white">{analytics.loanStatistics.overdueLoans}</p>
            <p className="text-xs text-gray-500 mt-2">{analytics.loanStatistics.overduePercentage}% of active</p>
            <p className={`text-xs mt-1 flex items-center gap-1 ${parseFloat(analytics.loanStatistics.overduePercentage) > 20 ? 'text-red-400' : 'text-orange-400'}`}>
              <Info className="w-3 h-3" /> Click for details
            </p>
          </button>
        </div>

        {/* Most Borrowed Books */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-400" />
            Most Borrowed Books
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.mostBorrowedBooks.slice(0, 6).map((book, index) => (
              <button
                key={index}
                onClick={() => openModal('book', 'Book Details', book)}
                className="bg-gray-800/50 border border-purple-500/20 hover:border-purple-500/50 rounded-lg p-4 flex items-center gap-4 transition-all hover:scale-102 cursor-pointer text-left"
              >
                <div className="w-12 h-16 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                  {book.coverImageUrl ? (
                    <img src={book.coverImageUrl} alt={book.bookTitle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-yellow-400">#{index + 1}</span>
                    <h3 className="text-sm font-semibold text-white truncate">{book.bookTitle}</h3>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{book.author}</p>
                  <p className="text-xs text-purple-400">{book.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-400">{book.borrowCount}</p>
                  <p className="text-xs text-gray-500">borrows</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Borrowers */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              Top Borrowers
            </h2>
            <div className="space-y-3">
              {analytics.topBorrowers.slice(0, 5).map((borrower, index) => (
                <button
                  key={index}
                  onClick={() => openModal('borrower', 'Borrower Details', borrower)}
                  className="w-full flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-blue-500/20 hover:border-blue-500/50 transition-all hover:scale-102 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-400">#{index + 1}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">{borrower.memberName}</p>
                      <p className="text-xs text-gray-400">{borrower.loginId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-400">{borrower.totalLoans}</p>
                    <p className="text-xs text-gray-500">loans</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              Category Distribution
            </h2>
            <div className="space-y-3">
              {analytics.categoryDistribution.slice(0, 8).map((category, index) => {
                const maxCount = Math.max(...analytics.categoryDistribution.map(c => c.count));
                const percentage = (category.count / maxCount) * 100;
                return (
                  <button
                    key={index}
                    onClick={() => openModal('category', `${category.category} Category`, category)}
                    className="w-full text-left hover:bg-gray-800/30 rounded-lg p-2 transition-all"
                  >
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{category.category}</span>
                      <span className="text-purple-400 font-semibold">{category.count} books</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-400" />
            Monthly Loan Trends
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {analytics.monthlyTrends.map((trend, index) => (
              <button
                key={index}
                onClick={() => openModal('month', `${trend.month} Statistics`, trend)}
                className="bg-gray-800/50 border border-green-500/20 hover:border-green-500/50 rounded-lg p-4 text-center transition-all hover:scale-105 cursor-pointer"
              >
                <p className="text-xs text-gray-400 mb-2">{trend.month}</p>
                <p className="text-2xl font-bold text-green-400">{trend.loans}</p>
                <p className="text-xs text-gray-500 mt-1">loans</p>
              </button>
            ))}
          </div>
        </div>

        {/* Book Availability */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-green-600/10 to-green-800/10 border-green-500/30">
            <p className="text-sm text-gray-400 mb-2">Available Copies</p>
            <p className="text-4xl font-bold text-green-400">{analytics.bookStatistics.availableCopies}</p>
            <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-600 to-green-400"
                style={{ width: `${(analytics.bookStatistics.availableCopies / analytics.bookStatistics.totalCopies) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {((analytics.bookStatistics.availableCopies / analytics.bookStatistics.totalCopies) * 100).toFixed(1)}% available
            </p>
          </div>

          <div className="card bg-gradient-to-br from-orange-600/10 to-orange-800/10 border-orange-500/30">
            <p className="text-sm text-gray-400 mb-2">Borrowed Copies</p>
            <p className="text-4xl font-bold text-orange-400">{analytics.bookStatistics.borrowedCopies}</p>
            <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-600 to-orange-400"
                style={{ width: `${(analytics.bookStatistics.borrowedCopies / analytics.bookStatistics.totalCopies) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {((analytics.bookStatistics.borrowedCopies / analytics.bookStatistics.totalCopies) * 100).toFixed(1)}% in use
            </p>
          </div>

          <div className="card bg-gradient-to-br from-purple-600/10 to-purple-800/10 border-purple-500/30">
            <p className="text-sm text-gray-400 mb-2">Total Copies</p>
            <p className="text-4xl font-bold text-purple-400">{analytics.bookStatistics.totalCopies}</p>
            <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400" style={{ width: '100%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">100% of collection</p>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modalData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-gray-900 border border-purple-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-purple-500/20 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gradient">{modalData.title}</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalData.type === 'book' && (
                <div>
                  <div className="flex gap-6 mb-6">
                    <div className="w-32 h-44 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                      {modalData.data.coverImageUrl ? (
                        <img src={modalData.data.coverImageUrl} alt={modalData.data.bookTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">{modalData.data.bookTitle}</h3>
                      <p className="text-gray-400 mb-4">{modalData.data.author}</p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-purple-400" />
                          <span className="text-gray-300">Category: <span className="text-purple-400">{modalData.data.category}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                          <span className="text-gray-300">Total Borrows: <span className="text-green-400 font-bold">{modalData.data.borrowCount}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-yellow-400" />
                          <span className="text-gray-300">Popularity Rank: <span className="text-yellow-400">Top Book</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <p className="text-sm text-gray-400">
                      This book is one of the most popular items in the library with <span className="text-purple-400 font-semibold">{modalData.data.borrowCount} total borrows</span>.
                    </p>
                  </div>
                </div>
              )}

              {modalData.type === 'borrower' && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{modalData.data.memberName}</h3>
                      <p className="text-gray-400 font-mono">{modalData.data.loginId}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Total Loans</span>
                        <span className="text-3xl font-bold text-blue-400">{modalData.data.totalLoans}</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-5 h-5 text-purple-400" />
                        <h4 className="font-semibold text-white">Member Status</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">Active Member</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-300">Top Borrower</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalData.type === 'category' && (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mb-4">
                      <BarChart3 className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{modalData.data.category}</h3>
                    <p className="text-gray-400">Book Category</p>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-400 mb-2">Total Books in Category</p>
                      <p className="text-5xl font-bold text-purple-400 mb-2">{modalData.data.count}</p>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2">
                        This category represents <span className="text-purple-400 font-semibold">
                        {((modalData.data.count / analytics.bookStatistics.totalBooks) * 100).toFixed(1)}%
                        </span> of the library's total collection.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {modalData.type === 'month' && (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-600 to-green-800 rounded-2xl flex items-center justify-center mb-4">
                      <Calendar className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{modalData.data.month}</h3>
                    <p className="text-gray-400">Monthly Statistics</p>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-400 mb-2">Total Loans</p>
                      <p className="text-5xl font-bold text-green-400 mb-2">{modalData.data.loans}</p>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-600 to-green-400" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-green-400" />
                        <h4 className="font-semibold text-white">Period Information</h4>
                      </div>
                      <p className="text-sm text-gray-400">
                        During {modalData.data.month}, the library processed <span className="text-green-400 font-semibold">{modalData.data.loans} loan transactions</span>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {modalData.type === 'books' && (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
                      <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 mb-1">Total Books</p>
                      <p className="text-3xl font-bold text-white">{modalData.data.totalBooks}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                      <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 mb-1">Total Copies</p>
                      <p className="text-3xl font-bold text-white">{modalData.data.totalCopies}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 mb-1">Available</p>
                      <p className="text-3xl font-bold text-white">{modalData.data.availableCopies}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
                      <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 mb-1">Borrowed</p>
                      <p className="text-3xl font-bold text-white">{modalData.data.borrowedCopies}</p>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">Collection Overview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Availability Rate:</span>
                        <span className="text-green-400 font-semibold">
                          {((modalData.data.availableCopies / modalData.data.totalCopies) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Utilization Rate:</span>
                        <span className="text-orange-400 font-semibold">
                          {((modalData.data.borrowedCopies / modalData.data.totalCopies) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Copies per Book:</span>
                        <span className="text-purple-400 font-semibold">
                          {(modalData.data.totalCopies / modalData.data.totalBooks).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalData.type === 'members' && (
                <div>
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 text-center">
                      <Users className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-400 mb-1">Total Members</p>
                      <p className="text-4xl font-bold text-white mb-2">{modalData.data.totalMembers}</p>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                        <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 mb-1">Active</p>
                        <p className="text-2xl font-bold text-white">{modalData.data.activeMembers}</p>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 mb-1">Inactive</p>
                        <p className="text-2xl font-bold text-white">{modalData.data.inactiveMembers}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">Membership Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Active Rate:</span>
                        <span className="text-green-400 font-semibold">
                          {((modalData.data.activeMembers / modalData.data.totalMembers) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Inactive Rate:</span>
                        <span className="text-red-400 font-semibold">
                          {((modalData.data.inactiveMembers / modalData.data.totalMembers) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalData.type === 'revenue' && (
                <div>
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
                      <DollarSign className="w-10 h-10 text-green-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-400 mb-1">Total Revenue (Paid Fines)</p>
                      <p className="text-4xl font-bold text-white mb-2">${modalData.data.totalRevenue.toFixed(2)}</p>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-600 to-green-400" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6 text-center">
                      <AlertCircle className="w-10 h-10 text-orange-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-400 mb-1">Unpaid Fines</p>
                      <p className="text-4xl font-bold text-white mb-2">${modalData.data.unpaidFines.toFixed(2)}</p>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">Financial Overview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Fines Generated:</span>
                        <span className="text-purple-400 font-semibold">
                          ${(modalData.data.totalRevenue + modalData.data.unpaidFines).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Collection Rate:</span>
                        <span className="text-green-400 font-semibold">
                          {((modalData.data.totalRevenue / (modalData.data.totalRevenue + modalData.data.unpaidFines)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Outstanding:</span>
                        <span className="text-orange-400 font-semibold">
                          {((modalData.data.unpaidFines / (modalData.data.totalRevenue + modalData.data.unpaidFines)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalData.type === 'overdue' && (
                <div>
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
                      <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-400 mb-1">Overdue Loans</p>
                      <p className="text-4xl font-bold text-white mb-2">{modalData.data.overdueLoans}</p>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-600 to-red-400" 
                          style={{ width: `${modalData.data.overduePercentage}%` }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                        <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 mb-1">Total Active</p>
                        <p className="text-2xl font-bold text-white">{modalData.data.totalActiveLoans}</p>
                      </div>
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
                        <TrendingDown className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 mb-1">Overdue %</p>
                        <p className="text-2xl font-bold text-white">{modalData.data.overduePercentage}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">Loan Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">On-Time Loans:</span>
                        <span className="text-green-400 font-semibold">
                          {modalData.data.totalActiveLoans - modalData.data.overdueLoans} ({(100 - parseFloat(modalData.data.overduePercentage)).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Overdue Loans:</span>
                        <span className="text-red-400 font-semibold">
                          {modalData.data.overdueLoans} ({modalData.data.overduePercentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  {parseFloat(modalData.data.overduePercentage) > 20 && (
                    <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-400 mb-1">High Overdue Rate Alert</p>
                          <p className="text-xs text-gray-400">
                            The overdue rate exceeds 20%. Consider sending reminders to members or reviewing lending policies.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
