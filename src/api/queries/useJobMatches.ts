import { useQuery } from '@tanstack/react-query';
import { jobMatchesQueryOptions } from './options';

/**
 * Query hook for getting cached job matches (GET request - no API call)
 * Use this for reading cached data only
 */
export const useJobMatches = (enabled = true) => {
  return useQuery({
    ...jobMatchesQueryOptions(),
    enabled,
  });
};
