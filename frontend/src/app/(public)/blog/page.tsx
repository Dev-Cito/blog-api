'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Post, PaginatedResponse, ApiResponse } from '@/types';
import PostCard from '@/components/blog/PostCard';
import Navbar from '@/components/ui/Navbar';
import { Search } from 'lucide-react';

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchPosts = async (p: number, s: string) => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<PaginatedResponse<Post>>>('/posts', {
        params: { page: p, limit: 9, status: 'published', search: s || undefined },
      });
      setPosts(res.data.data.data);
      setMeta(res.data.data.meta);
    } catch {
      // silently show empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page, search);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts(1, search);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-175 h-125 bg-purple-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-125 h-100 bg-pink-600/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 bg-blue-600/4 rounded-full blur-[80px]" />
      </div>

      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-500/20 rounded-full text-purple-300 text-xs mb-4">
            Latest Articles
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Stories worth{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">
              reading
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-lg mx-auto">
            Explore ideas, tutorials, and perspectives from our community of writers.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-12 max-w-xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition shadow-lg shadow-purple-500/20"
          >
            Search
          </button>
        </form>

        {/* Posts grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-white/20 text-5xl mb-4">✍️</div>
            <p className="text-white/40 text-sm">No articles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                  p === page
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
