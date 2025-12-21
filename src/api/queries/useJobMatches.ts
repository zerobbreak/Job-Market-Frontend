import { useQuery } from '@tanstack/react-query';
import { jobsService } from '../services';

export const useJobMatches = (location: string, enabled = true) => {
  return useQuery({
    queryKey: ['jobMatches', location],
    queryFn: () => jobsService.findMatches({ location, max_results: 20 }),
    enabled, // Only fetch when enabled
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};
