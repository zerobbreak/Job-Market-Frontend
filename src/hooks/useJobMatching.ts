import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { jobsService } from "@/api/services/jobs.service";
import { getMatchedJobsFromLocalStorage } from "@/hooks/useMatchedJobsCache";
import { track } from "@/utils/analytics";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
}

export interface MatchedJob {
  job: Job;
  match_score: number;
  match_reasons: string[];
}

export function useJobMatching() {
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [cacheLoading, setCacheLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [location, setLocation] = useState("South Africa");
  const [useDemoJobs, setUseDemoJobs] = useState(false);
  const [minMatchScore, setMinMatchScore] = useState(0);
  
  // Request deduplication
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<string>("");
  const isSearchingRef = useRef(false);
  const hasMountedRef = useRef(false);
  const skipCacheResultRef = useRef(false);

  /**
   * Load cached matches on mount (GET request - no API call)
   */
  const loadCachedMatches = useCallback(async () => {
    try {
      const data = await jobsService.getCachedMatches();
      
      if (skipCacheResultRef.current) return;

      if (data.success) {
        if (data.matches && data.matches.length > 0) {
          setMatchedJobs(data.matches);
          setMessage(null);
          if (data.location) {
            setLocation(data.location);
          }
          track(
            "matches_cached_load",
            {
              location: data.location || location,
              count: data.matches.length,
              cached: data.cached || false,
            },
            "app"
          );
        } else {
          const stored = getMatchedJobsFromLocalStorage();
          if (stored && stored.jobs.length > 0) {
            setMatchedJobs(stored.jobs as MatchedJob[]);
            setMessage(null);
            if (stored.location) setLocation(stored.location);
            track("matches_cached_load", { location: stored.location, count: stored.jobs.length, cached: false, source: "localStorage" }, "app");
          } else {
            setMatchedJobs([]);
            setMessage(data.message || "No matches found. Click search to find new jobs.");
          }
        }
      } else {
        const stored = getMatchedJobsFromLocalStorage();
        if (stored && stored.jobs.length > 0) {
          setMatchedJobs(stored.jobs as MatchedJob[]);
          setMessage(null);
          if (stored.location) setLocation(stored.location);
          track("matches_cached_load", { location: stored.location, count: stored.jobs.length, cached: false, source: "localStorage" }, "app");
        } else {
          console.warn("Error loading cached matches:", data.error);
          setMessage("No cached matches available. Click search to find new jobs.");
        }
      }
    } catch (err: any) {
      if (skipCacheResultRef.current) return;
      console.error("Error loading cached matches:", err);
      const stored = getMatchedJobsFromLocalStorage();
      if (stored && stored.jobs.length > 0) {
        setMatchedJobs(stored.jobs as MatchedJob[]);
        setMessage(null);
        if (stored.location) setLocation(stored.location);
        track("matches_cached_load", { location: stored.location, count: stored.jobs.length, cached: false, source: "localStorage" }, "app");
      } else {
        setMessage("No cached matches available. Click search to find new jobs.");
      }
    } finally {
      setCacheLoading(false);
    }
  }, [location]);

  // Load cached matches on mount (only once)
  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;
    loadCachedMatches();
  }, [loadCachedMatches]);

  /**
   * Find fresh matches (POST request with force_refresh - triggers API call)
   */
  const findMatches = useCallback(async (forceRefresh = false) => {
    // Prevent duplicate requests
    if (isSearchingRef.current) {
      console.log("Search already in progress, skipping duplicate request");
      return;
    }

    // Cancel previous request if still in progress
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Create request key for deduplication
    const requestKey = `${location}_${Date.now()}`;
    
    // Prevent duplicate requests within 1 second
    if (lastRequestRef.current === requestKey) {
      console.log("Duplicate request prevented");
      return;
    }
    lastRequestRef.current = requestKey;

    isSearchingRef.current = true;
    skipCacheResultRef.current = true;
    setLoading(true);
    setError("");
    setMessage(null);
    
    if (forceRefresh) {
      setMatchedJobs([]); // Clear current matches only on force refresh
    }

    try {
      const data = await jobsService.findMatches({
        location: location || "",
        max_results: 20,
        min_score: minMatchScore / 100, // Convert percentage to decimal
        force_refresh: forceRefresh,
      });

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      if (data.success) {
        setMatchedJobs(data.matches || []);
        setMessage(null);
        
        if (data.matches && data.matches.length === 0) {
          setMessage("No jobs found matching your criteria.");
        }
        
        track(
          "matches_search",
          {
            location,
            count: (data.matches || []).length,
            use_demo: useDemoJobs,
            cached: data.cached || false,
            force_refresh: forceRefresh,
          },
          "app"
        );
      } else {
        // Handle 429 (duplicate request) or other errors
        if (data.in_progress) {
          setError("Search already in progress. Please wait.");
        } else if (data.error && data.error.includes("No profile")) {
          setError("Please upload your CV first to find matching jobs.");
        } else {
          setError(data.error || "Failed to find matches");
        }
      }
    } catch (err: any) {
      // Check if request was aborted
      if (err.name === "AbortError") {
        return;
      }
      
      // Handle network or parsing errors
      if (err.message && err.message.includes("404")) {
        setError("Profile not found. Please upload your CV first.");
      } else {
        setError("Error finding job matches. Please try again.");
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
        isSearchingRef.current = false;
      }
    }
  }, [location, minMatchScore, useDemoJobs]);

  const filteredMatchedJobs = useMemo(
    () =>
      matchedJobs.filter(
        (match) => (match.match_score ?? 0) >= minMatchScore
      ),
    [matchedJobs, minMatchScore]
  );

  return {
    matchedJobs,
    setMatchedJobs,
    loading,
    cacheLoading,
    error,
    message,
    location,
    setLocation,
    useDemoJobs,
    setUseDemoJobs,
    minMatchScore,
    setMinMatchScore,
    findMatches,
    loadCachedMatches,
    filteredMatchedJobs,
  };
}
