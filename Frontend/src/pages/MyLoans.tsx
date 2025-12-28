import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { BookOpen, Calendar, Clock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Loan {
  id: number;
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

export default function MyLoans() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/loans/my-loans');
      setLoans(response.data.loans);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (loanId: number) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      const toastId = toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-white">Are you sure you want to return this book?</p>
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
        style: { background: '#1a1f2e', maxWidth: '400px' }
      });
    });

    if (!confirmed) return;
    
    const loadingToast = toast.loading('Returning book...');
    
    try {
      await api.post(`/loans/${loanId}/return`);
      toast.success('Book returned successfully!', { id: loadingToast });
      fetchLoans(); // Refresh loans
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to return book', { id: loadingToast });
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysRemaining = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

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
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">My Loans</h1>
              <p className="text-sm text-gray-400">{loans.length} active loans</p>
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
        ) : loans.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Active Loans</h2>
            <p className="text-gray-400 mb-6">You haven't borrowed any books yet.</p>
            <button
              onClick={() => navigate('/books')}
              className="btn-primary"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => {
              const daysRemaining = getDaysRemaining(loan.dueDatetime);
              const overdue = isOverdue(loan.dueDatetime);

              return (
                <div key={loan.id} className="card-glass p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Book Cover */}
                    <div className="w-24 h-32 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                      {loan.bookCopy.book.coverImageUrl ? (
                        <img
                          src={loan.bookCopy.book.coverImageUrl}
                          alt={loan.bookCopy.book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Loan Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {loan.bookCopy.book.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-4">{loan.bookCopy.book.author}</p>

                      {/* Status Badge */}
                      {loan.status === 'returned' && (
                        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm font-medium">Returned</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <Clock className={`w-4 h-4 ${overdue ? 'text-red-400' : loan.status === 'returned' ? 'text-green-400' : 'text-green-400'}`} />
                          <div>
                            <p className="text-gray-500 text-xs">Due Date</p>
                            <p className={overdue && loan.status !== 'returned' ? 'text-red-400' : 'text-gray-300'}>
                              {new Date(loan.dueDatetime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {loan.status === 'returned' && loan.returnDatetime ? (
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <div>
                              <p className="text-gray-500 text-xs">Returned On</p>
                              <p className="text-green-400 font-medium">
                                {new Date(loan.returnDatetime).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-sm">
                            <AlertCircle className={`w-4 h-4 ${overdue ? 'text-red-400' : 'text-yellow-400'}`} />
                            <div>
                              <p className="text-gray-500 text-xs">Status</p>
                              <p className={overdue ? 'text-red-400 font-medium' : 'text-gray-300'}>
                                {overdue ? 'Overdue' : `${daysRemaining} days left`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {overdue && (
                        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                          <p className="text-red-400 text-sm">
                            This book is overdue. Please return it as soon as possible to avoid fines.
                          </p>
                        </div>
                      )}

                      {/* Return Button - Only for ongoing loans */}
                      {loan.status === 'ongoing' || loan.status === 'overdue' ? (
                        <div className="mt-4">
                          <button
                            onClick={() => handleReturn(loan.id)}
                            className="btn-primary"
                          >
                            Return Book
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
