import { createServerFn } from "@tanstack/react-start";
import { backendFetch } from "@/lib/backend.server";
import type { JobMatch } from "../types";

export interface MatchJobsResponse {
  success: boolean;
  matches?: JobMatch[];
  location?: string;
  cached?: boolean;
  message?: string;
  error?: string;
  in_progress?: boolean;
  created_at?: string;
  last_seen?: string;
  matching_method?: string;
}

const getCachedMatchesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<MatchJobsResponse> => {
    const response = await backendFetch("/jobs/matches", { method: "GET" });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return {
        success: false,
        error: (body as { error?: string }).error ?? `Request failed (${response.status})`,
      };
    }
    return (await response.json()) as MatchJobsResponse;
  },
);

const findMatchesFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      location: string;
      max_results: number;
      min_score?: number;
      force_refresh?: boolean;
    }) => data,
  )
  .handler(async ({ data }): Promise<MatchJobsResponse> => {
    const response = await backendFetch("/jobs/matches", {
      method: "POST",
      body: JSON.stringify({
        location: data.location || "",
        max_results: data.max_results || 20,
        min_score: data.min_score || 0.0,
        force_refresh: data.force_refresh !== undefined ? data.force_refresh : true,
      }),
    });

    if (response.status === 429) {
      const body = await response.json();
      return {
        success: false,
        error: body.error || "Request already in progress. Please wait.",
        in_progress: true,
      };
    }

    return response.json();
  });

const startApplyPreviewFn = createServerFn({ method: "POST" })
  .validator((data: { job: unknown; template: string }) => data)
  .handler(async ({ data }) => {
    const response = await backendFetch("/jobs/apply-preview", {
      method: "POST",
      body: JSON.stringify({ job: data.job, template: data.template }),
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("You must be logged in to generate a preview.");
      }
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }
    return response.json() as Promise<{
      success: boolean;
      job_id?: string;
      error?: string;
    }>;
  });

const getApplyPreviewStatusFn = createServerFn({ method: "GET" })
  .validator((data: { jobId: string }) => data)
  .handler(async ({ data }) => {
    const response = await backendFetch(`/jobs/apply-preview/${data.jobId}/status`, {
      method: "GET",
    });
    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, notFound: true as const };
      }
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }
    const body = (await response.json()) as {
      success: boolean;
      status?: string;
      progress?: number;
      phase?: string;
      error?: string;
      result?: {
        cv_html: string;
        cover_letter_html: string;
        ats?: { score?: number; analysis?: string };
      };
    };
    return { ...body, notFound: false as const };
  });

export const jobsService = {
  getCachedMatches: (): Promise<MatchJobsResponse> => getCachedMatchesFn(),

  findMatches: (params: {
    location: string;
    max_results: number;
    min_score?: number;
    force_refresh?: boolean;
  }): Promise<MatchJobsResponse> => findMatchesFn({ data: params }),

  startApplyPreview: (job: unknown, template: string) =>
    startApplyPreviewFn({ data: { job, template } }),

  getApplyPreviewStatus: (jobId: string) => getApplyPreviewStatusFn({ data: { jobId } }),
};
