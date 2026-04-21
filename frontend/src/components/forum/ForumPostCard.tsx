import React from 'react';
import type { ForumPost } from '../../types';

interface ForumPostCardProps {
  post: ForumPost;
  onViewDetails?: (postId: string) => void;
  onReport?: (postId: string) => void;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({ post, onViewDetails, onReport }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={() => onViewDetails?.(post.id)}
      className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition cursor-pointer border border-gray-700 hover:border-green-500"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">{post.title}</h3>
          <p className="text-sm text-gray-500">
            by <span className="text-green-400">{post.author_name}</span> • {formatDate(post.created_at)}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-300 mb-4 line-clamp-3">{post.content}</p>

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.hashtags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-1 bg-gray-700 text-green-400 text-xs rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-400 border-t border-gray-700 pt-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span>👍</span>
            <span>{post.reaction_count}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💬</span>
            <span>{post.comment_count}</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReport?.(post.id);
          }}
          className="text-red-400 hover:text-red-300 text-xs underline hover:no-underline"
        >
          Report
        </button>
      </div>
    </div>
  );
};

export default ForumPostCard;
