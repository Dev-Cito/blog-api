'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Pen, LayoutDashboard, LogOut, LogIn, UserPlus, BookOpen, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0f]/80 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/blog" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center group-hover:bg-purple-600/30 transition">
            <Pen size={14} className="text-purple-400" />
          </div>
          <span className="text-white font-semibold text-lg">Blog</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/blog" className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition">
            <BookOpen size={14} />
            Articles
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition">
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
              <Link
                href="/posts/new"
                className="flex items-center gap-1.5 text-sm bg-purple-600/20 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-600/30 hover:text-purple-200 transition"
              >
                <Pen size={14} />
                Write
              </Link>
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                  <span className="text-xs font-medium text-purple-300">{user?.name?.[0]?.toUpperCase()}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-white/40 hover:text-red-400 transition"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition">
                <LogIn size={14} />
                Login
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition shadow-lg shadow-purple-500/20"
              >
                <UserPlus size={14} />
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/60 hover:text-white transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-6 py-4 space-y-3 backdrop-blur-md bg-[#0a0a0f]/90">
          <Link href="/blog" className="block text-sm text-white/60 hover:text-white py-2 transition">Articles</Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="block text-sm text-white/60 hover:text-white py-2 transition">Dashboard</Link>
              <Link href="/posts/new" className="block text-sm text-purple-300 hover:text-purple-200 py-2 transition">+ Write</Link>
              <button onClick={handleLogout} className="block w-full text-left text-sm text-white/40 hover:text-red-400 py-2 transition">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-sm text-white/60 hover:text-white py-2 transition">Login</Link>
              <Link href="/register" className="block text-sm text-purple-300 hover:text-purple-200 py-2 transition">Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
