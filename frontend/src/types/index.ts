// Types matching backend schemas

export type HealthStatus = 'healthy' | 'sick' | 'under_treatment' | 'deceased';
export type AlertLevel = 'low' | 'medium' | 'high' | 'critical';
export type VetStatus = 'online' | 'busy' | 'offline';
export type ConsultPriority = 'low' | 'normal' | 'high' | 'emergency';
export type ConsultStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type SensorStatus = 'ok' | 'warning' | 'danger' | 'normal' | 'critical';

export interface SensorReading {
  id?: string;
  barn_id?: string;
  temperature_c: number;
  humidity_pct: number;
  ammonia_ppm: number;
  status: SensorStatus;
  timestamp?: string;
}

export interface SensorAggregate {
  avg_temperature_c: number | null;
  avg_humidity_pct: number | null;
  avg_ammonia_ppm: number | null;
  data_points: number;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'ai_note' | 'treatment' | 'consult' | 'sensor';
  message: string;
}

export interface DashboardSummary {
  herd_health_score: number;
  active_treatment_cases: number;
  total_livestock: number;
  disease_alert_level: AlertLevel;
  latest_sensor: SensorReading;
  activity_stream: ActivityEvent[];
}

export interface Livestock {
  id: string;
  tag_id: string;
  name: string;
  species: string;
  breed?: string;
  birth_date?: string;
  weight_kg?: number;
  health_status: HealthStatus;
  notes?: string;
  owner_id: string;
  created_at: string;
}

export interface Treatment {
  id: string;
  livestock_id: string;
  diagnosis: string;
  treatment_plan: string;
  start_date: string;
  end_date?: string;
  assigned_vet_id?: string;
  status: string;
  created_at: string;
}

export interface Vet {
  id: string;
  full_name: string;
  specialty: string;
  status: VetStatus;
}

export interface ConsultRequest {
  farmer_id: string;
  vet_id?: string;
  livestock_id?: string;
  subject: string;
  description: string;
  priority: ConsultPriority;
}

export interface Consult extends ConsultRequest {
  id: string;
  status: ConsultStatus;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// HEATMAP TYPES
// ═════════════════════════════════════════════════════════════════════════════

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
}

export interface HeatmapData {
  barn_id: string;
  data_type: 'health' | 'temperature' | 'humidity';
  grid_data: HeatmapPoint[];
  timestamp: string;
}

export interface HeatmapSummary {
  barn_id: string;
  min_intensity: number;
  max_intensity: number;
  avg_intensity: number;
  data_points: number;
}

export interface BilingualText {
  en: string;
  vi: string;
}

export type DiseaseRegionId = 'Vietnam' | 'Hanoi' | 'HCMC';
export type DiseaseZoneSeverity = 'low' | 'watch' | 'high' | 'critical';
export type DiseaseZoneScope = 'outbreak' | 'surveillance';

export interface DiseaseMapZone {
  id: string;
  name: BilingualText;
  center: [number, number];
  radius_km: number;
  severity: DiseaseZoneSeverity;
  scope: DiseaseZoneScope;
  diseases: BilingualText[];
  summary: BilingualText;
  updated_at: string;
  source_label: string;
  source_url: string;
}

export interface DiseaseMapRegion {
  id: DiseaseRegionId;
  center: [number, number];
  zoom: number;
  zones: DiseaseMapZone[];
}

export interface DiseaseBulletin {
  title: string;
  url: string;
  source: string;
  published_at: string | null;
  summary: string;
}

export interface DiseaseFeedResponse {
  fetched_at: string;
  fallback: boolean;
  items: DiseaseBulletin[];
}

export interface BarnSensorOverview {
  barn_id: string;
  latest_reading: SensorReading;
  avg_temperature_c: number | null;
  avg_humidity_pct: number | null;
  avg_ammonia_ppm: number | null;
  data_points: number;
  last_seen: string;
  window_hours: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC DASHBOARD (FORUM) TYPES
// ═════════════════════════════════════════════════════════════════════════════

export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  content: string;
  reaction_count: number;
  created_at: string;
  updated_at?: string;
}

export interface ForumPost {
  id: string;
  author_id: string;
  author_name: string;
  title: string;
  content: string;
  reaction_count: number;
  comment_count: number;
  hashtags: string[];
  created_at: string;
  updated_at?: string;
}

export interface ForumPostDetail extends ForumPost {
  comments: ForumComment[];
}

export interface ForumPostCreate {
  title: string;
  content: string;
  hashtags: string[];
}

export interface ForumSearchResult {
  posts: ForumPost[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface ForumHashtagTrend {
  tag: string;
  count: number;
}

export type ReactionType = 'like' | 'love' | 'haha' | 'sad' | 'angry';

// ═════════════════════════════════════════════════════════════════════════════
// ALERTS & NOTIFICATIONS TYPES
// ═════════════════════════════════════════════════════════════════════════════

export interface Alert {
  id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  scope: string;
  target_id?: string;
  is_active: boolean;
  is_read: boolean;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// QUIZZES & EDUCATION TYPES
// ═════════════════════════════════════════════════════════════════════════════

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  time_limit?: number;
  passing_score: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  order: number;
  created_at: string;
}

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

export interface UserQuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_taken?: number;
  status: 'completed' | 'failed';
  answers?: string;
  created_at: string;
}

export interface UserAwarenessScore {
  id: string;
  user_id: string;
  overall_score: number;
  quizzes_completed: number;
  quizzes_passed: number;
  status: 'good' | 'needs_improvement' | 'restricted';
  last_updated: string;
}

export interface QuizAttemptRequest {
  quiz_id: string;
  answers: number[];
  time_taken?: number;
}
