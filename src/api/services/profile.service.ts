import { createServerFn } from "@tanstack/react-start";
import { backendJson } from "@/lib/backend.server";
import type { ProfileData } from "../types";

const getStructuredFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProfileData | null> => {
    // The backend returns the profile fields flat ({ success, name, skills, ... }),
    // not nested under `profile`. A user with no profile gets all-empty defaults.
    const { success, ...profile } = await backendJson<
      { success: boolean } & ProfileData
    >("/profiles/me/structured", { method: "GET" });
    const hasProfile = Boolean(profile.name || profile.email || profile.skills?.length);
    // Never return undefined — TanStack Query rejects it as query data.
    return success && hasProfile ? profile : null;
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
