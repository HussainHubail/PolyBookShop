import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Users, ArrowLeft, Mail, Phone, MapPin, AlertCircle, DollarSign, FileText, Ban, X, Plus, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface Member {
  id: number;
  userId: number;
  loginId: string;
  username: string;
  email: string;
  isActive: boolean;
  address: string;
  phoneNumber: string;
  createdAt: string;
  totalLoans: number;
  holds: Array<{
    id: number;
    reason: string;
    status: string;
    createdAt: string;
  }>;
  activeHoldsCount: number;
  fines: Array<{
    id: number;
    amount: number;
    reason: string;
    status: string;
    createdAt: string;
  }>;
  totalUnpaidFines: number;
}

export default function MembersPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showFineModal, setShowFineModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Form states
  const [holdReason, setHoldReason] = useState('');
  const [holdNotes, setHoldNotes] = useState('');
  const [fineAmount, setFineAmount] = useState('');
  const [fineReason, setFineReason] = useState('');
  const [fineNotes, setFineNotes] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/members');
      setMembers(response.data.members || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceHold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const loadingToast = toast.loading('Placing hold...');
    try {
      await api.post('/holds', {
        memberId: selectedMember.id,
        reason: holdReason,
        notes: holdNotes || undefined
      });

      toast.success('Hold placed successfully! Member has been notified.', { id: loadingToast });
      setShowHoldModal(false);
      setHoldReason('');
      setHoldNotes('');
      setSelectedMember(null);
      fetchMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to place hold', { id: loadingToast });
    }
  };

  const handleRemoveHold = async (holdId: number, memberName: string) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-white">Remove hold for {memberName}?</p>
          <p className="text-sm text-gray-400">This will allow the member to borrow and download books again.</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Remove Hold
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
      toast.success('Hold removed successfully! Member has been notified.', { id: loadingToast });
      fetchMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove hold', { id: loadingToast });
    }
  };

  const handleAddFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const loadingToast = toast.loading('Adding fine...');
    try {
      await api.post('/fines', {
        memberId: selectedMember.id,
        amount: parseFloat(fineAmount),
        reason: fineReason,
        notes: fineNotes || undefined
      });

      toast.success('Fine added successfully! Member has been notified.', { id: loadingToast });
      setShowFineModal(false);
      setFineAmount('');
      setFineReason('');
      setFineNotes('');
      setSelectedMember(null);
      fetchMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add fine', { id: loadingToast });
    }
  };

  const openHoldModal = (member: Member) => {
    setSelectedMember(member);
    setShowHoldModal(true);
  };

  const openFineModal = (member: Member) => {
    setSelectedMember(member);
    setShowFineModal(true);
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
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">Members Management</h1>
              <p className="text-sm text-gray-400">{members.length} total members</p>
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
        ) : members.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Members Found</h2>
            <p className="text-gray-400">No members registered yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="card-glass p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Member Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{member.username}</h3>
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
                        <p className="text-sm text-purple-400 font-mono">{member.loginId}</p>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300">{member.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300">{member.phoneNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm md:col-span-2">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300">{member.address}</span>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <FileText className="w-4 h-4 text-purple-400" />
                          <p className="text-xs text-gray-400">Total Loans</p>
                        </div>
                        <p className="text-2xl font-bold text-white">{member.totalLoans}</p>
                      </div>

                      <div className={`border rounded-lg p-3 ${
                        member.activeHoldsCount > 0 
                          ? 'bg-orange-500/10 border-orange-500/30' 
                          : 'bg-gray-500/10 border-gray-500/30'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <AlertCircle className={`w-4 h-4 ${member.activeHoldsCount > 0 ? 'text-orange-400' : 'text-gray-400'}`} />
                          <p className="text-xs text-gray-400">Active Holds</p>
                        </div>
                        <p className={`text-2xl font-bold ${member.activeHoldsCount > 0 ? 'text-orange-400' : 'text-white'}`}>
                          {member.activeHoldsCount}
                        </p>
                      </div>

                      <div className={`border rounded-lg p-3 ${
                        member.totalUnpaidFines > 0 
                          ? 'bg-red-500/10 border-red-500/30' 
                          : 'bg-gray-500/10 border-gray-500/30'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <DollarSign className={`w-4 h-4 ${member.totalUnpaidFines > 0 ? 'text-red-400' : 'text-gray-400'}`} />
                          <p className="text-xs text-gray-400">Unpaid Fines</p>
                        </div>
                        <p className={`text-2xl font-bold ${member.totalUnpaidFines > 0 ? 'text-red-400' : 'text-white'}`}>
                          ${member.totalUnpaidFines.toFixed(2)}
                        </p>
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Member Since</p>
                        <p className="text-sm font-semibold text-blue-400">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Holds Details */}
                    {member.holds.length > 0 && (
                      <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4 mb-3">
                        <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Active Holds
                        </h4>
                        <div className="space-y-2">
                          {member.holds.map((hold) => (
                            <div key={hold.id} className="flex justify-between items-start text-sm">
                              <div>
                                <p className="text-gray-300">{hold.reason}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(hold.createdAt).toLocaleDateString()} - Status: {hold.status}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveHold(hold.id, member.username)}
                                className="px-3 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors flex items-center gap-1 text-xs"
                              >
                                <ShieldOff className="w-3 h-3" />
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fines Details */}
                    {member.fines.length > 0 && (
                      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-3">
                        <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Unpaid Fines
                        </h4>
                        <div className="space-y-2">
                          {member.fines.map((fine) => (
                            <div key={fine.id} className="flex justify-between items-start text-sm">
                              <div>
                                <p className="text-gray-300">{fine.reason}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(fine.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <p className="text-red-400 font-semibold">${Number(fine.amount).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin Actions */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700">
                      <button
                        onClick={() => openHoldModal(member)}
                        className="flex-1 min-w-[140px] px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Ban className="w-4 h-4" />
                        Place Hold
                      </button>
                      <button
                        onClick={() => openFineModal(member)}
                        className="flex-1 min-w-[140px] px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <DollarSign className="w-4 h-4" />
                        Add Fine
                      </button>
                      <button
                        onClick={() => navigate(`/members/${member.id}`)}
                        className="flex-1 min-w-[140px] px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <FileText className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Place Hold Modal */}
      {showHoldModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-glass max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gradient">Place Hold</h2>
                <p className="text-sm text-gray-400 mt-1">On {selectedMember.username}</p>
              </div>
              <button
                onClick={() => {
                  setShowHoldModal(false);
                  setSelectedMember(null);
                  setHoldReason('');
                  setHoldNotes('');
                }}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handlePlaceHold} className="space-y-4">
              <div>
                <label className="label">Reason *</label>
                <select
                  required
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Select reason</option>
                  <option value="Overdue books">Overdue books</option>
                  <option value="Unpaid fines">Unpaid fines</option>
                  <option value="Damaged books">Damaged books</option>
                  <option value="Lost books">Lost books</option>
                  <option value="Policy violation">Policy violation</option>
                  <option value="Account review">Account review</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="label">Notes (Optional)</label>
                <textarea
                  value={holdNotes}
                  onChange={(e) => setHoldNotes(e.target.value)}
                  className="input w-full"
                  rows={3}
                  placeholder="Additional details about this hold..."
                />
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <p className="text-sm text-orange-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  This will prevent the member from borrowing or downloading books, and they will be notified immediately.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowHoldModal(false);
                    setSelectedMember(null);
                    setHoldReason('');
                    setHoldNotes('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors font-medium">
                  Place Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Fine Modal */}
      {showFineModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-glass max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gradient">Add Fine</h2>
                <p className="text-sm text-gray-400 mt-1">For {selectedMember.username}</p>
              </div>
              <button
                onClick={() => {
                  setShowFineModal(false);
                  setSelectedMember(null);
                  setFineAmount('');
                  setFineReason('');
                  setFineNotes('');
                }}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddFine} className="space-y-4">
              <div>
                <label className="label">Amount (USD) *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={fineAmount}
                  onChange={(e) => setFineAmount(e.target.value)}
                  className="input w-full"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="label">Reason *</label>
                <select
                  required
                  value={fineReason}
                  onChange={(e) => setFineReason(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Select reason</option>
                  <option value="Late return fee">Late return fee</option>
                  <option value="Lost book">Lost book</option>
                  <option value="Damaged book">Damaged book</option>
                  <option value="Missing pages">Missing pages</option>
                  <option value="Processing fee">Processing fee</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="label">Notes (Optional)</label>
                <textarea
                  value={fineNotes}
                  onChange={(e) => setFineNotes(e.target.value)}
                  className="input w-full"
                  rows={3}
                  placeholder="Additional details about this fine..."
                />
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  The member will be notified about this fine immediately.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowFineModal(false);
                    setSelectedMember(null);
                    setFineAmount('');
                    setFineReason('');
                    setFineNotes('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium">
                  Add Fine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
