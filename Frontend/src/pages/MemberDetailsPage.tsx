import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { 
  Users, ArrowLeft, Mail, Phone, MapPin, AlertCircle, DollarSign, 
  FileText, Calendar, BookOpen, Ban, ShieldOff, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Hold {
  id: number;
  reason: string;
  status: string;
  notes: string | null;
  createdAt: string;
  removedAt: string | null;
}

interface Fine {
  id: number;
  amount: number;
  reason: string;
  status: string;
  notes: string | null;
  paidAmount: number | null;
  createdAt: string;
  paidAt: string | null;
}

interface Loan {
  id: number;
  borrowDatetime: string;
  dueDatetime: string;
  returnDatetime: string | null;
  status: string;
  bookCopy: {
    id: number;
    book: {
      id: number;
      title: string;
      author: string;
      coverImageUrl: string | null;
    };
  };
}

interface MemberDetails {
  id: number;
  userId: number;
  loginId: string;
  username: string;
  email: string;
  isActive: boolean;
  address: string;
  phoneNumber: string;
  createdAt: string;
  maxBorrowedBooks: number;
  totalLoans: number;
  activeHoldsCount: number;
  totalUnpaidFines: number;
  holds: Hold[];
  fines: Fine[];
  loans: Loan[];
}

export default function MemberDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<MemberDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMemberDetails();
    }
  }, [id]);

  const fetchMemberDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/members/${id}`);
      setMember(response.data.member);
    } catch (error: any) {
      console.error('Failed to fetch member details:', error);
      toast.error(error.response?.data?.error || 'Failed to load member details');
      navigate('/members');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveHold = async (holdId: number) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-white">Remove this hold?</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Remove
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

    const loadingToast = toast.loading('Removing hold...');
    try {
      await api.delete(`/holds/${holdId}`);
      toast.success('Hold removed successfully!', { id: loadingToast });
      fetchMemberDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove hold', { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-purple-500/20 backdrop-blur-xl bg-gray-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/members')}
              className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">Member Details</h1>
              <p className="text-sm text-gray-400">{member.username}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Member Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info Card */}
            <div className="card-glass p-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold text-white">{member.username}</h2>
                {member.isActive ? (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
                    Inactive
                  </span>
                )}
              </div>
              
              <p className="text-sm text-purple-400 font-mono mb-6">{member.loginId}</p>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">{member.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">{member.phoneNumber}</span>
                </div>
                <div className="flex items-start space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-purple-400 mt-0.5" />
                  <span className="text-gray-300">{member.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-gray-400 text-xs">Member Since</p>
                    <p className="text-gray-300">{new Date(member.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            <div className="card-glass p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-400">Total Loans</span>
                  </div>
                  <span className="text-lg font-semibold text-white">{member.totalLoans}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-400">Max Allowed</span>
                  </div>
                  <span className="text-lg font-semibold text-blue-400">{member.maxBorrowedBooks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`w-4 h-4 ${member.activeHoldsCount > 0 ? 'text-orange-400' : 'text-gray-400'}`} />
                    <span className="text-sm text-gray-400">Active Holds</span>
                  </div>
                  <span className={`text-lg font-semibold ${member.activeHoldsCount > 0 ? 'text-orange-400' : 'text-white'}`}>
                    {member.activeHoldsCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className={`w-4 h-4 ${member.totalUnpaidFines > 0 ? 'text-red-400' : 'text-gray-400'}`} />
                    <span className="text-sm text-gray-400">Unpaid Fines</span>
                  </div>
                  <span className={`text-lg font-semibold ${member.totalUnpaidFines > 0 ? 'text-red-400' : 'text-white'}`}>
                    ${member.totalUnpaidFines.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Holds */}
            <div className="card-glass p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Ban className="w-5 h-5 text-orange-400" />
                  Active Holds
                </h3>
                <span className="text-sm text-gray-400">{member.holds.filter(h => h.status === 'active').length} active</span>
              </div>

              {member.holds.filter(h => h.status === 'active').length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No active holds</p>
              ) : (
                <div className="space-y-3">
                  {member.holds.filter(h => h.status === 'active').map((hold) => (
                    <div key={hold.id} className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-orange-400 mb-1">{hold.reason}</h4>
                          <p className="text-sm text-gray-400">
                            Placed on {new Date(hold.createdAt).toLocaleString()}
                          </p>
                          {hold.notes && (
                            <p className="text-sm text-gray-300 mt-2 bg-black/20 rounded p-2">{hold.notes}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveHold(hold.id)}
                          className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors flex items-center gap-1 text-sm ml-4"
                        >
                          <ShieldOff className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fines */}
            <div className="card-glass p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-400" />
                  Fines
                </h3>
                <span className="text-sm text-gray-400">{member.fines.filter(f => f.status === 'unpaid').length} unpaid</span>
              </div>

              {member.fines.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No fines</p>
              ) : (
                <div className="space-y-3">
                  {member.fines.map((fine) => (
                    <div key={fine.id} className={`border rounded-lg p-4 ${
                      fine.status === 'paid' 
                        ? 'bg-gray-500/5 border-gray-500/20' 
                        : 'bg-red-500/5 border-red-500/20'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold ${fine.status === 'paid' ? 'text-gray-400' : 'text-red-400'}`}>
                              {fine.reason}
                            </h4>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              fine.status === 'paid'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                : fine.status === 'partial'
                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}>
                              {fine.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">
                            Charged on {new Date(fine.createdAt).toLocaleDateString()}
                          </p>
                          {fine.notes && (
                            <p className="text-sm text-gray-300 mt-2 bg-black/20 rounded p-2">{fine.notes}</p>
                          )}
                          {fine.paidAt && (
                            <p className="text-sm text-green-400 mt-1">
                              Paid on {new Date(fine.paidAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className={`text-lg font-semibold ${fine.status === 'paid' ? 'text-gray-400' : 'text-red-400'}`}>
                            ${Number(fine.amount).toFixed(2)}
                          </p>
                          {fine.paidAmount && Number(fine.paidAmount) > 0 && (
                            <p className="text-xs text-gray-400">
                              Paid: ${Number(fine.paidAmount).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Loan History */}
            <div className="card-glass p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Loan History
                </h3>
                <span className="text-sm text-gray-400">{member.loans.length} total</span>
              </div>

              {member.loans.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No loan history</p>
              ) : (
                <div className="space-y-3">
                  {member.loans.slice(0, 10).map((loan) => (
                    <div key={loan.id} className="bg-gray-500/5 border border-gray-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        {loan.bookCopy.book.coverImageUrl && (
                          <img
                            src={loan.bookCopy.book.coverImageUrl}
                            alt={loan.bookCopy.book.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{loan.bookCopy.book.title}</h4>
                          <p className="text-sm text-gray-400 mb-2">{loan.bookCopy.book.author}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Borrowed: {new Date(loan.borrowDatetime).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Due: {new Date(loan.dueDatetime).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {loan.returnDatetime && (
                            <p className="text-xs text-green-400 mt-1">
                              Returned: {new Date(loan.returnDatetime).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          loan.status === 'ongoing'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : loan.status === 'returned'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                          {loan.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
