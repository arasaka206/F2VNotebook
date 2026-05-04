import type { Vet, DashboardSummary } from '../types';

export const MOCK_DASHBOARD: DashboardSummary = {
  herd_health_score: 78,
  active_treatment_cases: 2,
  total_livestock: 24,
  disease_alert_level: 'medium',
  latest_sensor: {
    temperature_c: 27.1,
    humidity_pct: 72.3,
    ammonia_ppm: 15.2,
    status: 'warning',
  },
  activity_stream: [
    { id: 'act-001', timestamp: '2024-05-10T06:30:00Z', type: 'ai_note', message: 'AI detected elevated ammonia – recommended ventilation check' },
    { id: 'act-002', timestamp: '2024-05-09T14:00:00Z', type: 'treatment', message: 'Treatment TR-001 updated: Daisy responded to antibiotics' },
    { id: 'act-003', timestamp: '2024-05-09T10:00:00Z', type: 'consult', message: 'Consult CON-001 accepted by Dr. Tran Thi Bich' },
    { id: 'act-004', timestamp: '2024-05-08T08:00:00Z', type: 'sensor', message: 'Sensor alert: Temperature spike 34.1°C in Barn A' },
    { id: 'act-005', timestamp: '2024-05-07T16:00:00Z', type: 'ai_note', message: 'AI notebook entry: Vaccination reminder for COW-A01' },
  ],
};

export const MOCK_VETS: Vet[] = [
  { id: 'user-002', full_name: 'Dr. Tran Thi Bich', specialty: 'Bovine', status: 'online' },
  { id: 'user-003', full_name: 'Dr. Le Minh Hoang', specialty: 'Swine', status: 'busy' },
  { id: 'user-004', full_name: 'Dr. Pham Nguyen Lan', specialty: 'Poultry', status: 'offline' },
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'notebook', label: 'AI Herd Notebook', icon: '📓' },
  { id: 'livestock', label: 'Livestock Profiles', icon: '🐄' },
  { id: 'disease-map', label: 'Disease Risk Map', icon: '🗺️' },
  { id: 'vet-connect', label: 'Veterinary Connect', icon: '🩺' },
  { id: 'quizzes', label: 'Disease Quizzes', icon: '📝' },
  { id: 'public-dashboard', label: 'Community Forum', icon: '💬' },
  { id: 'inventory', label: 'Inventory & Supplies', icon: '📦' },
  { id: 'reports', label: 'Reports & Analytics', icon: '📈' },
  { id: 'profile', label: 'Farmer Profile', icon: '👤' },
];
