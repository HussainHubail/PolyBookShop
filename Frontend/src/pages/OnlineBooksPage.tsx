import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Eye,
  Plus,
  X,
  FileText,
  Edit,
} from 'lucide-react';

interface OnlineBook {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  publishedYear?: number;
  description?: string;
  coverImageUrl?: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfFileSize?: number;
  downloadCount: number;
  bookType: string;
}

export default function OnlineBooksPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [books, setBooks] = useState<OnlineBook[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<OnlineBook | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for new online book
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publishedYear: '',
    description: '',
    coverImageUrl: '',
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    fetchOnlineBooks();
    fetchCategories();
  }, [searchTerm, selectedCategory]);

  const fetchOnlineBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('bookType', 'online');
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await api.get(`/books?${params.toString()}`);
      setBooks(response.data.data.books);
    } catch (error) {
      console.error('Failed to fetch online books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/books/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handlePDFSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setPdfFile(file);
  };

  const handleAddOnlineBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pdfFile) {
      toast.error('Please select a PDF file');
      return;
    }

    const loadingToast = toast.loading('Adding online book...');

    try {
      setUploading(true);

      console.log('📚 Creating book with data:', formData);

      // Create the book first
      const bookData = {
        ...formData,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : undefined,
        totalCopies: 0,
        availableCopies: 0,
      };

      const bookResponse = await api.post('/books', bookData);
      console.log('✅ Book created:', bookResponse.data);
      const bookId = bookResponse.data.book.id;

      console.log('📤 Uploading PDF for book ID:', bookId);

      // Upload the PDF
      const formDataObj = new FormData();
      formDataObj.append('pdf', pdfFile);

      const uploadResponse = await api.post(`/books/${bookId}/upload-pdf`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ PDF uploaded:', uploadResponse.data);

      toast.success('Online book added successfully!', { id: loadingToast });
      setShowAddModal(false);
      resetForm();
      fetchOnlineBooks();
    } catch (error: any) {
      console.error('❌ Error adding online book:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to add online book', { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBook = async (bookId: number, title: string) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      const toastId = toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-white">Are you sure you want to delete "{title}"?</p>
          <p className="text-sm text-gray-400">This action cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Delete
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

    const loadingToast = toast.loading('Deleting book...');

    try {
      await api.delete(`/books/${bookId}`);
      toast.success('Online book deleted successfully', { id: loadingToast });
      fetchOnlineBooks();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete book', { id: loadingToast });
    }
  };

  const openEditModal = (book: OnlineBook) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      publisher: book.publisher,
      publishedYear: book.publishedYear.toString(),
      description: book.description || '',
      coverImageUrl: book.coverImageUrl || ''
    });
    setPdfFile(null);
    setShowEditModal(true);
  };

  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    const loadingToast = toast.loading('Updating book...');

    try {
      await api.put(`/books/${selectedBook.id}`, {
        ...formData,
        publishedYear: parseInt(formData.publishedYear)
      });
      
      toast.success('Book updated successfully!', { id: loadingToast });
      setShowEditModal(false);
      setSelectedBook(null);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: '',
        publisher: '',
        publishedYear: '',
        description: '',
        coverImageUrl: ''
      });
      fetchOnlineBooks();
    } catch (error: any) {
      console.error('Error updating book:', error);
      toast.error(error.response?.data?.error || 'Failed to update book', { id: loadingToast });
    }
  };

  const handleDownloadPDF = async (bookId: number, title: string) => {
    const loadingToast = toast.loading('Downloading PDF...');
    
    try {
      const response = await api.get(`/books/${bookId}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully', { id: loadingToast });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to download PDF', { id: loadingToast });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      publisher: '',
      publishedYear: '',
      description: '',
      coverImageUrl: '',
    });
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

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
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/50 animate-float">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Online Books</h1>
                <p className="text-sm text-gray-400">{books.length} downloadable books</p>
              </div>
            </div>

            {user?.accountType === 'LIBRARIAN' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Online Book</span>
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search online books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {selectedCategory && (
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">1</span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 card-glass rounded-lg animate-fadeIn">
              <div className="space-y-4">
                <div>
                  <label className="label mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        !selectedCategory
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Books Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <Download className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No online books found</p>
            <p className="text-gray-500 text-sm mt-2">
              {user?.accountType === 'LIBRARIAN'
                ? 'Click "Add Online Book" to upload your first book'
                : 'Check back later for new books'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book.id} className="card-glass p-4 hover:scale-105 transition-transform group">
                {/* Book Cover */}
                <div className="aspect-[2/3] mb-4 rounded-lg overflow-hidden bg-gray-800 relative">
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-16 h-16 text-gray-600" />
                    </div>
                  )}

                  {/* Download Badge */}
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-lg backdrop-blur-sm bg-green-500/80 text-white text-xs font-medium flex items-center space-x-1">
                    <Download className="w-3 h-3" />
                    <span>PDF</span>
                  </div>
                </div>

                {/* Book Info */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2 group-hover:text-green-400 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">{book.author}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded">
                      {book.category}
                    </span>
                    <span className="text-green-400">{book.downloadCount} downloads</span>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    <p>File Size: {formatFileSize(book.pdfFileSize)}</p>
                    {book.publishedYear && <p>{book.publishedYear}</p>}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleDownloadPDF(book.id, book.title)}
                      className="w-full btn-primary flex items-center justify-center space-x-2 text-sm py-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>

                    {user?.accountType === 'MEMBER' && (
                      <button
                        onClick={() => navigate(`/books/${book.id}`)}
                        className="w-full btn-secondary flex items-center justify-center space-x-2 text-sm py-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    )}

                    {user?.accountType === 'LIBRARIAN' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/books/${book.id}`)}
                          className="flex-1 btn-secondary flex items-center justify-center space-x-2 text-sm py-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => openEditModal(book)}
                          className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center space-x-2 text-sm py-2 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id, book.title)}
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center space-x-2 text-sm py-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Online Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-glass max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gradient">Add Online Book</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddOnlineBook} className="space-y-4">
              {/* Title */}
              <div>
                <label className="label">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input w-full"
                  placeholder="Enter book title"
                />
              </div>

              {/* Author */}
              <div>
                <label className="label">Author *</label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="input w-full"
                  placeholder="Enter author name"
                />
              </div>

              {/* ISBN */}
              <div>
                <label className="label">ISBN *</label>
                <input
                  type="text"
                  required
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  className="input w-full"
                  placeholder="Enter ISBN"
                />
              </div>

              {/* Category */}
              <div>
                <label className="label">Category *</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., Fiction, Science, History"
                />
              </div>

              {/* Publisher */}
              <div>
                <label className="label">Publisher</label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  className="input w-full"
                  placeholder="Enter publisher"
                />
              </div>

              {/* Published Year */}
              <div>
                <label className="label">Published Year</label>
                <input
                  type="number"
                  value={formData.publishedYear}
                  onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., 2024"
                  min="1000"
                  max="2100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input w-full"
                  rows={4}
                  placeholder="Enter book description"
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="label">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  className="input w-full"
                  placeholder="https://example.com/book-cover.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Provide a URL to the book cover image</p>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="label">PDF File *</label>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handlePDFSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{pdfFile ? pdfFile.name : 'Choose PDF File'}</span>
                  </button>
                  {pdfFile && (
                    <p className="text-xs text-gray-400">
                      Size: {formatFileSize(pdfFile.size)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">Maximum file size: 50MB</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 btn-secondary"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Online Book Modal */}
      {showEditModal && selectedBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-glass max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gradient">Edit Online Book</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedBook(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleEditBook} className="space-y-4">
              {/* Title */}
              <div>
                <label className="label">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input w-full"
                  placeholder="Enter book title"
                />
              </div>

              {/* Author */}
              <div>
                <label className="label">Author *</label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="input w-full"
                  placeholder="Enter author name"
                />
              </div>

              {/* ISBN and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">ISBN *</label>
                  <input
                    type="text"
                    required
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="input w-full"
                    placeholder="Enter ISBN"
                  />
                </div>

                <div>
                  <label className="label">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input w-full"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Publisher and Published Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Publisher *</label>
                  <input
                    type="text"
                    required
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="input w-full"
                    placeholder="Enter publisher"
                  />
                </div>

                <div>
                  <label className="label">Published Year *</label>
                  <input
                    type="number"
                    required
                    value={formData.publishedYear}
                    onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                    className="input w-full"
                    placeholder="2024"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input w-full"
                  rows={4}
                  placeholder="Enter book description"
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="label">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  className="input w-full"
                  placeholder="https://example.com/book-cover.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Provide a URL to the book cover image</p>
              </div>

              {/* Note about PDF */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-400">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Note: PDF file cannot be changed after upload. To replace the PDF, delete this book and create a new one.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedBook(null);
                    resetForm();
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Update Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
