import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchForumPostDetail, addForumComment, reactToForumPost, deleteForumComment } from '../../services/farm2vets';
import type { ForumPostDetail } from '../../types';

interface ForumPostDetailProps {
  postId: string;
}

const ForumPostDetailView: React.FC<ForumPostDetailProps> = ({ postId }) => {
  const { t, i18n } = useTranslation();
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
        setError(err instanceof Error ? err.message : t('forum.detail.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId, t]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !post) return;

    try {
      setSubmittingComment(true);
      const authorId = localStorage.getItem('user_id') || 'anonymous';
      const authorName = localStorage.getItem('user_name') || t('forum.anonymousFarmer');

      const newComment = await addForumComment(post.id, commentContent, authorId, authorName);

      setPost({
        ...post,
        comments: [...post.comments, newComment],
        comment_count: post.comment_count + 1,
      });
      setCommentContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('forum.detail.addCommentError'));
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
      setError(err instanceof Error ? err.message : t('forum.detail.deleteCommentError'));
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
      setError(err instanceof Error ? err.message : t('forum.detail.reactError'));
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString(i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US');

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="animate-pulse text-gray-400">{t('forum.detail.loadingPost')}</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="rounded-lg bg-gray-800 p-8 text-center text-gray-400">
        <p>{t('forum.detail.postNotFound')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-100">{post.title}</h1>
        <p className="mb-4 text-sm text-gray-500">
          {t('forum.byAuthor', { author: post.author_name })} · {formatDate(post.created_at)}
        </p>

        <p className="mb-6 whitespace-pre-wrap text-gray-300">{post.content}</p>

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {post.hashtags.map((tag) => (
              <span key={tag} className="inline-block rounded bg-gray-700 px-3 py-1 text-sm text-green-400">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-6 border-t border-gray-700 pt-4">
          <button
            onClick={handleReact}
            className="flex items-center gap-2 text-gray-400 transition hover:text-green-400"
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

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-200">
          {t('forum.detail.comments', { count: post.comments.length })}
        </h2>

        <form onSubmit={handleAddComment} className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-6">
          <textarea
            placeholder={t('forum.detail.commentPlaceholder')}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            rows={3}
            className="w-full resize-none rounded bg-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingComment || !commentContent.trim()}
              className="rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {submittingComment ? t('forum.posting') : t('forum.detail.comment')}
            </button>
          </div>
        </form>

        {post.comments.length === 0 ? (
          <p className="py-8 text-center text-gray-500">{t('forum.detail.noComments')}</p>
        ) : (
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-200">{comment.author_name}</p>
                    <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    {t('common.delete')}
                  </button>
                </div>

                <p className="mb-3 whitespace-pre-wrap text-gray-300">{comment.content}</p>

                <div className="flex items-center gap-2 text-sm text-gray-400">
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
