import { useQuery } from '@tanstack/react-query';
import { cvService } from '../services';

export const useCVs = () => {
  return useQuery({
    queryKey: ['cvs'],
    queryFn: cvService.list,
  });
};
