'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Post, ApiResponse } from '@/types';
import Navbar from '@/components/ui/Navbar';

export default function PostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get<ApiResponse<Post>>(`/posts/slug/${slug}`);
        setPost(res.data.data);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

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

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-400">Post not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/blog" className="text-sm text-gray-400 hover:text-black transition mb-6 block">
          ← Back to articles
        </Link>

        <div className="flex items-center gap-2 mb-4">
          {post.category && (
            <Link
              href={`/categories/${post.category.slug}`}
              className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full"
            >
              {post.category.name}
            </Link>
          )}
          {post.tags?.map((tag) => (
            <span key={tag.id} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {tag.name}
            </span>
          ))}
        </div>

        <h1 className="text-3xl font-semibold text-gray-900 mb-4">{post.title}</h1>

        <div className="flex items-center gap-3 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-600">
            {post.author?.name?.[0]?.toUpperCase()}
          </div>
          <span>{post.author?.name}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span>·</span>
          <span>{post.viewCount} views</span>
        </div>

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </main>
    </div>
  );
}
