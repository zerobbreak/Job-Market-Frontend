import { apiClient } from '@/utils/api';
import type { ProfileData } from '../types';

export const profileService = {
  /**
   * Get current user's profile metadata
   */
  getCurrent: async () => {
    const response = await apiClient('/profile/current', { method: 'GET' });
    const data = await response.json();
    return data.success ? data : null;
  },

  /**
   * Get structured profile data
   */
  getStructured: async (): Promise<ProfileData | null> => {
    const response = await apiClient('/profile/structured', {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    return data.success ? data.profile : null;
  },
};
