import { useEffect } from "react";

/**
 * Clear matched jobs cache from localStorage
 * Call this when a new CV is uploaded to ensure stale data is removed
 */
export function clearMatchedJobsCache() {
  try {
    localStorage.removeItem("matchedJobs");
    localStorage.removeItem("matchedJobsLocation");
    console.log("Cleared matched jobs cache");
  } catch (e) {
    console.error("Error clearing matched jobs cache:", e);
  }
}

export interface MatchedJobFromStorage {
  job: { id: string; title: string; company: string; location: string; description: string; url: string };
  match_score: number;
  match_reasons: string[];
}

/**
 * Read matched jobs from localStorage (used as fallback when API cache is empty)
 */
export function getMatchedJobsFromLocalStorage(): {
  jobs: MatchedJobFromStorage[];
  location: string;
} | null {
  try {
    const raw = localStorage.getItem("matchedJobs");
    const loc = localStorage.getItem("matchedJobsLocation") ?? "";
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return { jobs: parsed, location: loc };
  } catch {
    return null;
  }
}

interface MatchedJob {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    url: string;
  };
  match_score: number;
  match_reasons: string[];
}

/**
 * Hook to persist matched jobs to localStorage as a backup cache
 * Note: Primary cache is now handled by the API (backend cache)
 * This localStorage cache is used as a fallback/backup
 */
export function useMatchedJobsCache(
  matchedJobs: MatchedJob[],
  location: string,
  _setMatchedJobs: (jobs: MatchedJob[]) => void
) {
  // Note: We no longer load from localStorage on mount since useJobMatching
  // now loads from the API cache (GET /match-jobs) which is the primary source.
  // localStorage is only used as a backup/persistence layer.

  // Save matches to localStorage whenever they change (as backup)
  useEffect(() => {
    if (matchedJobs.length > 0) {
      try {
        localStorage.setItem("matchedJobs", JSON.stringify(matchedJobs));
        localStorage.setItem("matchedJobsLocation", location);
        console.log("Backed up matches to localStorage:", matchedJobs.length);
      } catch (e) {
        console.error("Error backing up matches to localStorage:", e);
      }
    }
  }, [matchedJobs, location]);
}
