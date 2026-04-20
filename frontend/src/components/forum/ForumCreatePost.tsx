import React, { useState } from 'react';
import { createForumPost } from '../../services/farm2vets';
import type { ForumPost, ForumPostCreate } from '../../types';

interface ForumCreatePostProps {
  onPostCreated?: (post: ForumPost) => void;
}

const ForumCreatePost: React.FC<ForumCreatePostProps> = ({ onPostCreated }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Parse hashtags
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

      // Get author info (in a real app, this would come from auth)
      const authorId = localStorage.getItem('user_id') || 'anonymous';
      const authorName = localStorage.getItem('user_name') || 'Anonymous Farmer';

      const newPost = await createForumPost(postData, authorId, authorName);
      onPostCreated?.(newPost);

      // Reset form
      setTitle('');
      setContent('');
      setHashtags('');
      setIsExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
      <div className="space-y-4">
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 text-left transition"
          >
            Share your farming experience...
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <textarea
              placeholder="Share your thoughts, questions, or experiences..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />

            <input
              type="text"
              placeholder="Add hashtags (e.g., #livestock #disease #tips)"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setTitle('');
                  setContent('');
                  setHashtags('');
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition disabled:opacity-50"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForumCreatePost;
