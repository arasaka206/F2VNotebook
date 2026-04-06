import React, { useEffect, useState } from 'react';
import { fetchForumPosts, searchForumPosts, fetchTrendingHashtags } from '../services/farm2vets';
import type { ForumPost, ForumHashtagTrend } from '../types';
import ForumPostCard from '../components/forum/ForumPostCard';
import ForumCreatePost from '../components/forum/ForumCreatePost';
import ForumPostDetailComponent from '../components/forum/ForumPostDetail';

const PublicDashboard: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [trendingTags, setTrendingTags] = useState<ForumHashtagTrend[]>([]);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'trending' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Load posts when page or sort changes
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        if (isSearching && searchQuery) {
          const result = await searchForumPosts(searchQuery, page, pageSize);
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

  // Load trending hashtags
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
    setIsSearching(query.length > 0);
  };

  const handlePostCreated = (newPost: ForumPost) => {
    setPosts([newPost, ...posts]);
    setTotalCount(totalCount + 1);
  };

  const handleHashtagClick = (tag: string) => {
    handleSearch(`#${tag}`);
  };

  if (selectedPost) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <button
          onClick={() => setSelectedPost(null)}
          className="mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
        >
          ← Back to Posts
        </button>
        <ForumPostDetailComponent postId={selectedPost} />
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex gap-6 p-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search and Sort */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6 space-y-4">
            <h1 className="text-2xl font-bold text-gray-100">Community Forum</h1>
            <p className="text-gray-400">Share experiences, ask questions, and connect with farmers</p>

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search posts or #hashtags..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'newest' | 'trending' | 'oldest');
                  setPage(1);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="newest">Newest</option>
                <option value="trending">Trending</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {/* Create Post Form */}
          <ForumCreatePost onPostCreated={handlePostCreated} />

          {/* Posts List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <span className="text-gray-400 animate-pulse">Loading posts...</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
                <p>No posts found. Be the first to share!</p>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <ForumPostCard
                    key={post.id}
                    post={post}
                    onViewDetails={() => setSelectedPost(post.id)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 pb-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, page - 2) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2 rounded ${
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
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-64 space-y-6">
          {/* Trending Hashtags */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Trending Topics</h3>
            <div className="space-y-2">
              {trendingTags.length === 0 ? (
                <p className="text-gray-500 text-sm">No trending topics yet</p>
              ) : (
                trendingTags.map((tag) => (
                  <button
                    key={tag.tag}
                    onClick={() => handleHashtagClick(tag.tag)}
                    className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition text-gray-300 text-sm flex justify-between"
                  >
                    <span>#{tag.tag}</span>
                    <span className="text-gray-500">{tag.count}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-3">💡 Tips</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Use #hashtags to organize topics</li>
              <li>• React to posts you find helpful</li>
              <li>• Share your farming experiences</li>
              <li>• Ask for advice from the community</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;
