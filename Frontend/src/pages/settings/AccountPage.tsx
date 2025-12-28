import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { User, Mail, Phone, MapPin, Camera, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, updateUser, clearAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (user.accountType === 'MEMBER') {
      fetchMemberProfile();
    } else {
      // For ADMIN and LIBRARIAN, use basic user data
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phoneNumber: '',
        address: '',
      });
      setProfileLoading(false);
    }
  }, [user, navigate]);

  const fetchMemberProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await api.get('/members/profile');
      
      if (response.data.success && response.data.member) {
        const profile = response.data.member;
        setFormData({
          username: profile.username || '',
          email: profile.email || '',
          phoneNumber: profile.phoneNumber || '',
          address: profile.address || '',
        });
        setProfilePicture(profile.profilePictureUrl || null);
      }
    } catch (error: any) {
      console.error('Failed to fetch member profile:', error);
      
      // Fallback to basic user data
      if (user) {
        setFormData({
          username: user.username || '',
          email: user.email || '',
          phoneNumber: '',
          address: '',
        });
      }
      
      toast.error('Could not load full profile. Using basic information.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input to allow re-upload of same file
    e.target.value = '';

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error('Invalid file type. Please upload JPG, PNG, GIF, or WebP images only.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const loadingToast = toast.loading('Uploading profile picture...');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('profilePicture', file);

      const response = await api.post('/members/profile/picture', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.member.profilePictureUrl) {
        const imageUrl = response.data.member.profilePictureUrl;
        setProfilePicture(imageUrl);
        toast.success('Profile picture updated successfully!', { id: loadingToast });
      } else {
        toast.error('Upload succeeded but no image URL returned', { id: loadingToast });
      }
    } catch (error: any) {
      console.error('Profile picture upload error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to upload profile picture';
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  const handleRemoveProfilePicture = async () => {
    const confirmed = await new Promise<boolean>((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-white">Remove profile picture?</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
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

    const loadingToast = toast.loading('Removing profile picture...');

    try {
      await api.delete('/members/profile/picture');
      setProfilePicture(null);
      toast.success('Profile picture removed successfully!', { id: loadingToast });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove profile picture', { id: loadingToast });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    if (!formData.username || formData.username.trim().length < 3) {
      toast.error('Username must be at least 3 characters long');
      return;
    }

    if (formData.username.trim().length > 100) {
      toast.error('Username must not exceed 100 characters');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Updating profile...');

    try {
      if (user?.accountType === 'MEMBER') {
        const response = await api.put('/members/profile', {
          username: formData.username.trim(),
          phoneNumber: formData.phoneNumber?.trim() || '',
          address: formData.address?.trim() || '',
        });

        if (response.data.success && response.data.member) {
          updateUser({ 
            username: response.data.member.username,
            email: response.data.member.email 
          });
          toast.success('Profile updated successfully!', { id: loadingToast });
        } else {
          toast.error('Update succeeded but no data returned', { id: loadingToast });
        }
      } else {
        // For ADMIN and LIBRARIAN, update username only in auth store
        // Note: Backend API for admin/librarian profile update may need to be implemented
        updateUser({ username: formData.username.trim() });
        toast.success('Username updated successfully!', { id: loadingToast });
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update profile';
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // First confirmation
    const firstConfirmed = await new Promise<boolean>((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-white">Delete your account?</p>
          <p className="text-sm text-red-400">This action cannot be undone. All your data will be permanently deleted.</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Continue
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
        style: { background: '#1a1f2e', maxWidth: '420px' }
      });
    });

    if (!firstConfirmed) return;

    // Second confirmation
    const secondConfirmed = await new Promise<boolean>((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-white">Are you absolutely sure?</p>
          <p className="text-sm text-red-400">Type DELETE to confirm account deletion.</p>
          <input
            type="text"
            id="delete-confirm-input"
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="Type DELETE"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                const input = document.getElementById('delete-confirm-input') as HTMLInputElement;
                if (input?.value === 'DELETE') {
                  toast.dismiss(t.id);
                  resolve(true);
                } else {
                  toast.error('Please type DELETE to confirm');
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Delete Forever
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
        style: { background: '#1a1f2e', maxWidth: '420px' }
      });
    });

    if (!secondConfirmed) return;

    const loadingToast = toast.loading('Deleting account...');

    try {
      const response = await api.delete('/members/profile');
      
      if (response.data.success) {
        clearAuth();
        toast.success('Account deleted successfully', { id: loadingToast });
        navigate('/auth/login-selection');
      } else {
        toast.error('Deletion request succeeded but response was unexpected', { id: loadingToast });
      }
    } catch (error: any) {
      console.error('Account deletion error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete account';
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  if (!user) return null;

  if (profileLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gradient">Manage Account</h1>
            <p className="text-gray-400 mt-2">Update your profile information and manage your account</p>
          </div>

          <div className="space-y-6">
            {/* Profile Picture Section - Members Only */}
            {user.accountType === 'MEMBER' && (
              <div className="card-glass p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Profile Picture</h2>
                
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {profilePicture ? (
                      <img
                        src={`http://localhost:5000${profilePicture}`}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-purple-500/30"
                        onError={(e) => {
                          console.error('Failed to load profile picture:', profilePicture);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 
                                    flex items-center justify-center text-white text-4xl font-bold border-4 border-purple-500/30">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg 
                                 transition-colors flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Upload Photo
                      </button>
                      
                      {profilePicture && (
                        <button
                          onClick={handleRemoveProfilePicture}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg 
                                   transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      JPG, PNG, GIF or WebP. Max size 5MB.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="card-glass p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="label">Username *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      minLength={3}
                      maxLength={100}
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="input w-full pl-10"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="input w-full pl-10 opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {user.accountType === 'MEMBER' && (
                  <>
                    <div>
                      <label className="label">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          maxLength={20}
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          className="input w-full pl-10"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <textarea
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="input w-full pl-10 min-h-[100px]"
                          placeholder="Enter your address"
                          rows={3}
                          maxLength={500}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed
                             text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone - Members Only */}
            {user.accountType === 'MEMBER' && (
              <div className="card-glass p-6 border-2 border-red-500/20">
                <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
                <p className="text-gray-400 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                           transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
