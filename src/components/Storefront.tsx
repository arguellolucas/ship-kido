import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  FileText,
  Download,
  Star,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Plus,
  Search,
  MessageSquare,
  Send,
  Lock,
  Tag
} from 'lucide-react';
import { Product, Order, Review } from '../types';

interface StorefrontProps {
  onAddToCart: (product: Product) => void;
  onOpenCart: () => void;
}

export const Storefront: React.FC<StorefrontProps> = ({ onAddToCart, onOpenCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Review Form
  const [newAuthor, setNewAuthor] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Invoice download test state
  const [invoiceStatus, setInvoiceStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));

    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));

    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error(err));
  }, []);

  const categories = ['All', 'Security Software', 'Developer Hardware', 'CI/CD Tools', 'Audit Services'];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownloadInvoice = async (filename: string, mode: 'safe' | 'vulnerable' = 'safe') => {
    setInvoiceStatus(`Downloading ${filename} (Mode: ${mode})...`);
    try {
      const res = await fetch(`/api/invoices/download?file=${encodeURIComponent(filename)}&mode=${mode}`);
      if (!res.ok) {
        const errorData = await res.json();
        setInvoiceStatus(`Error: ${errorData.error || 'Download failed'} (Security notice: ${errorData.securityNotice})`);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      const notice = res.headers.get('X-Security-Notice') || 'Download completed successfully.';
      setInvoiceStatus(`Success: ${notice}`);
    } catch (err: any) {
      setInvoiceStatus(`Error: ${err.message}`);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: newAuthor,
          role: newRole,
          rating: newRating,
          comment: newComment
        })
      });

      if (res.ok) {
        const createdReview = await res.json();
        setReviews([createdReview, ...reviews]);
        setNewComment('');
        setNewAuthor('');
        setNewRole('');
      }
    } catch (err) {
      console.error('Failed to post review', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Store Hero Banner */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-xs">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Lock className="w-3 h-3" /> Production-Grade Dummy Application
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            DevSecOps Store & Invoice Portal
          </h1>
          <p className="text-zinc-600 text-sm leading-relaxed">
            A functional full-stack TypeScript application representing real customer order pipelines, dynamic invoice exports, and developer security tooling. Use this app to observe how Aikido AutoFix patches server controllers and how AutoShip passes continuous builds.
          </p>
        </div>
      </div>

      {/* Catalog & Filter Bar */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`filter-cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              id="search-products-input"
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              id={`product-card-${product.id}`}
              className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-md">
                    {product.category}
                  </span>
                  {product.badge && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {product.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-zinc-900 mb-1">{product.name}</h3>
                <p className="text-zinc-600 text-xs leading-relaxed mb-4">{product.description}</p>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 block font-mono">Price</span>
                  <span className="text-lg font-bold text-zinc-900 font-mono">${product.price}</span>
                </div>

                <button
                  id={`btn-add-to-cart-${product.id}`}
                  onClick={() => onAddToCart(product)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders & Invoices Portal Section */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Customer Orders & Invoices
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Demonstrates safe vs vulnerable backend invoice handling. Tests directory traversal guard and token generation.
            </p>
          </div>

          <div className="text-xs text-zinc-500 font-mono bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200">
            Storage: /data/invoices
          </div>
        </div>

        {invoiceStatus && (
          <div className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
            invoiceStatus.includes('Error')
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            <span>{invoiceStatus}</span>
            <button onClick={() => setInvoiceStatus(null)} className="font-bold underline ml-2">Close</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Invoice Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-mono">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-zinc-50/70 transition">
                  <td className="py-3.5 px-4 font-bold text-zinc-900">{ord.orderNumber}</td>
                  <td className="py-3.5 px-4 font-sans text-zinc-800">
                    <div>{ord.customerName}</div>
                    <div className="text-[11px] text-zinc-400">{ord.customerEmail}</div>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-500">{ord.date}</td>
                  <td className="py-3.5 px-4 font-bold text-zinc-900">${ord.total}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 font-sans">
                      <button
                        id={`btn-download-safe-${ord.id}`}
                        onClick={() => handleDownloadInvoice(ord.invoiceFile, 'safe')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition"
                        title="Download safely with AutoFix"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>

                      <button
                        id={`btn-download-traversal-test-${ord.id}`}
                        onClick={() => handleDownloadInvoice('../internal_confidential.txt', 'vulnerable')}
                        className="px-2 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-medium hover:bg-red-100 transition"
                        title="Simulate Path Traversal vulnerability check"
                      >
                        Test Traversal
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Reviews & XSS Test Section */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Customer Reviews & Feedback
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Evaluates client-side data rendering and XSS sanitization.
            </p>
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium">
            HTML Sanitized
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900">{rev.author}</span>
                    <span className="text-xs text-zinc-400">• {rev.role}</span>
                  </div>
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                <div className="text-xs text-zinc-700 leading-relaxed">
                  {rev.comment}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono pt-1">{rev.date}</div>
              </div>
            ))}
          </div>

          {/* Add Review Form */}
          <div className="lg:col-span-5 bg-zinc-50/70 rounded-xl p-4 border border-zinc-200">
            <h3 className="font-bold text-sm text-zinc-900 mb-3">Add Customer Review</h3>
            <form onSubmit={handleAddReview} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Your Name</label>
                <input
                  id="input-review-author"
                  type="text"
                  placeholder="e.g. Alex Chen"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Role / Organization</label>
                <input
                  id="input-review-role"
                  type="text"
                  placeholder="e.g. Lead Security Architect"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Rating</label>
                <select
                  id="select-review-rating"
                  value={newRating}
                  onChange={(e) => setNewRating(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white"
                >
                  <option value={5}>5 Stars - Outstanding</option>
                  <option value={4}>4 Stars - Great</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Needs Improvement</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Feedback / Comment</label>
                <textarea
                  id="textarea-review-comment"
                  rows={3}
                  placeholder="Share your experience with AutoShip CI pipelines..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white"
                />
              </div>

              <button
                id="btn-submit-review"
                type="submit"
                disabled={reviewSubmitting || !newComment.trim()}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 disabled:opacity-50 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Review</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
