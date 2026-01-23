import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services';

export const useCVAnalysis = () => {
  return useQuery({
    queryKey: ['cv-analysis'],
    queryFn: async () => {
      const data = await profileService.getCVAnalysis();
      if (data === null) throw new Error('No profile');
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: (_, error) => (error as Error)?.message !== 'No profile',
  });
};
