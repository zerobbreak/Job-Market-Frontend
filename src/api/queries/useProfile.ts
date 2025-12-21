import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getStructured,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
