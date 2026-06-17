'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Post, Category, Tag, ApiResponse, PaginatedResponse } from '@/types';
import Navbar from '@/components/ui/Navbar';
import { FileText, Globe, FileEdit, Pen, Trash2, Rocket, Tag as TagIcon, FolderOpen, X, Plus } from 'lucide-react';

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
        const params: Record<string, unknown> = { limit: 50 };
        if (!admin && currentUser?.id) params.authorId = currentUser.id;
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

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-150 h-100 bg-purple-600/8 rounded-full blur-[120px]" />
        </div>
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-175 h-125 bg-purple-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-125 h-100 bg-pink-600/6 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              {isAdmin && (
                <span className="text-xs px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-full">Admin</span>
              )}
            </div>
            <p className="text-white/40 text-sm">Welcome back, {user?.name}</p>
          </div>
          <Link
            href="/posts/new"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-purple-500/20"
          >
            <Pen size={14} />
            New Post
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {([
            { icon: <FileText size={18} />, label: 'Total Posts', value: posts.length, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
            { icon: <Globe size={18} />, label: 'Published', value: publishedCount, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
            { icon: <FileEdit size={18} />, label: 'Drafts', value: draftCount, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
          ] as const).map(({ icon, label, value, color, bg, border }) => (
            <div key={label} className={`backdrop-blur-sm ${bg} border ${border} rounded-xl p-5`}>
              <div className={`${color} mb-3`}>{icon}</div>
              <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
              <div className="text-xs text-white/40">{label}</div>
            </div>
          ))}
        </div>

        {/* Posts table */}
        <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
            <FileText size={14} className="text-purple-400" />
            <h2 className="text-sm font-medium text-white/80">
              {isAdmin ? 'All Posts' : 'My Posts'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-white/30 px-6 py-4">Title</th>
                  {isAdmin && (
                    <th className="text-left text-xs font-medium text-white/30 px-6 py-4">Author</th>
                  )}
                  <th className="text-left text-xs font-medium text-white/30 px-6 py-4">Status</th>
                  <th className="text-left text-xs font-medium text-white/30 px-6 py-4">Category</th>
                  <th className="text-left text-xs font-medium text-white/30 px-6 py-4">Views</th>
                  <th className="text-left text-xs font-medium text-white/30 px-6 py-4">Date</th>
                  <th className="text-left text-xs font-medium text-white/30 px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="text-center py-16 text-white/30 text-sm">
                      No posts yet.{' '}
                      <Link href="/posts/new" className="text-purple-400 hover:text-purple-300 transition underline">Create one</Link>
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="border-b border-white/5 hover:bg-white/3 transition">
                      <td className="px-6 py-4">
                        <Link href={`/blog/${post.slug}`} className="text-sm font-medium text-white/80 hover:text-purple-300 transition">
                          {post.title}
                        </Link>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-sm text-white/40">{post.author?.name}</td>
                      )}
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          post.status === 'published'
                            ? 'bg-green-500/20 text-green-400 border-green-500/20'
                            : post.status === 'draft'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
                            : 'bg-white/10 text-white/40 border-white/10'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/40">{post.category?.name ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-white/40">{post.viewCount}</td>
                      <td className="px-6 py-4 text-xs text-white/30">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link href={`/posts/${post.id}/edit`} className="text-xs text-white/40 hover:text-purple-300 transition flex items-center gap-1">
                            <Pen size={11} /> Edit
                          </Link>
                          {post.status === 'draft' && (
                            <button onClick={() => handlePublish(post.id)} className="text-xs text-white/40 hover:text-green-400 transition flex items-center gap-1">
                              <Rocket size={11} /> Publish
                            </button>
                          )}
                          <button onClick={() => handleDelete(post.id)} className="text-xs text-white/40 hover:text-red-400 transition flex items-center gap-1">
                            <Trash2 size={11} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin-only: Categories & Tags */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Categories */}
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <FolderOpen size={14} className="text-purple-400" />
                <h2 className="text-sm font-medium text-white/80">Categories</h2>
                <span className="ml-auto text-xs text-white/30">{categories.length}</span>
              </div>
              <form onSubmit={handleAddCategory} className="flex gap-2 mb-5">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category name"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 bg-purple-600/20 border border-purple-500/30 text-purple-300 px-3 py-2 rounded-lg text-sm hover:bg-purple-600/30 transition"
                >
                  <Plus size={13} /> Add
                </button>
              </form>
              <ul className="space-y-1">
                {categories.map((cat) => (
                  <li key={cat.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/5 transition group">
                    <div>
                      <span className="text-sm text-white/70">{cat.name}</span>
                      <span className="text-white/30 text-xs ml-2">/{cat.slug}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
                {categories.length === 0 && (
                  <li className="text-sm text-white/30 py-3">No categories yet.</li>
                )}
              </ul>
            </div>

            {/* Tags */}
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <TagIcon size={14} className="text-purple-400" />
                <h2 className="text-sm font-medium text-white/80">Tags</h2>
                <span className="ml-auto text-xs text-white/30">{tags.length}</span>
              </div>
              <form onSubmit={handleAddTag} className="flex gap-2 mb-5">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="New tag name"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 bg-purple-600/20 border border-purple-500/30 text-purple-300 px-3 py-2 rounded-lg text-sm hover:bg-purple-600/30 transition"
                >
                  <Plus size={13} /> Add
                </button>
              </form>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-1 bg-white/8 border border-white/10 rounded-full pl-3 pr-1.5 py-1 hover:border-red-500/30 transition">
                    <span className="text-xs text-white/60">{tag.name}</span>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="w-4 h-4 flex items-center justify-center rounded-full text-white/30 hover:text-red-400 hover:bg-red-500/10 transition"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {tags.length === 0 && (
                  <span className="text-sm text-white/30">No tags yet.</span>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
