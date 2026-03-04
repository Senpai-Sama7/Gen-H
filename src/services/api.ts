// API Service for connecting to the main HVAC dispatch system
import { ENV } from '../config/env';

export interface Dispatch {
  dispatch_id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  issue_summary: string;
  urgency: string;
  tech_name: string;
  eta: string;
  status: string;
  crew_result?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DispatchResponse {
  run_id: string;
  status: string;
  result?: Record<string, unknown>;
  timestamp: string;
}

export interface DashboardMetrics {
  total_dispatches: number;
  emergency_count: number;
  completed_count: number;
  emergency_pct: number;
  pending_count: number;
}

export interface ApiError {
  detail: string;
}

class ApiService {
  private baseUrl: string;
  private apiKey: string | null = null;

  constructor() {
    this.baseUrl = ENV.API_BASE_URL;
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('admin_api_key', key);
  }

  getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('admin_api_key');
    }
    return this.apiKey;
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('admin_api_key');
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    const apiKey = this.getApiKey();
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for session auth
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  // Health check
  async health(): Promise<{ status: string }> {
    return this.fetch('/health');
  }

  // Get recent dispatches
  async getDispatches(limit: number = 50): Promise<Dispatch[]> {
    return this.fetch(`/dispatches?limit=${limit}`);
  }

  // Get single dispatch status
  async getDispatchStatus(runId: string): Promise<DispatchResponse> {
    return this.fetch(`/run/${runId}`);
  }

  // Create new dispatch
  async createDispatch(message: string, temp: number = 95): Promise<{ run_id: string }> {
    return this.fetch('/dispatch', {
      method: 'POST',
      body: JSON.stringify({
        message,
        outdoor_temp_f: temp,
      }),
    });
  }

  // Get dashboard metrics
  async getMetrics(): Promise<DashboardMetrics> {
    const dispatches = await this.getDispatches(100);
    
    const total = dispatches.length;
    const emergency = dispatches.filter(d => d.urgency?.toLowerCase() === 'emergency').length;
    const completed = dispatches.filter(d => d.status?.toLowerCase() === 'complete').length;
    const pending = dispatches.filter(d => d.status?.toLowerCase() === 'pending' || d.status?.toLowerCase() === 'queued').length;
    
    return {
      total_dispatches: total,
      emergency_count: emergency,
      completed_count: completed,
      emergency_pct: total > 0 ? Math.round((emergency / total) * 100) : 0,
      pending_count: pending,
    };
  }

  // Login (legacy session-based - backend uses form data)
  async login(username: string, password: string): Promise<boolean> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
      credentials: 'include',
      redirect: 'manual',
    });

    // Check if we got a redirect to /admin (success)
    if (response.status === 0 || response.headers.get('location')?.includes('/admin')) {
      return true;
    }

    // Try to parse error
    if (response.status === 401) {
      return false;
    }

    return response.ok;
  }

  // Logout
  async logout(): Promise<void> {
    await fetch(`${this.baseUrl}/logout`, {
      credentials: 'include',
    });
    this.clearApiKey();
  }
}

export const api = new ApiService();
export default api;
