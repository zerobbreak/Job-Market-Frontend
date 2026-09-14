import { createServerFn } from "@tanstack/react-start";
import { backendJson } from "@/lib/backend.server";

export interface Application {
  id: string;
  jobTitle: string;
  company: string;
  jobUrl?: string;
  location?: string;
  status: "pending" | "applied" | "interview" | "rejected";
  appliedDate: string;
  files?: { cv: string; cover_letter: string; interview_prep?: string };
}

export interface ApplicationsPage {
  applications: Application[];
  page: number;
  total: number;
}

const listFn = createServerFn({ method: "GET" })
  .validator((data: { page: number; limit: number }) => data)
  .handler(async ({ data }): Promise<ApplicationsPage> => {
    const res = await backendJson<{
      applications?: Application[];
      page?: number;
      total?: number;
    }>(`/applications?page=${data.page}&limit=${data.limit}`);
    return {
      applications: res.applications || [],
      page: res.page || data.page,
      total: res.total || res.applications?.length || 0,
    };
  });

const updateStatusFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: Application["status"] }) => data)
  .handler(async ({ data }) => {
    return backendJson<{ success?: boolean; error?: string }>(
      `/applications/${data.id}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status: data.status }),
      },
    );
  });

export const applicationsService = {
  list: (page: number, limit: number) => listFn({ data: { page, limit } }),
  updateStatus: (id: string, status: Application["status"]) =>
    updateStatusFn({ data: { id, status } }),
};
