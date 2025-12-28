import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { BookOpen, Calendar, Clock, ArrowLeft, User, Filter, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface Loan {
  id: number;
  member: {
    user: {
      username: string;
      loginId: string;
    };
  };
  bookCopy: {
    book: {
      title: string;
      author: string;
      coverImageUrl?: string;
    };
  };
  borrowDatetime: string;
  dueDatetime: string;
  returnDatetime?: string;
  status: string;
}

export default function LoansPage() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await api.get('/loans', { params });
      setLoans(response.data.loans || []);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <Clock className="w-5 h-5 text-blue-400" />;
      case 'returned':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'returned':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'overdue':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getDaysRemaining = (dueDate: string, status: string) => {
    if (status === 'returned') return 'Returned';
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)} days overdue`;
    return `${days} days left`;
  };

  const filteredLoans = loans;

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-purple-500/20 backdrop-blur-xl bg-gray-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 animate-float">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">All Loans</h1>
                <p className="text-sm text-gray-400">{filteredLoans.length} total loans</p>
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Loans</option>
                <option value="ongoing">Ongoing</option>
                <option value="overdue">Overdue</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Loans Found</h2>
            <p className="text-gray-400">No loans match the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLoans.map((loan) => (
              <div key={loan.id} className="card-glass p-6 hover:border-purple-500/50 transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Book Cover */}
                  <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                    {loan.bookCopy.book.coverImageUrl ? (
                      <img
                        src={loan.bookCopy.book.coverImageUrl}
                        alt={loan.bookCopy.book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Loan Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {loan.bookCopy.book.title}
                        </h3>
                        <p className="text-sm text-gray-400">{loan.bookCopy.book.author}</p>
                      </div>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${getStatusColor(loan.status)}`}>
                        {getStatusIcon(loan.status)}
                        <span className="text-sm font-medium capitalize">{loan.status}</span>
                      </div>
                    </div>

                    {/* Member Info */}
                    <div className="flex items-center space-x-2 mb-4 text-sm text-purple-400">
                      <User className="w-4 h-4" />
                      <span>{loan.member.user.username}</span>
                      <span className="text-gray-500">({loan.member.user.loginId})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <div>
                          <p className="text-gray-500 text-xs">Borrowed</p>
                          <p className="text-gray-300">
                            {new Date(loan.borrowDatetime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className={`w-4 h-4 ${loan.status === 'overdue' ? 'text-red-400' : 'text-green-400'}`} />
                        <div>
                          <p className="text-gray-500 text-xs">Due Date</p>
                          <p className={loan.status === 'overdue' ? 'text-red-400' : 'text-gray-300'}>
                            {new Date(loan.dueDatetime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {loan.returnDatetime && (
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <div>
                            <p className="text-gray-500 text-xs">Returned</p>
                            <p className="text-gray-300">
                              {new Date(loan.returnDatetime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 text-sm">
                        <AlertCircle className={`w-4 h-4 ${loan.status === 'overdue' ? 'text-red-400' : 'text-gray-400'}`} />
                        <div>
                          <p className="text-gray-500 text-xs">Status</p>
                          <p className={loan.status === 'overdue' ? 'text-red-400 font-medium' : 'text-gray-300'}>
                            {getDaysRemaining(loan.dueDatetime, loan.status)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
