import { useQuery } from '@tanstack/react-query';
import { profileQueryOptions } from './options';

export const useProfile = () => {
  return useQuery(profileQueryOptions());
};
