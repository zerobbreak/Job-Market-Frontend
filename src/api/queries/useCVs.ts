import { useQuery } from '@tanstack/react-query';
import { cvsQueryOptions } from './options';

export const useCVs = () => {
  return useQuery(cvsQueryOptions());
};
