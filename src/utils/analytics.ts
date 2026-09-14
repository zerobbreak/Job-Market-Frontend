import { createServerFn } from "@tanstack/react-start";
import { backendFetch } from "@/lib/backend.server";

const trackEventFn = createServerFn({ method: "POST" })
  .validator((data: { event: string; properties?: Record<string, any>; page?: string }) => data)
  .handler(async ({ data }) => {
    await backendFetch("/analytics", {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export async function track(event: string, properties?: Record<string, any>, page?: string) {
  try {
    await trackEventFn({ data: { event, properties, page } });
  } catch (e) {
    console.warn("Analytics track failed", e);
  }
}
