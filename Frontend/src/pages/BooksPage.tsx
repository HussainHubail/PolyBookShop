import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { BookOpen, Search, Filter, CheckCircle, XCircle, ArrowLeft, Download, Library, Plus, Edit, Trash2, X } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  publishedYear?: number;
  description?: string;
  coverImageUrl?: string;
  bookType: string;
  pdfUrl?: string;
  downloadCount?: number;
  totalCopies: number;
  availableCopies: number;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function BooksPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [bookType, setBookType] = useState<string>('all'); // 'all', 'physical', 'online'
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publishedYear: '',
    description: '',
    coverImageUrl: '',
    bookType: 'physical',
    totalCopies: '1',
  });

  // Debounce search term by 500ms
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [debouncedSearchTerm, selectedCategory, bookType]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (bookType !== 'all') params.append('bookType', bookType);

      const response = await api.get(`/books?${params.toString()}`);
      setBooks(response.data.data.books);
    } catch (error) {
      console.error('Failed to fetch books:', error);
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

  const getAvailabilityColor = (available: number, total: number) => {
    if (available === 0) return 'text-red-400';
    if (available / total < 0.3) return 'text-yellow-400';
    return 'text-green-400';
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/books', {
        ...formData,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : null,
        totalCopies: parseInt(formData.totalCopies),
      });
      toast.success('Book added successfully!');
      setShowAddModal(false);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: '',
        publisher: '',
        publishedYear: '',
        description: '',
        coverImageUrl: '',
        bookType: 'physical',
        totalCopies: '1',
      });
      fetchBooks();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add book');
    }
  };

  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    try {
      await api.put(`/books/${selectedBook.id}`, {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        category: formData.category,
        publisher: formData.publisher,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : null,
        description: formData.description,
        coverImageUrl: formData.coverImageUrl,
      });
      toast.success('Book updated successfully!');
      setShowEditModal(false);
      setSelectedBook(null);
      fetchBooks();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update book');
    }
  };

  const handleDeleteBook = async (bookId: number, bookTitle: string) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      const toastId = toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-white">Delete "{bookTitle}"?</p>
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
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ), { duration: Infinity });
    });

    if (!confirmed) return;

    try {
      await api.delete(`/books/${bookId}`);
      toast.success('Book deleted successfully!');
      fetchBooks();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete book');
    }
  };

  const openEditModal = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      publisher: book.publisher || '',
      publishedYear: book.publishedYear?.toString() || '',
      description: book.description || '',
      coverImageUrl: book.coverImageUrl || '',
      bookType: book.bookType,
      totalCopies: book.totalCopies.toString(),
    });
    setShowEditModal(true);
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
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 animate-float">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Library Books</h1>
                <p className="text-sm text-gray-400">{books.length} books available</p>
              </div>
            </div>

            {user?.accountType === 'LIBRARIAN' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Book</span>
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                searchTerm && searchTerm !== debouncedSearchTerm ? 'text-purple-400 animate-pulse' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 pr-10 w-full"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
              {searchTerm && searchTerm !== debouncedSearchTerm && (
                <span className="absolute -bottom-5 left-0 text-xs text-purple-400">
                  Searching...
                </span>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {selectedCategory && (
                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">1</span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 card-glass rounded-lg animate-fadeIn">
              <div className="space-y-4">
                {/* Book Type Filter */}
                <div>
                  <label className="label mb-2">Book Type</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setBookType('all')}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        bookType === 'all'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                      }`}
                    >
                      All Books
                    </button>
                    <button
                      onClick={() => setBookType('physical')}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        bookType === 'physical'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                      }`}
                    >
                      📚 Physical Books
                    </button>
                    <button
                      onClick={() => setBookType('online')}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        bookType === 'online'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                      }`}
                    >
                      💾 Online Books
                    </button>
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="label mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        !selectedCategory
                          ? 'bg-purple-600 text-white'
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
                          ? 'bg-purple-600 text-white'
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
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No books found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="card-glass p-4 hover:scale-105 transition-transform group relative"
              >
                <div
                  onClick={() => navigate(`/books/${book.id}`)}
                  className="cursor-pointer"
                >
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
                      <BookOpen className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  
                  {/* Availability Badge or Book Type */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg backdrop-blur-sm text-xs font-medium flex items-center space-x-1 ${
                    book.bookType === 'online'
                      ? 'bg-green-500/80 text-white'
                      : book.availableCopies > 0
                      ? 'bg-blue-500/80 text-white'
                      : 'bg-red-500/80 text-white'
                  }`}>
                    {book.bookType === 'online' ? (
                      <>
                        <Download className="w-3 h-3" />
                        <span>Online</span>
                      </>
                    ) : book.availableCopies > 0 ? (
                      <>
                        <Library className="w-3 h-3" />
                        <span>Physical</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>Unavailable</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Book Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-400">{book.author}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                      {book.category}
                    </span>
                    {book.bookType === 'physical' && (
                      <span className={`text-xs font-medium ${getAvailabilityColor(book.availableCopies, book.totalCopies)}`}>
                        {book.availableCopies}/{book.totalCopies} copies
                      </span>
                    )}
                    {book.bookType === 'online' && book.downloadCount !== undefined && (
                      <span className="text-xs text-green-400">
                        {book.downloadCount} downloads
                      </span>
                    )}
                  </div>

                  {book.publishedYear && (
                    <p className="text-xs text-gray-500">{book.publishedYear}</p>
                  )}
                </div>
                </div>

                {/* Librarian Action Buttons */}
                {user?.accountType === 'LIBRARIAN' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(book);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBook(book.id, book.title);
                      }}
                      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-purple-500/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-purple-500/20 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
              <h2 className="text-xl font-bold text-white">Add New Book</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAddBook} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Author *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">ISBN *</label>
                  <input
                    type="text"
                    required
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="label">Publisher</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Published Year</label>
                  <input
                    type="number"
                    value={formData.publishedYear}
                    onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Book Type *</label>
                  <select
                    required
                    value={formData.bookType}
                    onChange={(e) => setFormData({ ...formData, bookType: e.target.value })}
                    className="input"
                  >
                    <option value="physical">Physical</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                {formData.bookType === 'physical' && (
                  <div>
                    <label className="label">Total Copies *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.totalCopies}
                      onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                      className="input"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="label">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input min-h-[100px]"
                  rows={4}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Add Book
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditModal && selectedBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-purple-500/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-purple-500/20 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
              <h2 className="text-xl font-bold text-white">Edit Book</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedBook(null);
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleEditBook} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Author *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">ISBN *</label>
                  <input
                    type="text"
                    required
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    list="categories-edit"
                  />
                  <datalist id="categories-edit">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="label">Publisher</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Published Year</label>
                  <input
                    type="number"
                    value={formData.publishedYear}
                    onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="label">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input min-h-[100px]"
                  rows={4}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedBook(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
