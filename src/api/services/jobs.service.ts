import { apiClient } from '@/utils/api';
import type { JobMatch } from '../types';

export interface MatchJobsResponse {
  success: boolean;
  matches?: JobMatch[];
  location?: string;
  cached?: boolean;
  message?: string;
  error?: string;
  in_progress?: boolean;
  created_at?: string;
  last_seen?: string;
  matching_method?: string;
}

export const jobsService = {
  /**
   * Get cached job matches (GET request - no API call)
   */
  getCachedMatches: async (): Promise<MatchJobsResponse> => {
    const response = await apiClient('/jobs/matches', {
      method: 'GET',
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return {
        success: false,
        error: (body as { error?: string }).error ?? `Request failed (${response.status})`,
      };
    }
    const data = (await response.json()) as MatchJobsResponse;
    return data;
  },

  /**
   * Find fresh job matches based on profile and location (POST request - triggers API call)
   */
  findMatches: async (params: {
    location: string;
    max_results: number;
    min_score?: number;
    force_refresh?: boolean;
  }): Promise<MatchJobsResponse> => {
    const response = await apiClient('/jobs/matches', {
      method: 'POST',
      body: JSON.stringify({
        location: params.location || '',
        max_results: params.max_results || 20,
        min_score: params.min_score || 0.0,
        force_refresh: params.force_refresh !== undefined ? params.force_refresh : true,
      }),
    });
    
    // Handle 429 status (duplicate request)
    if (response.status === 429) {
      const data = await response.json();
      return {
        success: false,
        error: data.error || 'Request already in progress. Please wait.',
        in_progress: true,
      };
    }
    
    const data = await response.json();
    return data;
  },
};
