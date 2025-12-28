import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Calendar, FileText, X, CheckCircle } from 'lucide-react';
import api from '../lib/api';

interface Hold {
  id: number;
  reason: string;
  placedAt: string;
  removedAt: string | null;
  status: string;
  notes: string | null;
  loan: {
    id: number;
    dueDatetime: string;
    bookCopy: {
      book: {
        title: string;
        author: string;
      };
    };
  } | null;
}

export default function MyHoldsPage() {
  const navigate = useNavigate();
  const [holds, setHolds] = useState<Hold[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActive, setShowActive] = useState(true);

  useEffect(() => {
    fetchHolds();
  }, [showActive]);

  const fetchHolds = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/holds/my-holds?activeOnly=${showActive}`);
      setHolds(response.data.holds);
    } catch (error: any) {
      console.error('Failed to fetch holds:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'removed':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen gradient-bg py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  My Account Holds
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  View holds placed on your account
                </p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-t border-purple-500/20 pt-4">
            <button
              onClick={() => setShowActive(true)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showActive
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
              }`}
            >
              Active Holds
            </button>
            <button
              onClick={() => setShowActive(false)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !showActive
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
              }`}
            >
              All Holds
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* No Holds */}
        {!loading && holds.length === 0 && (
          <div className="card text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {showActive ? 'No Active Holds' : 'No Holds Found'}
            </h3>
            <p className="text-gray-400">
              {showActive
                ? 'Your account has no active holds. You can borrow books freely!'
                : 'No holds have been placed on your account.'}
            </p>
          </div>
        )}

        {/* Holds List */}
        {!loading && holds.length > 0 && (
          <div className="space-y-4">
            {holds.map((hold) => (
              <div
                key={hold.id}
                className="card hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg ${hold.status === 'active' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                      {hold.status === 'active' ? (
                        <X className={`w-6 h-6 ${hold.status === 'active' ? 'text-red-400' : 'text-green-400'}`} />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            hold.status
                          )}`}
                        >
                          {hold.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {hold.reason}
                      </h3>
                      {hold.loan && (
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Book: {hold.loan.bookCopy.book.title} by {hold.loan.bookCopy.book.author}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-purple-500/20">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">Placed:</span>
                    <span className="text-white">{formatDate(hold.placedAt)}</span>
                  </div>
                  {hold.removedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400">Removed:</span>
                      <span className="text-white">{formatDate(hold.removedAt)}</span>
                    </div>
                  )}
                </div>

                {hold.notes && (
                  <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-white">Notes:</span> {hold.notes}
                    </p>
                  </div>
                )}

                {hold.status === 'active' && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-400">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      This hold prevents you from borrowing new books. Please resolve the issue or contact the library.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
