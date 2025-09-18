// API configuration and service layer for backend integration
const API_BASE_URL = 'http://localhost:8000';

export interface BackendTrain {
  id: string;
  priority: number;
  planned_departure: number;
  route_sections: string[];
  due_time?: number;
  current_delay_minutes?: number;
}

export interface BackendSection {
  id: string;
  platform_capacity?: number;
  conflicts_with?: Record<string, number>;
  conflict_groups?: Record<string, number>;
}

export interface BackendState {
  trains: BackendTrain[];
  sections: BackendSection[];
}

export interface PredictionResponse {
  predicted_delay_minutes: Record<string, number>;
  predicted_conflicts: Array<{
    train_ids: string[];
    section_id: string;
    predicted_conflict_time: number;
  }>;
}

export interface ScheduleResponse {
  kpis: {
    total_lateness: number;
    otp_count: number;
    total_trains: number;
  };
  schedule: Record<string, Array<{
    section: string;
    entry_time: number;
    exit_time: number;
  }>>;
  lateness_by_train?: Record<string, number>;
}

class APIService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Demo endpoint
  async getDemo(): Promise<any> {
    return this.request('/demo');
  }

  // Live snapshot endpoint
  async getLiveSnapshot(useLive: boolean = false, maxTrains: number = 50, state?: BackendState): Promise<BackendState> {
    return this.request(`/live/snapshot?use_live=${useLive}&max_trains=${maxTrains}`, {
      method: 'POST',
      body: state ? JSON.stringify(state) : undefined,
    });
  }

  // Prediction endpoint
  async predictConflicts(state: BackendState): Promise<PredictionResponse> {
    return this.request('/predict', {
      method: 'POST',
      body: JSON.stringify(state),
    });
  }

  // Schedule optimization
  async optimizeSchedule(state: BackendState, otpTolerance: number = 300): Promise<ScheduleResponse> {
    return this.request(`/schedule?otp_tolerance=${otpTolerance}`, {
      method: 'POST',
      body: JSON.stringify(state),
    });
  }

  // Conflict resolution
  async resolveConflicts(
    state: BackendState, 
    predictedConflicts: PredictionResponse['predicted_conflicts'], 
    solver: string = 'milp',
    otpTolerance: number = 300
  ): Promise<ScheduleResponse> {
    return this.request(`/resolve?solver=${solver}&otp_tolerance=${otpTolerance}`, {
      method: 'POST',
      body: JSON.stringify({
        state,
        predicted_conflicts: predictedConflicts,
      }),
    });
  }

  // What-if analysis
  async whatIfAnalysis(state: BackendState, otpTolerance: number = 300): Promise<ScheduleResponse> {
    return this.request(`/whatif?otp_tolerance=${otpTolerance}`, {
      method: 'POST',
      body: JSON.stringify(state),
    });
  }

  // KPIs endpoint
  async getKPIs(state: BackendState, otpTolerance: number = 300): Promise<any> {
    return this.request(`/kpis?otp_tolerance=${otpTolerance}`, {
      method: 'POST',
      body: JSON.stringify(state),
    });
  }
}

export const apiService = new APIService();
export default APIService;