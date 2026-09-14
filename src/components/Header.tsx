import React from 'react';
import { Shield, ShieldAlert, CheckCircle2, ShoppingBag, Terminal, BookOpen, GitPullRequest } from 'lucide-react';

interface HeaderProps {
  activeTab: 'playground' | 'store' | 'tests';
  setActiveTab: (tab: 'playground' | 'store' | 'tests') => void;
  onOpenGuide: () => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenGuide,
  cartCount,
  onOpenCart
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 tracking-tight text-lg">Aikido Test Lab</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> AutoShip Ready
                </span>
              </div>
              <p className="text-xs text-zinc-500 hidden sm:block">Benchmarking AutoFix SAST & AutoShip CI Merges</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-sm">
            <button
              id="nav-tab-playground"
              onClick={() => setActiveTab('playground')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'playground'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Security Lab</span>
            </button>

            <button
              id="nav-tab-store"
              onClick={() => setActiveTab('store')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'store'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              <span>E-Commerce App</span>
            </button>

            <button
              id="nav-tab-tests"
              onClick={() => setActiveTab('tests')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'tests'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Terminal className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">CI & Vitest</span>
              <span className="sm:hidden">CI</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-open-cart"
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-sm font-medium transition"
              title="View Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              id="btn-open-guide"
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Aikido Test Guide</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
