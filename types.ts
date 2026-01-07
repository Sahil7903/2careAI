
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'owner' | 'viewer';
}

export interface Vitals {
  bloodPressure?: string;
  sugarLevel?: number;
  heartRate?: number;
}

export interface Report {
  id: number;
  user_id: number;
  filename: string;
  type: string;
  date: string;
  vitals: Vitals;
  category: string;
  aiAnalysis?: string;
}

export interface AccessShare {
  id: number;
  owner_id: number;
  viewer_email: string;
  report_id_or_all: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
