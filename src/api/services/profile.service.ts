import { apiClient } from '@/utils/api';
import type { ProfileData, CVAnalysisResponse } from '../types';

export const profileService = {
  /**
   * Get current user's profile metadata
   */
  getCurrent: async () => {
    const response = await apiClient('/current', { method: 'GET' });
    const data = await response.json();
    return data.success ? data : null;
  },

  /**
   * Get structured profile data
   */
  getStructured: async (): Promise<ProfileData | null> => {
    const response = await apiClient('/structured', {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    return data.success ? data.profile : null;
  },

  /**
   * Get CV analysis (uploaded document + AI match readiness, skill gaps).
   * Returns 404 when no profile; ai_analysis may be null if Gemini is unavailable.
   */
  getCVAnalysis: async (): Promise<CVAnalysisResponse | null> => {
    const response = await apiClient('/cv-analysis', { method: 'GET' });
    const data = (await response.json()) as CVAnalysisResponse;
    if (response.status === 404) return null;
    return data;
  },
};
