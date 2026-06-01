import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { fetchForumPosts, searchForumPosts, fetchTrendingHashtags } from '../services/farm2vets';
import type { ForumPost, ForumHashtagTrend } from '../types';
import ForumPostCard from '../components/forum/ForumPostCard';
import ForumCreatePost from '../components/forum/ForumCreatePost';
import ForumPostDetailComponent from '../components/forum/ForumPostDetail';

const REGIONAL_SEARCH_SUGGESTIONS = [
  {
    queryKey: 'forum.regionalSuggestions.asf.query',
    descriptionKey: 'forum.regionalSuggestions.asf.description',
    countKey: 'forum.regionalSuggestions.asf.count',
  },
  {
    queryKey: 'forum.regionalSuggestions.lamDong.query',
    descriptionKey: 'forum.regionalSuggestions.lamDong.description',
    countKey: 'forum.regionalSuggestions.lamDong.count',
  },
  {
    queryKey: 'forum.regionalSuggestions.avianFlu.query',
    descriptionKey: 'forum.regionalSuggestions.avianFlu.description',
    countKey: 'forum.regionalSuggestions.avianFlu.count',
  },
  {
    queryKey: 'forum.regionalSuggestions.vaccine.query',
    descriptionKey: 'forum.regionalSuggestions.vaccine.description',
    countKey: 'forum.regionalSuggestions.vaccine.count',
  },
];

interface PublicDashboardProps {
  composerRef?: React.RefObject<HTMLDivElement | null>;
  regionalSearchRef?: React.RefObject<HTMLDivElement | null>;
  feedRef?: React.RefObject<HTMLDivElement | null>;
}

const PublicDashboard: React.FC<PublicDashboardProps> = ({ composerRef, regionalSearchRef, feedRef }) => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [trendingTags, setTrendingTags] = useState<ForumHashtagTrend[]>([]);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'trending' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const handleReport = async (postId: string) => {
    const reason = window.prompt(t('forum.reportPrompt'));
    if (!reason) return;

    try {
      await api.post('/public-dashboard/reports', {
        target_type: 'post',
        target_id: postId,
        reporter_id: 'user-123',
        reason: 'Inappropriate content',
        description: reason
      });
      window.alert(t('forum.reportSuccess'));
    } catch (error) {
      console.error('Failed to submit report:', error);
      window.alert(t('forum.reportError'));
    }
  };

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        if (isSearching && searchQuery.trim()) {
          const result = await searchForumPosts(searchQuery.trim(), page, pageSize);
          setPosts(result.posts);
          setTotalCount(result.total_count);
        } else {
          const result = await fetchForumPosts(page, pageSize, sortBy);
          setPosts(result.posts);
          setTotalCount(result.total_count);
        }
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [page, sortBy, searchQuery, isSearching]);

  useEffect(() => {
    const loadTrendingTags = async () => {
      try {
        const tags = await fetchTrendingHashtags(10);
        setTrendingTags(tags);
      } catch (err) {
        console.error('Failed to load trending hashtags:', err);
      }
    };

    loadTrendingTags();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    setIsSearching(query.trim().length > 0);
  };

  const handlePostCreated = (newPost: ForumPost) => {
    setPosts([newPost, ...posts]);
    setTotalCount(totalCount + 1);
  };

  const handleHashtagClick = (tag: string) => {
    handleSearch(`#${tag}`);
  };

  const handleSuggestionClick = (query: string) => {
    handleSearch(query);
    setShowSuggestions(false);
  };

  if (selectedPost) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <button
          onClick={() => setSelectedPost(null)}
          className="mb-4 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
        >
          {t('forum.backToPosts')}
        </button>
        <ForumPostDetailComponent postId={selectedPost} />
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex gap-6 p-6">
        <div className="min-w-0 flex-1">
          <div className="mb-6 space-y-4 rounded-lg bg-gray-800 p-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">{t('forum.title')}</h1>
              <p className="text-gray-400">{t('forum.subtitle')}</p>
            </div>

            <div className="flex justify-end">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'newest' | 'trending' | 'oldest');
                  setPage(1);
                }}
                className="rounded bg-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label={t('forum.sortLabel')}
              >
                <option value="newest">{t('forum.sort.newest')}</option>
                <option value="trending">{t('forum.sort.trending')}</option>
                <option value="oldest">{t('forum.sort.oldest')}</option>
              </select>
            </div>
          </div>

          {isSearching && (
            <div className="mb-6 flex items-center justify-between rounded-lg border border-farm-border bg-farm-card p-4 text-sm">
              <span className="text-farm-text">{t('forum.searchingFor', { query: searchQuery })}</span>
              <button
                type="button"
                onClick={() => handleSearch('')}
                className="font-semibold text-green-400 hover:text-green-300"
              >
                {t('forum.clearSearch')}
              </button>
            </div>
          )}

          <div ref={composerRef}>
            <ForumCreatePost onPostCreated={handlePostCreated} />
          </div>

          <div ref={feedRef} className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <span className="animate-pulse text-gray-400">{t('forum.loadingPosts')}</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-lg bg-gray-800 p-8 text-center text-gray-400">
                <p>{t('forum.noPosts')}</p>
              </div>
            ) : (
              posts.map((post) => (
                <ForumPostCard
                  key={post.id}
                  post={post}
                  onViewDetails={() => setSelectedPost(post.id)}
                  onReport={handleReport}
                />
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2 pb-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded bg-gray-700 px-4 py-2 text-gray-300 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('common.previous')}
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, page - 2) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`rounded px-4 py-2 ${
                      pageNum === page
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="rounded bg-gray-700 px-4 py-2 text-gray-300 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </div>

        <aside className="w-72 flex-shrink-0 space-y-6">
          <div ref={regionalSearchRef} className="rounded-lg bg-gray-800 p-4">
            <h3 className="mb-2 text-lg font-semibold text-gray-200">{t('forum.regionalSearchTitle')}</h3>
            <p className="mb-4 text-xs text-gray-400">{t('forum.regionalSearchSubtitle')}</p>
            <div className="relative">
              <input
                type="text"
                placeholder={t('forum.searchPlaceholder')}
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => window.setTimeout(() => setShowSuggestions(false), 160)}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded bg-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {showSuggestions && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-farm-border bg-farm-card shadow-xl">
                  {REGIONAL_SEARCH_SUGGESTIONS.map((suggestion) => {
                    const query = t(suggestion.queryKey);
                    return (
                      <button
                        key={suggestion.queryKey}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSuggestionClick(query)}
                        className="w-full border-b border-farm-border px-4 py-3 text-left last:border-b-0 hover:bg-farm-border/30"
                      >
                        <div className="text-sm font-semibold text-farm-text">{query}</div>
                        <div className="mt-1 text-xs text-gray-400">{t(suggestion.descriptionKey)}</div>
                        <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-green-400">
                          {t(suggestion.countKey)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-gray-800 p-4">
            <h3 className="mb-4 text-lg font-semibold text-gray-200">{t('forum.trendingTopics')}</h3>
            <div className="space-y-2">
              {trendingTags.length === 0 ? (
                <p className="text-sm text-gray-500">{t('forum.noTrendingTopics')}</p>
              ) : (
                trendingTags.map((tag) => (
                  <button
                    key={tag.tag}
                    onClick={() => handleHashtagClick(tag.tag)}
                    className="flex w-full justify-between rounded bg-gray-700 px-3 py-2 text-left text-sm text-gray-300 transition hover:bg-gray-600"
                  >
                    <span>#{tag.tag}</span>
                    <span className="text-gray-500">{tag.count}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg bg-gray-800 p-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-200">{t('forum.tipsTitle')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>{t('forum.tips.useHashtags')}</li>
              <li>{t('forum.tips.reactHelpful')}</li>
              <li>{t('forum.tips.shareExperience')}</li>
              <li>{t('forum.tips.askAdvice')}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PublicDashboard;
