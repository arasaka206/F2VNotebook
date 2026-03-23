// Types matching backend schemas

export type HealthStatus = 'healthy' | 'sick' | 'under_treatment' | 'deceased';
export type AlertLevel = 'low' | 'medium' | 'high' | 'critical';
export type VetStatus = 'online' | 'busy' | 'offline';
export type ConsultPriority = 'low' | 'normal' | 'high' | 'emergency';
export type ConsultStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type SensorStatus = 'normal' | 'warning' | 'critical';

export interface SensorReading {
  temperature_c: number;
  humidity_pct: number;
  ammonia_ppm: number;
  status: SensorStatus;
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
