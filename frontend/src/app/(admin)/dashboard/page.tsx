'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Post, Category, Tag, ApiResponse, PaginatedResponse } from '@/types';
import Navbar from '@/components/ui/Navbar';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        let currentUser = user;
        if (!isAuthenticated) {
          const meRes = await api.get('/auth/me');
          setAuth(meRes.data.data);
          currentUser = meRes.data.data;
        }

        const admin = currentUser?.role === 'admin';
        setIsAdmin(admin);

        const params: Record<string, any> = { limit: 50 };
        if (!admin && currentUser?.id) {
          params.authorId = currentUser.id;
        }

        const postsRes = await api.get<ApiResponse<PaginatedResponse<Post>>>('/posts', { params });
        setPosts(postsRes.data.data.data);

        if (admin) {
          const [catRes, tagRes] = await Promise.all([
            api.get<ApiResponse<Category[]>>('/categories'),
            api.get<ApiResponse<Tag[]>>('/tags'),
          ]);
          setCategories(catRes.data.data);
          setTags(tagRes.data.data);
        }
      } catch {
        clearAuth();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Failed to delete post');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const res = await api.patch(`/posts/${id}/publish`);
      setPosts((prev) => prev.map((p) => p.id === id ? res.data.data : p));
    } catch {
      alert('Failed to publish post');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      const res = await api.post<ApiResponse<Category>>('/categories', { name: newCategory.trim() });
      setCategories((prev) => [...prev, res.data.data]);
      setNewCategory('');
    } catch {
      alert('Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Failed to delete category');
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    try {
      const res = await api.post<ApiResponse<Tag>>('/tags', { name: newTag.trim() });
      setTags((prev) => [...prev, res.data.data]);
      setNewTag('');
    } catch {
      alert('Failed to create tag');
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Delete this tag?')) return;
    try {
      await api.delete(`/tags/${id}`);
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert('Failed to delete tag');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              {isAdmin && (
                <span className="text-xs px-2 py-0.5 bg-black text-white rounded-full">Admin</span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name}</p>
          </div>
          <Link
            href="/posts/new"
            className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            + New Post
          </Link>
        </div>

        {/* Posts table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-10">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-700">
              {isAdmin ? 'All Posts' : 'My Posts'}
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">Title</th>
                {isAdmin && (
                  <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">Author</th>
                )}
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">Status</th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">Category</th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">Views</th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">Date</th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="text-center py-12 text-gray-400 text-sm">
                    No posts yet.{' '}
                    <Link href="/posts/new" className="text-black underline">Create one</Link>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <Link href={`/blog/${post.slug}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition">
                        {post.title}
                      </Link>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-sm text-gray-500">{post.author?.name}</td>
                    )}
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        post.status === 'published'
                          ? 'bg-green-50 text-green-600'
                          : post.status === 'draft'
                          ? 'bg-yellow-50 text-yellow-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{post.category?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{post.viewCount}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/posts/${post.id}/edit`} className="text-xs text-blue-600 hover:underline">
                          Edit
                        </Link>
                        {post.status === 'draft' && (
                          <button onClick={() => handlePublish(post.id)} className="text-xs text-green-600 hover:underline">
                            Publish
                          </button>
                        )}
                        <button onClick={() => handleDelete(post.id)} className="text-xs text-red-500 hover:underline">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Admin-only: Categories & Tags management */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Categories */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-sm font-medium text-gray-700 mb-4">Categories</h2>
              <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category name"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
                >
                  Add
                </button>
              </form>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <span className="text-gray-800">{cat.name}</span>
                      <span className="text-gray-400 text-xs ml-2">/{cat.slug}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition"
                    >
                      Delete
                    </button>
                  </li>
                ))}
                {categories.length === 0 && (
                  <li className="text-sm text-gray-400">No categories yet.</li>
                )}
              </ul>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-sm font-medium text-gray-700 mb-4">Tags</h2>
              <form onSubmit={handleAddTag} className="flex gap-2 mb-4">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="New tag name"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
                >
                  Add
                </button>
              </form>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-1 bg-gray-100 rounded-full pl-3 pr-1 py-1">
                    <span className="text-xs text-gray-700">{tag.name}</span>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="w-4 h-4 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-300 hover:text-gray-700 transition text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {tags.length === 0 && (
                  <span className="text-sm text-gray-400">No tags yet.</span>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
