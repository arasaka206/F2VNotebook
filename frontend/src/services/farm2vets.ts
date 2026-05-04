import api from './api';
import type {
  DashboardSummary,
  Livestock,
  Treatment,
  Vet,
  Consult,
  ConsultRequest,
  TokenResponse,
  HeatmapData,
  HeatmapSummary,
  ForumPost,
  ForumPostCreate,
  ForumPostDetail,
  ForumComment,
  ForumSearchResult,
  ForumHashtagTrend,
  ReactionType,
} from '../types';

// ── Auth ──────────────────────────────────────────────────────────────────
export const login = async (username: string, password: string): Promise<TokenResponse> => {
  const { data } = await api.post<TokenResponse>('/auth/login', { username, password });
  return data;
};

// ── Dashboard ─────────────────────────────────────────────────────────────
export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const { data } = await api.get<DashboardSummary>('/dashboard/summary');
  return data;
};

// ── Livestock ─────────────────────────────────────────────────────────────
export const fetchLivestock = async (): Promise<Livestock[]> => {
  const { data } = await api.get<Livestock[]>('/livestock/');
  return data;
};

// ── Treatments ────────────────────────────────────────────────────────────
export const fetchActiveTreatments = async (): Promise<Treatment[]> => {
  const { data } = await api.get<Treatment[]>('/treatments/', {
    params: { status_filter: 'active' },
  });
  return data;
};

// ── Sensors ───────────────────────────────────────────────────────────────
export const fetchLatestSensor = async (): Promise<any> => {
  const { data } = await api.get('/sensors/latest');
  return data;
};

export const fetchSensorAggregate = async (
  barn_id: string,
  window_hours: number = 24
): Promise<any> => {
  const { data } = await api.get('/sensors/aggregate', {
    params: { barn_id, window_hours }
  });
  return data;
};

export const ingestSensorData = async (payload: {
  barn_id: string;
  temperature_c?: number;
  humidity_pct?: number;
  ammonia_ppm?: number;
}): Promise<any> => {
  const { data } = await api.post('/sensors/ingest', payload);
  return data;
};

// ── Vets ──────────────────────────────────────────────────────────────────
export const fetchVets = async (): Promise<Vet[]> => {
  const { data } = await api.get<Vet[]>('/consults/vets');
  return data;
};

// ── Consults ──────────────────────────────────────────────────────────────
export const submitConsultRequest = async (req: ConsultRequest): Promise<Consult> => {
  const { data } = await api.post<Consult>('/consults/', req);
  return data;
};

// ── AI Chat ───────────────────────────────────────────────────────────────
export const sendChatMessage = async (
  message: string,
  sessionId?: string,
  language?: string,
): Promise<{ reply: string; session_id: string }> => {
  const { data } = await api.post('/ai/chat', { message, session_id: sessionId, language });
  return data;
};

// ── HEATMAP ────────────────────────────────────────────────────────────────
export const fetchHeatmapData = async (
  barnId: string,
  dataType: 'health' | 'temperature' | 'humidity' = 'health'
): Promise<HeatmapData> => {
  const { data } = await api.get<HeatmapData>(`/heatmap/grid/${barnId}`, {
    params: { data_type: dataType }
  });
  return data;
};

export const fetchHeatmapSummary = async (barnId: string): Promise<HeatmapSummary> => {
  const { data } = await api.get<HeatmapSummary>(`/heatmap/summary/${barnId}`);
  return data;
};

export const generateHeatmapFromSensors = async (barnId: string): Promise<{ message: string; points_created: number }> => {
  const { data } = await api.post<{ message: string; points_created: number }>(`/heatmap/from-sensors/${barnId}`);
  return data;
};

export const createHeatmapOverlayImage = async (payload: Record<string, unknown>): Promise<Blob> => {
  const response = await fetch('https://heatmapapi-591111065781.us-west3.run.app/api/createHeatmap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HeatmapAPI error: ${response.status} ${response.statusText} - ${text}`);
  }

  return response.blob();
};

// ── PUBLIC DASHBOARD (FORUM) ───────────────────────────────────────────────
export const fetchForumPosts = async (
  page: number = 1,
  pageSize: number = 10,
  sortBy: 'newest' | 'trending' | 'oldest' = 'newest'
): Promise<ForumSearchResult> => {
  const { data } = await api.get<ForumSearchResult>('/public-dashboard/posts', {
    params: { page, page_size: pageSize, sort_by: sortBy }
  });
  return data;
};

export const createForumPost = async (
  post: ForumPostCreate,
  authorId: string,
  authorName: string
): Promise<ForumPost> => {
  const { data } = await api.post<ForumPost>('/public-dashboard/posts', post, {
    params: { author_id: authorId, author_name: authorName }
  });
  return data;
};

export const fetchForumPostDetail = async (postId: string): Promise<ForumPostDetail> => {
  const { data } = await api.get<ForumPostDetail>(`/public-dashboard/posts/${postId}`);
  return data;
};

export const searchForumPosts = async (
  query: string,
  page: number = 1,
  pageSize: number = 10
): Promise<ForumSearchResult> => {
  const { data } = await api.get<ForumSearchResult>('/public-dashboard/search', {
    params: { query, page, page_size: pageSize }
  });
  return data;
};

export const addForumComment = async (
  postId: string,
  content: string,
  authorId: string,
  authorName: string
): Promise<ForumComment> => {
  const { data } = await api.post<ForumComment>(
    `/public-dashboard/posts/${postId}/comments`,
    { content },
    { params: { author_id: authorId, author_name: authorName } }
  );
  return data;
};

export const deleteForumComment = async (commentId: string): Promise<{ message: string }> => {
  const { data } = await api.delete<{ message: string }>(`/public-dashboard/comments/${commentId}`);
  return data;
};

export const reactToForumPost = async (
  postId: string,
  reactionType: ReactionType,
  userId: string
): Promise<{ message: string; reaction_count: number }> => {
  const { data } = await api.post<{ message: string; reaction_count: number }>(
    `/public-dashboard/posts/${postId}/react`,
    { reaction_type: reactionType },
    { params: { user_id: userId } }
  );
  return data;
};

export const reactToForumComment = async (
  commentId: string,
  reactionType: ReactionType,
  userId: string
): Promise<{ message: string; reaction_count: number }> => {
  const { data } = await api.post<{ message: string; reaction_count: number }>(
    `/public-dashboard/comments/${commentId}/react`,
    { reaction_type: reactionType },
    { params: { user_id: userId } }
  );
  return data;
};

export const fetchTrendingHashtags = async (limit: number = 10): Promise<ForumHashtagTrend[]> => {
  const { data } = await api.get<ForumHashtagTrend[]>('/public-dashboard/hashtags/trending', {
    params: { limit }
  });
  return data;
};
