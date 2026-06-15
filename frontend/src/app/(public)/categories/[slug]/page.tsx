'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Post, Category, ApiResponse, PaginatedResponse } from '@/types';
import PostCard from '@/components/blog/PostCard';
import Navbar from '@/components/ui/Navbar';

export default function CategoryPage() {
  const { slug } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [catRes, postsRes] = await Promise.all([
          api.get<ApiResponse<Category>>(`/categories/slug/${slug}`),
          api.get<ApiResponse<PaginatedResponse<Post>>>('/posts', {
            params: { categorySlug: slug, status: 'published', limit: 20 },
          }),
        ]);
        setCategory(catRes.data.data);
        setPosts(postsRes.data.data.data);
      } catch {
        setCategory(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <Link href="/blog" className="text-sm text-gray-400 hover:text-black transition mb-6 block">
          ← All articles
        </Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="mb-10">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                {category?.name ?? 'Category'}
              </h1>
              {category?.description && (
                <p className="text-gray-500">{category.description}</p>
              )}
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-20 text-gray-400">No articles in this category.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
