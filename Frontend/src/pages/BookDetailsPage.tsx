import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Tag,
  Building,
  Info,
  CheckCircle,
  XCircle,
  Loader,
  Download,
} from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publishedYear?: number;
  category: string;
  publisher?: string;
  description?: string;
  coverImageUrl?: string;
  pdfUrl?: string;
  bookType: string;
  totalCopies: number;
  availableCopies: number;
}

export default function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [userLoans, setUserLoans] = useState<any[]>([]);

  useEffect(() => {
    fetchBookDetails();
    if (user?.accountType === 'MEMBER') {
      fetchUserLoans();
    }
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/books/${id}`);
      setBook(response.data.data);
    } catch (error) {
      console.error('Failed to fetch book:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLoans = async () => {
    try {
      const response = await api.get('/loans/my-loans');
      setUserLoans(response.data.loans);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    }
  };

  const handleBorrow = async () => {
    if (!book) return;

    const confirmed = await new Promise<boolean>((resolve) => {
      const toastId = toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-white">Do you want to borrow "{book.title}"?</p>
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

    const loadingToast = toast.loading('Borrowing book...');

    try {
      setBorrowing(true);
      await api.post('/loans/borrow', { bookId: book.id });
      toast.success('Book borrowed successfully!', { id: loadingToast });
      navigate('/my-loans');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to borrow book', { id: loadingToast });
      setBorrowing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!book) return;

    const loadingToast = toast.loading('Downloading PDF...');

    try {
      const response = await api.get(`/books/${book.id}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${book.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully', { id: loadingToast });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to download PDF', { id: loadingToast });
    }
  };

  const isBookLoanedByUser = () => {
    if (!book) return false;
    return userLoans.some(
      (loan) =>
        loan.bookCopy.book.id === book.id &&
        (loan.status === 'ongoing' || loan.status === 'overdue')
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="card text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Book Not Found</h2>
          <button onClick={() => navigate('/books')} className="btn-primary mt-4">
            Back to Books
          </button>
        </div>
      </div>
    );
  }

  const alreadyLoaned = isBookLoanedByUser();
  const canBorrow =
    user?.accountType === 'MEMBER' && book.availableCopies > 0 && !alreadyLoaned;

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-purple-500/20 backdrop-blur-xl bg-gray-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-purple-500/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 hover:text-white">Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Book Details</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-glass p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Book Cover */}
            <div className="md:col-span-1">
              <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 shadow-2xl">
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Availability Status */}
              <div className="mt-6">
                {book.bookType === 'physical' ? (
                  <div
                    className={`flex items-center space-x-2 p-4 rounded-lg ${
                      book.availableCopies > 0
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-red-500/10 border border-red-500/30'
                    }`}
                  >
                    {book.availableCopies > 0 ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-green-400 font-medium">Available</p>
                          <p className="text-sm text-gray-400">
                            {book.availableCopies} of {book.totalCopies} copies
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-400" />
                        <div>
                          <p className="text-red-400 font-medium">Not Available</p>
                          <p className="text-sm text-gray-400">All copies on loan</p>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center space-x-2">
                    <Download className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-green-400 font-medium">Available Online</p>
                      <p className="text-sm text-gray-400">Download as PDF</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {user?.accountType === 'MEMBER' && (
                <div className="mt-4">
                  {book.bookType === 'online' ? (
                    <button
                      onClick={handleDownloadPDF}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  ) : alreadyLoaned ? (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                      <p className="text-blue-400 text-sm">
                        You have already borrowed this book
                      </p>
                      <button
                        onClick={() => navigate('/my-loans')}
                        className="btn-secondary mt-3 w-full"
                      >
                        View My Loans
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleBorrow}
                      disabled={!canBorrow || borrowing}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {borrowing ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader className="w-4 h-4 animate-spin" />
                          Borrowing...
                        </span>
                      ) : (
                        'Borrow Book'
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Book Details */}
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold text-white mb-2">{book.title}</h1>
              <p className="text-xl text-gray-400 mb-6">{book.author}</p>

              {/* Metadata */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <Tag className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="text-gray-300">{book.category}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">ISBN</p>
                    <p className="text-gray-300 font-mono">{book.isbn}</p>
                  </div>
                </div>

                {book.publishedYear && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Published Year</p>
                      <p className="text-gray-300">{book.publishedYear}</p>
                    </div>
                  </div>
                )}

                {book.publisher && (
                  <div className="flex items-start space-x-3">
                    <Building className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Publisher</p>
                      <p className="text-gray-300">{book.publisher}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {book.description && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
                  <p className="text-gray-400 leading-relaxed">{book.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
