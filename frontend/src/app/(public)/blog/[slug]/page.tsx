'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Post, ApiResponse } from '@/types';
import Navbar from '@/components/ui/Navbar';
import { ArrowLeft, Eye, Calendar } from 'lucide-react';

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

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Navbar />
        <div className="text-center py-20">
          <div className="text-white/20 text-5xl mb-4">📄</div>
          <p className="text-white/40">Post not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-150 h-100 bg-purple-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-100 h-75 bg-pink-600/6 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition mb-8">
          <ArrowLeft size={14} />
          Back to articles
        </Link>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {post.category && (
            <Link
              href={`/categories/${post.category.slug}`}
              className="text-xs px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-full hover:bg-purple-500/30 transition"
            >
              {post.category.name}
            </Link>
          )}
          {post.tags?.map((tag) => (
            <span key={tag.id} className="text-xs px-2.5 py-1 bg-white/10 text-white/50 border border-white/10 rounded-full">
              {tag.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">{post.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-5 text-sm text-white/40 mb-10 pb-8 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/20 flex items-center justify-center font-medium text-purple-300 text-sm">
              {post.author?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-white/60">{post.author?.name}</span>
          </div>
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye size={13} />
            {post.viewCount} views
          </span>
        </div>

        {/* Content */}
        <div className="text-white/75 leading-relaxed whitespace-pre-wrap text-base">
          {post.content}
        </div>
      </main>
    </div>
  );
}
