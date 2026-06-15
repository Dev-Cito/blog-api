'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Post, PaginatedResponse, ApiResponse } from '@/types';
import PostCard from '@/components/blog/PostCard';
import Navbar from '@/components/ui/Navbar';

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Articles</h1>
          <p className="text-gray-500">Latest posts from our blog</p>
        </div>

        <form onSubmit={handleSearch} className="mb-8 flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
          <button
            type="submit"
            className="bg-black text-white px-6 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition"
          >
            Search
          </button>
        </form>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No articles found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                  p === page
                    ? 'bg-black text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
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
