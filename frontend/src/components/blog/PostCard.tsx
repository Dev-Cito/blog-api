import Link from 'next/link';
import { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white rounded-xl border border-gray-100 p-6 hover:border-gray-200 transition">
      <div className="flex items-center gap-2 mb-3">
        {post.category && (
          <Link
            href={`/categories/${post.category.slug}`}
            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition"
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

      <Link href={`/blog/${post.slug}`}>
        <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition mb-2">
          {post.title}
        </h2>
      </Link>

      {post.excerpt && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{post.excerpt}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
            {post.author?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <span>{post.author?.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span>{post.viewCount} views</span>
        </div>
      </div>
    </article>
  );
}
