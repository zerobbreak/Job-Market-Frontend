import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApplicationStatusBannerProps {
  applying: boolean;
  applyAttempts: number;
  applyMaxAttempts: number;
  generatedFiles: {
    cv: string;
    cover_letter: string;
    interview_prep?: string;
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
  // Pre-compute download URLs with null safety
  const cvUrl = generatedFiles?.cv ? getDownloadUrl(generatedFiles.cv) : null;
  const coverLetterUrl = generatedFiles?.cover_letter
    ? getDownloadUrl(generatedFiles.cover_letter)
    : null;
  const interviewPrepUrl = generatedFiles?.interview_prep
    ? getDownloadUrl(generatedFiles.interview_prep)
    : null;
  return (
    <>
      {error && (
        <div className="bg-destructive/15 border border-destructive/20 text-destructive-foreground px-4 py-3 rounded-xl animate-fade-in">
          {error}
        </div>
      )}

      {applying && (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 px-4 py-3 rounded-xl flex items-center justify-between animate-fade-in p-6 shadow-lg shadow-blue-500/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">
                Generating Application...
              </h3>
              <p className="text-sm text-blue-300">
                Tailoring your CV and writing a cover letter (
                {Math.min(
                  100,
                  Math.round((applyAttempts / applyMaxAttempts) * 100)
                )}
                %)
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="hover:bg-blue-100 border-blue-300"
          >
            Cancel
          </Button>
        </div>
      )}

      {generatedFiles && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl animate-fade-in p-6 shadow-lg shadow-green-500/10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500/20 rounded-full shrink-0">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-100 mb-1">
                Application Generated Successfully!
              </h3>
              <p className="text-sm text-green-300 mb-4">
                Your tailored CV and cover letter are ready to download.
              </p>

              {/* Download Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {cvUrl && (
                  <a
                    href={cvUrl}
                    download
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium text-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                    Download CV
                  </a>
                )}

                {coverLetterUrl && (
                  <a
                    href={coverLetterUrl}
                    download
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium text-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                    Download Cover Letter
                  </a>
                )}

                {interviewPrepUrl && (
                  <a
                    href={interviewPrepUrl}
                    download
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium text-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                    Download Interview Prep
                  </a>
                )}
              </div>

              <p className="text-xs text-green-400 mt-3">
                💡 Files are also saved in your Applications page for future
                reference.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
