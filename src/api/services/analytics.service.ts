import { apiClient } from '@/utils/api';

export interface EngagementAnalytics {
  period_days: number;
  total_applications: number;
  status_distribution: Record<string, number>;
  average_match_score: number;
  average_success_probability: number;
  total_views: number;
  average_views_per_app: number;
  response_rate_percent: number;
  interview_rate_percent: number;
  high_engagement_applications: Array<{
    id: number;
    company: string;
    role: string;
    status: string;
    match_score: number;
    success_probability: number;
    views: number;
  }>;
  insights: string[];
}

export interface HeatmapData {
  heatmap: Array<{
    id: number;
    company: string;
    role: string;
    heat_score: number;
    heat_level: 'high' | 'medium' | 'low';
    match_score: number;
    ats_score: number;
    success_probability: number;
    views: number;
    status: string;
  }>;
  total_tracked: number;
  high_heat_count: number;
  medium_heat_count: number;
  low_heat_count: number;
}

export interface MarketStats {
  count: number;
  avg_salary: number;
  salary_range: { min: number; max: number };
  top_skills: Array<{ name: string; count: number }>;
  sample_size_salaries: number;
}

export const analyticsService = {
  /**
   * Get market statistics
   */
  getMarketStats: async (role?: string, location?: string): Promise<MarketStats> => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (location) params.append('location', location);
    
    const response = await apiClient(`/analytics/market-stats?${params.toString()}`, {
      method: 'GET',
    });
    const data = await response.json();
    return data.stats;
  },
  /**
   * Get engagement analytics for user's applications
   */
  getEngagementAnalytics: async (days: number = 30): Promise<EngagementAnalytics> => {
    const response = await apiClient(`/analytics/engagement?days=${days}`, {
      method: 'GET',
    });
    const data = await response.json();
    return data.analytics;
  },

  /**
   * Get application heatmap data (ZipRecruiter-style)
   */
  getHeatmap: async (): Promise<HeatmapData> => {
    const response = await apiClient('/analytics/heatmap', {
      method: 'GET',
    });
    const data = await response.json();
    return data.heatmap;
  },

  /**
   * Track when user views an application
   */
  trackView: async (applicationId: number): Promise<void> => {
    await apiClient('/analytics/track-view', {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId }),
    });
  },

  /**
   * Update application status with engagement data
   */
  updateStatus: async (
    applicationId: number,
    status: string,
    additionalData?: Record<string, any>
  ): Promise<void> => {
    await apiClient('/analytics/update-status', {
      method: 'POST',
      body: JSON.stringify({
        application_id: applicationId,
        status,
        additional_data: additionalData || {},
      }),
    });
  },
};

