import { createServerFn } from "@tanstack/react-start";
import { backendJson } from "@/lib/backend.server";
import type { ProfileData } from "../types";

const getStructuredFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProfileData | null> => {
    const data = await backendJson<{ success: boolean; profile: ProfileData }>(
      "/profiles/me/structured",
      { method: "GET" },
    );
    return data.success ? data.profile : null;
  },
);

interface UpdateProfileResult {
  success: boolean;
  profile?: ProfileData;
  error?: string;
}

const updateFn = createServerFn({ method: "POST" })
  .validator((data: Partial<ProfileData>) => data)
  .handler(async ({ data }): Promise<UpdateProfileResult> => {
    return backendJson<UpdateProfileResult>("/profiles/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  });

export const profileService = {
  getStructured: (): Promise<ProfileData | null> => getStructuredFn(),
  update: (data: Partial<ProfileData>): Promise<UpdateProfileResult> => updateFn({ data }),
};
