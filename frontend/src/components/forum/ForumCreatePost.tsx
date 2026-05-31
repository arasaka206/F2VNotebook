import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createForumPost } from '../../services/farm2vets';
import type { ForumPost, ForumPostCreate } from '../../types';

interface ForumCreatePostProps {
  onPostCreated?: (post: ForumPost) => void;
}

const ForumCreatePost: React.FC<ForumCreatePostProps> = ({ onPostCreated }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError(t('forum.validation.titleContentRequired'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tagArray = hashtags
        .split(' ')
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.startsWith('#') || tag.length > 0)
        .map((tag) => (tag.startsWith('#') ? tag.slice(1) : tag));

      const postData: ForumPostCreate = {
        title: title.trim(),
        content: content.trim(),
        hashtags: tagArray,
      };

      const authorId = localStorage.getItem('user_id') || 'anonymous';
      const authorName = localStorage.getItem('user_name') || t('forum.anonymousFarmer');

      const newPost = await createForumPost(postData, authorId, authorName);
      onPostCreated?.(newPost);

      setTitle('');
      setContent('');
      setHashtags('');
      setIsExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('forum.createPostError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800 p-6">
      <div className="space-y-4">
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full rounded bg-gray-700 px-4 py-3 text-left text-gray-300 transition hover:bg-gray-600"
          >
            {t('forum.shareExperiencePlaceholder')}
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder={t('forum.postTitlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded bg-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <textarea
              placeholder={t('forum.postContentPlaceholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full resize-none rounded bg-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <input
              type="text"
              placeholder={t('forum.hashtagPlaceholder')}
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full rounded bg-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setTitle('');
                  setContent('');
                  setHashtags('');
                  setError(null);
                }}
                className="rounded bg-gray-700 px-4 py-2 text-gray-300 transition hover:bg-gray-600"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? t('forum.posting') : t('forum.post')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForumCreatePost;
