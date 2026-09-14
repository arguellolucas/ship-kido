import React, { useState } from 'react';
import { X, Trash2, ShieldCheck, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Product, OrderItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: (OrderItem & { product: Product })[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onOrderCompleted: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onOrderCompleted
}) => {
  const [customerName, setCustomerName] = useState('Alex Rivera');
  const [customerEmail, setCustomerEmail] = useState('alex.rivera@devsecops.io');
  const [cryptoMode, setCryptoMode] = useState<'safe' | 'vulnerable'>('safe');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    setOrderFeedback(null);

    try {
      const payload = {
        customerName,
        customerEmail,
        items: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity })),
        cryptoMode
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const order = await res.json();
        setOrderFeedback(`Order ${order.orderNumber} placed successfully! Tracking Code: ${order.trackingCode}`);
        setTimeout(() => {
          onOrderCompleted();
        }, 1200);
      } else {
        const err = await res.json();
        setOrderFeedback(`Order error: ${err.error}`);
      }
    } catch (err: any) {
      setOrderFeedback(`Failed to checkout: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-zinc-200">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">Your Cart ({cartItems.length})</h2>
          <button
            id="btn-close-cart"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-sm">
              Your cart is empty. Add security tools from the catalog.
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <div className="flex-1">
                    <div className="font-semibold text-xs text-zinc-900">{item.name}</div>
                    <div className="text-xs text-zinc-500 font-mono">${item.price} each</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.productId, -1)}
                      className="w-6 h-6 rounded-md bg-white border border-zinc-200 text-xs font-bold flex items-center justify-center text-zinc-700 hover:bg-zinc-100"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-bold text-zinc-900 px-1">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.productId, 1)}
                      className="w-6 h-6 rounded-md bg-white border border-zinc-200 text-xs font-bold flex items-center justify-center text-zinc-700 hover:bg-zinc-100"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.productId)}
                      className="text-red-500 hover:text-red-700 p-1 ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="border-t border-zinc-200 pt-4 flex items-center justify-between font-mono">
                <span className="text-sm font-semibold text-zinc-700">Total</span>
                <span className="text-xl font-bold text-zinc-900">${total}</span>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-zinc-200 text-xs">
                <h3 className="font-bold text-zinc-900 text-sm">Customer & Security Config</h3>

                <div>
                  <label className="block text-zinc-600 font-medium mb-1">Customer Name</label>
                  <input
                    id="cart-customer-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-300"
                  />
                </div>

                <div>
                  <label className="block text-zinc-600 font-medium mb-1">Receipt Email</label>
                  <input
                    id="cart-customer-email"
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-300"
                  />
                </div>

                {/* Crypto RNG Mode for AutoFix Demo */}
                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 space-y-2">
                  <span className="font-semibold text-zinc-800 block">Order Token Generator Mode:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCryptoMode('vulnerable')}
                      className={`p-2 rounded-lg text-center font-medium border text-[11px] transition ${
                        cryptoMode === 'vulnerable'
                          ? 'bg-red-50 border-red-300 text-red-800 font-bold'
                          : 'bg-white border-zinc-200 text-zinc-600'
                      }`}
                    >
                      Math.random() (Weak)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCryptoMode('safe')}
                      className={`p-2 rounded-lg text-center font-medium border text-[11px] transition ${
                        cryptoMode === 'safe'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                          : 'bg-white border-zinc-200 text-zinc-600'
                      }`}
                    >
                      crypto.randomBytes (AutoFix)
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    {cryptoMode === 'safe'
                      ? 'Secure CSPRNG with 128-bit entropy (passes Aikido SAST).'
                      : 'Predictable pseudo-random generator (flagged by Aikido SAST as CWE-330).'}
                  </p>
                </div>

                {orderFeedback && (
                  <div className={`p-3 rounded-lg text-xs ${
                    orderFeedback.includes('error') ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'
                  }`}>
                    {orderFeedback}
                  </div>
                )}

                <button
                  id="btn-submit-checkout"
                  type="submit"
                  disabled={isSubmitting || cartItems.length === 0}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Complete Order & Generate Invoice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
