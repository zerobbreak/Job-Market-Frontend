import { apiClient } from '@/utils/api';
import type { JobMatch } from '../types';

export const jobsService = {
  /**
   * Find job matches based on profile and location
   */
  findMatches: async (params: {
    location: string;
    max_results: number;
  }): Promise<JobMatch[]> => {
    const response = await apiClient('/match-jobs', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    const data = await response.json();
    return data.matches || [];
  },
};
