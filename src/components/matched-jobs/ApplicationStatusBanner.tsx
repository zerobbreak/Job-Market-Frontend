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

export function ApplicationStatusBanner({
  applying,
  applyAttempts,
  applyMaxAttempts,
  generatedFiles,
  error,
  onCancel,
}: ApplicationStatusBannerProps) {
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
                <a
                  href={`${
                    import.meta.env.VITE_API_URL?.replace(/\/api$/, "") ||
                    "http://localhost:8000"
                  }${generatedFiles.cv}`}
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

                <a
                  href={`${
                    import.meta.env.VITE_API_URL?.replace(/\/api$/, "") ||
                    "http://localhost:8000"
                  }${generatedFiles.cover_letter}`}
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

                {generatedFiles.interview_prep && (
                  <a
                    href={`${
                      import.meta.env.VITE_API_URL?.replace(/\/api$/, "") ||
                      "http://localhost:8000"
                    }${generatedFiles.interview_prep}`}
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
