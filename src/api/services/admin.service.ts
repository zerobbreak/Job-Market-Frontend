import { createServerFn } from "@tanstack/react-start";
import { backendJson } from "@/lib/backend.server";

export interface HealthData {
  status: string;
  task_manager: {
    active_threads: number;
    total_processed: number;
    status: string;
  };
  system: {
    cpu_percent: number;
    memory_usage_mb: number;
    uptime_seconds: number;
  };
  business_metrics: {
    recent_job_failures: number;
    total_applications: number;
    application_breakdown: Record<string, number>;
  };
}

const getSystemStatsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<HealthData> => {
    return backendJson<HealthData>("/admin/system-stats");
  },
);

export const adminService = {
  getSystemStats: (): Promise<HealthData> => getSystemStatsFn(),
};
