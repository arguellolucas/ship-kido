import React, { useState } from 'react';
import { Header } from './components/Header';
import { SecurityPlayground } from './components/SecurityPlayground';
import { Storefront } from './components/Storefront';
import { CiTestRunner } from './components/CiTestRunner';
import { CartDrawer } from './components/CartDrawer';
import { AikidoIntegrationGuideModal } from './components/AikidoIntegrationGuideModal';
import { Product, OrderItem } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'playground' | 'store' | 'tests'>('playground');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [cartItems, setCartItems] = useState<(OrderItem & { product: Product })[]>([]);

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1, product }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as (OrderItem & { product: Product })[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGuide={() => setIsGuideOpen(true)}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'playground' && <SecurityPlayground />}
        {activeTab === 'store' && (
          <Storefront
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}
        {activeTab === 'tests' && <CiTestRunner />}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900">Aikido AutoShip & AutoFix Lab</span>
            <span>•</span>
            <span>Valid full-stack testbed for SAST, SCA, and CI auto-merging</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-zinc-700 hover:text-zinc-900 font-medium underline"
            >
              How to test in Aikido
            </button>
            <a
              href="https://aikido.dev"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-900 font-medium"
            >
              Aikido Security ↗
            </a>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOrderCompleted={() => {
          setCartItems([]);
          setIsCartOpen(false);
          setActiveTab('store');
        }}
      />

      {/* Aikido Step-by-Step Testing Guide Modal */}
      <AikidoIntegrationGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
