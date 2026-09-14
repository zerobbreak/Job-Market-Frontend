import { queryOptions } from "@tanstack/react-query";
import { cvService, profileService, jobsService, applicationsService, adminService } from "../services";

export const profileQueryOptions = () =>
  queryOptions({
    queryKey: ["profile"] as const,
    queryFn: () => profileService.getStructured(),
    staleTime: 10 * 60 * 1000,
  });

export const cvsQueryOptions = () =>
  queryOptions({
    queryKey: ["cvs"] as const,
    queryFn: () => cvService.list(),
  });

export const jobMatchesQueryOptions = () =>
  queryOptions({
    queryKey: ["jobMatches", "cached"] as const,
    queryFn: () => jobsService.getCachedMatches(),
    staleTime: 15 * 60 * 1000,
  });

export const applicationsQueryOptions = (page: number, limit: number) =>
  queryOptions({
    queryKey: ["applications", page, limit] as const,
    queryFn: () => applicationsService.list(page, limit),
  });

export const adminStatsQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "system-stats"] as const,
    queryFn: () => adminService.getSystemStats(),
    refetchInterval: 5000,
  });
