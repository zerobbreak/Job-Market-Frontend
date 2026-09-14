import { createServerFn } from "@tanstack/react-start";
import { backendJson } from "@/lib/backend.server";

export interface EngagementAnalytics {
  period_days: number;
  total_applications: number;
  status_distribution: Record<string, number>;
  average_match_score: number;
  average_success_probability: number;
  total_views: number;
  average_views_per_app: number;
  response_rate_percent: number;
  interview_rate_percent: number;
  high_engagement_applications: Array<{
    id: number;
    company: string;
    role: string;
    status: string;
    match_score: number;
    success_probability: number;
    views: number;
  }>;
  insights: string[];
}

export interface HeatmapData {
  heatmap: Array<{
    id: number;
    company: string;
    role: string;
    heat_score: number;
    heat_level: "high" | "medium" | "low";
    match_score: number;
    ats_score: number;
    success_probability: number;
    views: number;
    status: string;
  }>;
  total_tracked: number;
  high_heat_count: number;
  medium_heat_count: number;
  low_heat_count: number;
}

const getEngagementAnalyticsFn = createServerFn({ method: "GET" })
  .validator((data: { days: number }) => data)
  .handler(async ({ data }): Promise<EngagementAnalytics> => {
    const res = await backendJson<{ analytics: EngagementAnalytics }>(
      `/analytics/engagement?days=${data.days}`,
      { method: "GET" },
    );
    return res.analytics;
  });

const getHeatmapFn = createServerFn({ method: "GET" }).handler(async (): Promise<HeatmapData> => {
  const res = await backendJson<{ heatmap: HeatmapData }>("/analytics/heatmap", { method: "GET" });
  return res.heatmap;
});

const trackViewFn = createServerFn({ method: "POST" })
  .validator((data: { applicationId: number }) => data)
  .handler(async ({ data }) => {
    await backendJson("/analytics/track-view", {
      method: "POST",
      body: JSON.stringify({ application_id: data.applicationId }),
    });
  });

const updateStatusFn = createServerFn({ method: "POST" })
  .validator(
    (data: { applicationId: number; status: string; additionalData?: Record<string, unknown> }) =>
      data,
  )
  .handler(async ({ data }) => {
    await backendJson("/analytics/update-status", {
      method: "POST",
      body: JSON.stringify({
        application_id: data.applicationId,
        status: data.status,
        additional_data: data.additionalData || {},
      }),
    });
  });

export const analyticsService = {
  getEngagementAnalytics: (days: number = 30): Promise<EngagementAnalytics> =>
    getEngagementAnalyticsFn({ data: { days } }),

  getHeatmap: (): Promise<HeatmapData> => getHeatmapFn(),

  trackView: (applicationId: number): Promise<void> => trackViewFn({ data: { applicationId } }),

  updateStatus: (
    applicationId: number,
    status: string,
    additionalData?: Record<string, unknown>,
  ): Promise<void> => updateStatusFn({ data: { applicationId, status, additionalData } }),
};
