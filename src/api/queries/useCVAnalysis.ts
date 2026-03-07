import { useQuery } from "@tanstack/react-query";

/**
 * Disabled: The backend does not have a GET /profiles/cv/analysis endpoint.
 * CV analysis is done via POST /profiles/cv/analyze (file upload).
 * This hook is kept to avoid breaking CVAnalysisView.tsx imports,
 * but it will never fire a request.
 */
export const useCVAnalysis = () => {
  return useQuery({
    queryKey: ["cv-analysis"],
    queryFn: async () => {
      throw new Error("CV analysis query endpoint not available");
    },
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });
};
