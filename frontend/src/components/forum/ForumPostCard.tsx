import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ForumPost } from '../../types';

interface ForumPostCardProps {
  post: ForumPost;
  onViewDetails?: (postId: string) => void;
  onReport?: (postId: string) => void;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({ post, onViewDetails, onReport }) => {
  const { t, i18n } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return t('forum.time.justNow');
    if (diffHours < 24) return t('forum.time.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('forum.time.daysAgo', { count: diffDays });
    return date.toLocaleDateString(i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US');
  };

  return (
    <div
      onClick={() => onViewDetails?.(post.id)}
      className="cursor-pointer rounded-lg border border-gray-700 bg-gray-800 p-6 transition hover:border-green-500 hover:bg-gray-700"
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">{post.title}</h3>
          <p className="text-sm text-gray-500">
            {t('forum.byAuthor', { author: post.author_name })} · {formatDate(post.created_at)}
          </p>
        </div>
      </div>

      <p className="mb-4 line-clamp-3 text-gray-300">{post.content}</p>

      {post.hashtags && post.hashtags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {post.hashtags.map((tag) => (
            <span key={tag} className="inline-block rounded bg-gray-700 px-2 py-1 text-xs text-green-400">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-700 pt-4 text-sm text-gray-400">
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
          className="text-xs text-red-400 underline hover:text-red-300 hover:no-underline"
        >
          {t('forum.report')}
        </button>
      </div>
    </div>
  );
};

export default ForumPostCard;
