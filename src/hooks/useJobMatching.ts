import { useState, useMemo } from "react";
import { apiClient } from "@/utils/api";
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
  const [error, setError] = useState<string>("");
  const [location, setLocation] = useState("South Africa");
  const [useDemoJobs, setUseDemoJobs] = useState(false);
  const [minMatchScore, setMinMatchScore] = useState(0);

  const findMatches = async () => {
    setLoading(true);
    setError("");
    setMatchedJobs([]); // Clear current matches

    try {
      const response = await apiClient("/match-jobs", {
        method: "POST",
        body: JSON.stringify({
          location: location,
          max_results: 20,
          use_demo: useDemoJobs,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMatchedJobs(data.matches || []);
        track(
          "matches_search",
          {
            location,
            count: (data.matches || []).length,
            use_demo: useDemoJobs,
          },
          "app"
        );
      } else {
        setError(data.error || "Failed to find matches");
      }
    } catch (err) {
      setError("Error finding job matches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMatchedJobs = useMemo(
    () => matchedJobs.filter((match) => match.match_score >= minMatchScore),
    [matchedJobs, minMatchScore]
  );

  return {
    matchedJobs,
    setMatchedJobs,
    loading,
    error,
    location,
    setLocation,
    useDemoJobs,
    setUseDemoJobs,
    minMatchScore,
    setMinMatchScore,
    findMatches,
    filteredMatchedJobs,
  };
}
