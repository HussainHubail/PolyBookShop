import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ArrowLeft, Calendar, FileText, AlertTriangle, CheckCircle, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface Fine {
  id: number;
  amount: string;
  currency: string;
  reason: string;
  chargedAt: string;
  paidAt: string | null;
  paidAmount: string | null;
  status: string;
  notes: string | null;
  loan: {
    bookCopy: {
      book: {
        title: string;
        author: string;
      };
    };
  } | null;
}

export default function MyFinesPage() {
  const navigate = useNavigate();
  const [fines, setFines] = useState<Fine[]>([]);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showUnpaid, setShowUnpaid] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState<{ [key: number]: string }>({});
  const [paying, setPaying] = useState<number | null>(null);

  useEffect(() => {
    fetchFines();
  }, [showUnpaid]);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/fines/my-fines?unpaidOnly=${showUnpaid}`);
      setFines(response.data.fines);
      setTotalUnpaid(response.data.totalUnpaid);
    } catch (error: any) {
      console.error('Failed to fetch fines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async (fineId: number) => {
    const amount = parseFloat(paymentAmount[fineId] || '0');
    if (amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setPaying(fineId);
    const loadingToast = toast.loading('Processing payment...');
    
    try {
      await api.post(`/fines/${fineId}/pay`, { amount });
      toast.success('Payment processed successfully!', { id: loadingToast });
      setPaymentAmount({ ...paymentAmount, [fineId]: '' });
      fetchFines();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to process payment', { id: loadingToast });
    } finally {
      setPaying(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'partially_paid':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'paid':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'waived':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateRemaining = (fine: Fine) => {
    const total = parseFloat(fine.amount);
    const paid = fine.paidAmount ? parseFloat(fine.paidAmount) : 0;
    return total - paid;
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
                  <DollarSign className="w-8 h-8 text-yellow-400" />
                  My Fines
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  View and pay your library fines
                </p>
              </div>
            </div>
            {totalUnpaid > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Unpaid</p>
                <p className="text-3xl font-bold text-red-400">
                  ${totalUnpaid.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-t border-purple-500/20 pt-4">
            <button
              onClick={() => setShowUnpaid(true)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showUnpaid
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
              }`}
            >
              Unpaid Fines
            </button>
            <button
              onClick={() => setShowUnpaid(false)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !showUnpaid
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
              }`}
            >
              All Fines
            </button>
          </div>
        </div>

        {/* Total Unpaid Warning */}
        {totalUnpaid > 0 && (
          <div className="card bg-red-500/10 border-red-500/30 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Payment Required</h3>
                <p className="text-sm text-gray-300">
                  You have ${totalUnpaid.toFixed(2)} in unpaid fines. Please pay your fines to avoid account restrictions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* No Fines */}
        {!loading && fines.length === 0 && (
          <div className="card text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {showUnpaid ? 'No Unpaid Fines' : 'No Fines Found'}
            </h3>
            <p className="text-gray-400">
              {showUnpaid
                ? 'You have no outstanding fines. Keep it up!'
                : 'No fines have been charged to your account.'}
            </p>
          </div>
        )}

        {/* Fines List */}
        {!loading && fines.length > 0 && (
          <div className="space-y-4">
            {fines.map((fine) => {
              const remaining = calculateRemaining(fine);
              return (
                <div
                  key={fine.id}
                  className="card hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-lg ${
                        fine.status === 'paid' || fine.status === 'waived'
                          ? 'bg-green-500/20'
                          : 'bg-red-500/20'
                      }`}>
                        <DollarSign className={`w-6 h-6 ${
                          fine.status === 'paid' || fine.status === 'waived'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              fine.status
                            )}`}
                          >
                            {fine.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {fine.reason}
                        </h3>
                        {fine.loan && (
                          <p className="text-sm text-gray-400 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Book: {fine.loan.bookCopy.book.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        ${parseFloat(fine.amount).toFixed(2)}
                      </p>
                      {fine.paidAmount && (
                        <p className="text-sm text-green-400">
                          Paid: ${parseFloat(fine.paidAmount).toFixed(2)}
                        </p>
                      )}
                      {fine.status === 'partially_paid' && (
                        <p className="text-sm text-yellow-400">
                          Remaining: ${remaining.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-purple-500/20">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400">Charged:</span>
                      <span className="text-white">{formatDate(fine.chargedAt)}</span>
                    </div>
                    {fine.paidAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400">Paid:</span>
                        <span className="text-white">{formatDate(fine.paidAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Payment Section */}
                  {(fine.status === 'unpaid' || fine.status === 'partially_paid') && (
                    <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-sm text-gray-400 mb-2 block">
                            Payment Amount
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                              $
                            </span>
                            <input
                              type="number"
                              min="0"
                              max={remaining}
                              step="0.01"
                              value={paymentAmount[fine.id] || ''}
                              onChange={(e) =>
                                setPaymentAmount({ ...paymentAmount, [fine.id]: e.target.value })
                              }
                              className="w-full pl-8 pr-4 py-2 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                              placeholder={`Max: ${remaining.toFixed(2)}`}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handlePayFine(fine.id)}
                          disabled={paying === fine.id}
                          className="btn-primary flex items-center gap-2 mt-6"
                        >
                          {paying === fine.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4" />
                              Pay Now
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {fine.notes && (
                    <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm text-gray-400">
                        <span className="font-medium text-white">Notes:</span> {fine.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
