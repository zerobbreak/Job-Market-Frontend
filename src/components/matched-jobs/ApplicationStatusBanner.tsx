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
        <div className="bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3 rounded-xl flex items-center gap-4 animate-fade-in p-6">
          <div className="p-3 bg-green-500/20 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-green-100">
              Application Generated!
            </h3>
            <p className="text-sm text-green-300">
              Your tailored CV and cover letter are ready. Check 'Applications'
              to view them.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
