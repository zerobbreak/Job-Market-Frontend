import { createServerFn } from "@tanstack/react-start";
import { backendFetch, backendJson } from "@/lib/backend.server";
import type { CVProfile, UploadCVResponse } from "../types";

const listFn = createServerFn({ method: "GET" }).handler(async (): Promise<CVProfile[]> => {
  const data = await backendJson<{ profiles?: CVProfile[] }>("/profiles", { method: "GET" });
  return data.profiles || [];
});

const uploadFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data }): Promise<UploadCVResponse> => {
    const response = await backendFetch("/profiles/cv/analyze", {
      method: "POST",
      body: data,
    });
    return response.json();
  });

interface SimpleResult {
  success?: boolean;
  error?: string;
}

const deleteFn = createServerFn({ method: "POST" })
  .validator((data: { fileId: string }) => data)
  .handler(async ({ data }): Promise<SimpleResult> => {
    return backendJson<SimpleResult>(`/profiles/${data.fileId}`, { method: "DELETE" });
  });

const setActiveFn = createServerFn({ method: "POST" })
  .validator((data: { fileId: string }) => data)
  .handler(async ({ data }): Promise<SimpleResult> => {
    return backendJson<SimpleResult>(`/profiles/${data.fileId}/activate`, { method: "PUT" });
  });

const regenerateFn = createServerFn({ method: "POST" }).handler(async () => {
  return backendJson<{
    success: boolean;
    error?: string;
    optimized_cv?: string;
    message?: string;
    keyword_matches?: string[];
    ats_score?: number;
  }>("/profiles/cv/regenerate", { method: "POST" });
});

export const cvService = {
  list: (): Promise<CVProfile[]> => listFn(),

  upload: (file: File, overwrite = false): Promise<UploadCVResponse> => {
    const formData = new FormData();
    formData.append("cv_file", file);
    if (overwrite) {
      formData.append("overwrite", "true");
    }
    return uploadFn({ data: formData });
  },

  delete: (fileId: string) => deleteFn({ data: { fileId } }),

  setActive: (fileId: string) => setActiveFn({ data: { fileId } }),

  regenerate: () => regenerateFn(),
};
