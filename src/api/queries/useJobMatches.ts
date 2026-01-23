import { useQuery } from '@tanstack/react-query';
import { jobsService } from '../services';

/**
 * Query hook for getting cached job matches (GET request - no API call)
 * Use this for reading cached data only
 */
export const useJobMatches = (enabled = true) => {
  return useQuery({
    queryKey: ['jobMatches', 'cached'],
    queryFn: () => jobsService.getCachedMatches(),
    enabled, // Only fetch when enabled
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};
