'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Category, Tag, Post, ApiResponse } from '@/types';
import Navbar from '@/components/ui/Navbar';
import TagSelector from '@/components/ui/TagSelector';

const schema = z.object({
  title: z.string().min(3, 'Minimum 3 characters'),
  content: z.string().min(10, 'Minimum 10 characters'),
  excerpt: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  categoryId: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setError } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const init = async () => {
      try {
        if (!isAuthenticated) {
          const meRes = await api.get('/auth/me');
          setAuth(meRes.data.data);
        }
        const [postRes, catRes, tagRes] = await Promise.all([
          api.get<ApiResponse<Post>>(`/posts/${id}`),
          api.get<ApiResponse<Category[]>>('/categories'),
          api.get<ApiResponse<Tag[]>>('/tags'),
        ]);
        const post = postRes.data.data;
        setCategories(catRes.data.data);
        setTags(tagRes.data.data);
        setSelectedTags(post.tags?.map((t) => t.id) ?? []);
        reset({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt ?? '',
          status: post.status as any,
          categoryId: post.category?.id ?? '',
        });
      } catch {
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const onSubmit = async (data: FormData) => {
    try {
      await api.put(`/posts/${id}`, {
        ...data,
        tagIds: selectedTags,
        categoryId: data.categoryId || undefined,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError('root', { message: err.response?.data?.message ?? 'Failed to update post' });
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
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Post</h1>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-black transition">
            ← Back
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                {...register('title')}
                type="text"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <input
                {...register('excerpt')}
                type="text"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                {...register('content')}
                rows={12}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
              {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                {...register('categoryId')}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <TagSelector
                tags={tags}
                selectedIds={selectedTags}
                onTagsChange={setTags}
                onSelectionChange={setSelectedTags}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-red-600 text-sm">{errors.root.message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white rounded-lg py-3 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </main>
    </div>
  );
}
