import { createServerFn } from "@tanstack/react-start";
import { backendFetch, backendJson } from "@/lib/backend.server";

const getSignedUrlFn = createServerFn({ method: "POST" })
  .validator(
    (data: { fileId: string; bucketId: string; fileType?: string; expiresIn?: number }) =>
      data,
  )
  .handler(async ({ data }) => {
    return backendJson<{ url: string }>("/files/signed-url", {
      method: "POST",
      body: JSON.stringify({
        file_id: data.fileId,
        bucket_id: data.bucketId,
        file_type: data.fileType ?? "storage",
        expires_in: data.expiresIn ?? 3600,
      }),
    });
  });

const downloadFileFn = createServerFn({ method: "GET" })
  .validator((data: { endpoint: string }) => data)
  .handler(async ({ data }) => {
    const response = await backendFetch(data.endpoint);
    if (!response.ok) throw new Error("Download failed");
    return response;
  });

export const filesService = {
  getSignedUrl: (fileId: string, bucketId: string, fileType?: string, expiresIn?: number) =>
    getSignedUrlFn({ data: { fileId, bucketId, fileType, expiresIn } }),
  downloadFile: (endpoint: string) => downloadFileFn({ data: { endpoint } }),
};
