import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsService } from '../services';

export const useFindMatches = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobsService.findMatches,

    onSuccess: (data, variables) => {
      // Update cache with new matches
      queryClient.setQueryData(['jobMatches', variables.location], data);

      // Also save to localStorage for persistence
      localStorage.setItem('matchedJobs', JSON.stringify(data));
      localStorage.setItem('matchedJobsLocation', variables.location);
    },
  });
};
