import { AlertCircle, CheckCircle2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApplicationStatusBannerProps {
  applying: boolean;
  applyAttempts: number;
  applyMaxAttempts: number;
  generatedFiles: {
    cv: string;
    cover_letter: string;
    interview_prep?: string;
    form_data?: string;
  } | null;
  error: string;
  onCancel: () => void;
}

/**
 * Constructs a download URL for generated files.
 * Handles both local development and production environments.
 */
function getDownloadUrl(filePath: string | undefined | null): string | null {
  if (!filePath) return null;

  // Get the API base URL, removing trailing /api if present
  const apiUrl = import.meta.env.VITE_API_URL;

  // For production: VITE_API_URL might be https://example.com/api
  // We need https://example.com as base, then append /api/storage/download...
  let baseUrl = "http://localhost:8000";

  if (apiUrl && typeof apiUrl === "string") {
    // Remove trailing /api if present to get the true base URL
    baseUrl = apiUrl.replace(/\/api\/?$/, "");
  }

  // Ensure the file path starts with /
  const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;

  return `${baseUrl}${normalizedPath}`;
}

export function ApplicationStatusBanner({
  applying,
  applyAttempts,
  applyMaxAttempts,
  generatedFiles,
  error,
  onCancel,
}: ApplicationStatusBannerProps) {
  const progress = Math.min(
    100,
    Math.round((applyAttempts / Math.max(1, applyMaxAttempts)) * 100),
  );

  const downloads = [
    { label: "Tailored CV", url: getDownloadUrl(generatedFiles?.cv) },
    { label: "Cover letter", url: getDownloadUrl(generatedFiles?.cover_letter) },
    { label: "Interview prep", url: getDownloadUrl(generatedFiles?.interview_prep) },
    { label: "Auto-fill answers", url: getDownloadUrl(generatedFiles?.form_data) },
  ].filter((d): d is { label: string; url: string } => !!d.url);

  return (
    <>
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-in fade-in duration-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {applying && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] animate-in fade-in duration-300"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-neutral-400" />
              <div className="min-w-0">
                <p className="font-medium text-neutral-900">Tailoring your application</p>
                <p className="text-sm text-neutral-500">
                  Rewriting your CV and cover letter for this role
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-neutral-900 transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-neutral-500">{progress}%</span>
          </div>
        </div>
      )}

      {generatedFiles && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-neutral-900">Your application is ready</p>
              <p className="mt-0.5 text-sm text-neutral-600">
                Download your files below. They&apos;re also saved on your
                Applications page.
              </p>
              {downloads.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {downloads.map((file) => (
                    <a
                      key={file.label}
                      href={file.url}
                      download
                      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-neutral-300 hover:bg-neutral-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {file.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
