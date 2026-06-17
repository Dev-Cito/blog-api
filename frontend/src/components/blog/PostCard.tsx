import Link from 'next/link';
import { Post } from '@/types';
import { Eye, Calendar } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="group relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 hover:border-purple-500/30 transition-all duration-300">
      <div className="absolute inset-0 rounded-xl bg-linear-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/5 group-hover:to-pink-600/5 transition-all duration-300 pointer-events-none" />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {post.category && (
            <Link
              href={`/categories/${post.category.slug}`}
              className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-full hover:bg-purple-500/30 transition"
            >
              {post.category.name}
            </Link>
          )}
          {post.tags?.map((tag) => (
            <span key={tag.id} className="text-xs px-2 py-0.5 bg-white/10 text-white/50 border border-white/10 rounded-full">
              {tag.name}
            </span>
          ))}
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-base font-semibold text-white hover:text-purple-300 transition mb-2 line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {post.excerpt && (
          <p className="text-sm text-white/50 line-clamp-2 mb-5">{post.excerpt}</p>
        )}

        <div className="flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-600/20 border border-purple-500/20 flex items-center justify-center font-medium text-purple-300 text-xs">
              {post.author?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <span className="text-white/50">{post.author?.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={11} />
              {post.viewCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
