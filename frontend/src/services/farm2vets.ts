import api from './api';
import type {
  DashboardSummary,
  Livestock,
  Treatment,
  Vet,
  Consult,
  ConsultRequest,
  TokenResponse,
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
): Promise<{ reply: string; session_id: string }> => {
  const { data } = await api.post('/ai/chat', { message, session_id: sessionId });
  return data;
};
