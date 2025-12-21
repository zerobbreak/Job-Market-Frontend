import { apiClient } from '@/utils/api';
import type { CVProfile, UploadCVResponse } from '../types';

export const cvService = {
  /**
   * List all CVs for the current user
   */
  list: async (): Promise<CVProfile[]> => {
    const response = await apiClient('/profile/list', { method: 'GET' });
    const data = await response.json();
    return data.profiles || [];
  },

  /**
   * Upload a new CV
   */
  upload: async (file: File, overwrite = false): Promise<UploadCVResponse> => {
    const formData = new FormData();
    formData.append('cv', file);
    if (overwrite) {
      formData.append('overwrite', 'true');
    }

    const response = await apiClient('/analyze-cv', {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  /**
   * Delete a CV by file ID
   */
  delete: async (fileId: string) => {
    const response = await apiClient(`/profile/${fileId}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
