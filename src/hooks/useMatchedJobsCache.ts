import { useEffect } from "react";

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

export function useMatchedJobsCache(
  matchedJobs: MatchedJob[],
  location: string,
  setMatchedJobs: (jobs: MatchedJob[]) => void
) {
  // Load cached matches from localStorage on mount
  useEffect(() => {
    const loadCachedMatches = () => {
      try {
        const cachedData = localStorage.getItem("matchedJobs");
        const cachedLocation = localStorage.getItem("matchedJobsLocation");

        if (cachedData && cachedLocation === location) {
          const parsed = JSON.parse(cachedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMatchedJobs(parsed);
            console.log("Loaded cached matches:", parsed.length);
          }
        }
      } catch (e) {
        console.error("Error loading cached matches:", e);
      }
    };

    loadCachedMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Save matches to localStorage whenever they change
  useEffect(() => {
    if (matchedJobs.length > 0) {
      try {
        localStorage.setItem("matchedJobs", JSON.stringify(matchedJobs));
        localStorage.setItem("matchedJobsLocation", location);
        console.log("Cached matches:", matchedJobs.length);
      } catch (e) {
        console.error("Error caching matches:", e);
      }
    }
  }, [matchedJobs, location]);
}
