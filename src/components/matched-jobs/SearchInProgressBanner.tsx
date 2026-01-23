import { Loader2 } from "lucide-react";

interface SearchInProgressBannerProps {
  loading: boolean;
}

export function SearchInProgressBanner({ loading }: SearchInProgressBannerProps) {
  if (!loading) return null;

  return (
    <div
      className="bg-blue-500/10 border border-blue-500/20 text-blue-200 px-4 py-3 rounded-xl flex items-center gap-4 animate-fade-in"
      role="status"
      aria-live="polite"
      aria-label="Search in progress"
    >
      <div className="p-2 bg-blue-500/20 rounded-full shrink-0">
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-blue-100">
          Searching for jobs...
        </p>
        <p className="text-sm text-blue-200/90">
          Matching your profile. This may take a moment.
        </p>
      </div>
    </div>
  );
}
