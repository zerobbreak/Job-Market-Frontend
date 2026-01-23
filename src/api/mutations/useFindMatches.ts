import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsService } from '../services';

/**
 * Mutation hook for finding fresh job matches (POST request with force_refresh - triggers API call)
 * Use this when user explicitly requests a search
 */
export const useFindMatches = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      location: string;
      max_results: number;
      min_score?: number;
      force_refresh?: boolean;
    }) => jobsService.findMatches({
      ...params,
      force_refresh: params.force_refresh !== undefined ? params.force_refresh : true, // Default to true for mutations
    }),

    onSuccess: (data, variables) => {
      if (data.success && data.matches) {
        // Update cache with new matches
        queryClient.setQueryData(['jobMatches', 'cached'], data);

        // Also save to localStorage for persistence
        localStorage.setItem('matchedJobs', JSON.stringify(data.matches));
        localStorage.setItem('matchedJobsLocation', variables.location);
      }
    },
  });
};
