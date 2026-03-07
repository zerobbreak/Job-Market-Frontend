import { apiClient } from "@/utils/api";
import type { CVProfile, UploadCVResponse } from "../types";

export const cvService = {
  /**
   * List all CVs for the current user
   */
  list: async (): Promise<CVProfile[]> => {
    const response = await apiClient("/profiles", { method: "GET" });
    const data = await response.json();
    return data.profiles || [];
  },

  /**
   * Upload a new CV
   */
  upload: async (file: File, overwrite = false): Promise<UploadCVResponse> => {
    const formData = new FormData();
    formData.append("cv_file", file);
    if (overwrite) {
      formData.append("overwrite", "true");
    }

    const response = await apiClient("/profiles/cv/analyze", {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  /**
   * Delete a CV by file ID
   */
  delete: async (fileId: string) => {
    const response = await apiClient(`/profiles/${fileId}`, {
      method: "DELETE",
    });
    return response.json();
  },

  /**
   * Set a CV as active
   */
  setActive: async (fileId: string) => {
    const response = await apiClient(`/profiles/${fileId}/activate`, {
      method: "PUT",
    });
    return response.json();
  },
};
