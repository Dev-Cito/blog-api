'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/blog" className="text-xl font-semibold text-gray-900">
          Blog
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/blog" className="text-sm text-gray-600 hover:text-black transition">
            Articles
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black transition">
                Dashboard
              </Link>
              <span className="text-sm text-gray-400">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-black transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-black transition">
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
