import React, { useEffect, useState } from 'react';
import { fetchForumPostDetail, addForumComment, reactToForumPost, deleteForumComment } from '../../services/farm2vets';
import type { ForumPostDetail } from '../../types';

interface ForumPostDetailProps {
  postId: string;
}

const ForumPostDetailView: React.FC<ForumPostDetailProps> = ({ postId }) => {
  const [post, setPost] = useState<ForumPostDetail | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const data = await fetchForumPostDetail(postId);
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !post) return;

    try {
      setSubmittingComment(true);
      const authorId = localStorage.getItem('user_id') || 'anonymous';
      const authorName = localStorage.getItem('user_name') || 'Anonymous Farmer';

      const newComment = await addForumComment(post.id, commentContent, authorId, authorName);

      setPost({
        ...post,
        comments: [...post.comments, newComment],
        comment_count: post.comment_count + 1,
      });
      setCommentContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;
    try {
      await deleteForumComment(commentId);
      setPost({
        ...post,
        comments: post.comments.filter((c) => c.id !== commentId),
        comment_count: Math.max(0, post.comment_count - 1),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  };

  const handleReact = async () => {
    if (!post) return;
    try {
      const userId = localStorage.getItem('user_id') || 'anonymous';
      const result = await reactToForumPost(post.id, 'like', userId);
      setPost({
        ...post,
        reaction_count: result.reaction_count,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to react');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="text-gray-400 animate-pulse">Loading post...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
        <p>Post not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Post */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h1 className="text-2xl font-bold text-gray-100 mb-2">{post.title}</h1>
        <p className="text-sm text-gray-500 mb-4">
          by <span className="text-green-400">{post.author_name}</span> • {formatDate(post.created_at)}
        </p>

        <p className="text-gray-300 mb-6 whitespace-pre-wrap">{post.content}</p>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.hashtags.map((tag) => (
              <span key={tag} className="inline-block px-3 py-1 bg-gray-700 text-green-400 text-sm rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex gap-6 pt-4 border-t border-gray-700">
          <button
            onClick={handleReact}
            className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition"
          >
            <span>👍</span>
            <span>{post.reaction_count}</span>
          </button>
          <div className="flex items-center gap-2 text-gray-400">
            <span>💬</span>
            <span>{post.comment_count}</span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-200">{post.comments.length} Comments</h2>

        {/* Comment Form */}
        <form onSubmit={handleAddComment} className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-4">
          <textarea
            placeholder="Share your thoughts..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingComment || !commentContent.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition disabled:opacity-50"
            >
              {submittingComment ? 'Posting...' : 'Comment'}
            </button>
          </div>
        </form>

        {/* Comments List */}
        {post.comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-850 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-200">{comment.author_name}</p>
                    <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>

                <p className="text-gray-300 mb-3 whitespace-pre-wrap">{comment.content}</p>

                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span>👍 {comment.reaction_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPostDetailView;
