import { apiClient } from '@/utils/api';

export const applicationsService = {
  /**
   * Queue jobs for auto-application
   */
  autoApply: async (jobIds: string[], cvId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient('/applications/auto-apply', {
      method: 'POST',
      body: JSON.stringify({ job_ids: jobIds, cv_id: cvId }),
    });
    return response.json();
  },
};
