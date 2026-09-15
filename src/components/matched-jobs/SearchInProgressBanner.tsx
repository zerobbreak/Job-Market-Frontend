import { Loader2 } from "lucide-react";

interface SearchInProgressBannerProps {
  loading: boolean;
}

export function SearchInProgressBanner({ loading }: SearchInProgressBannerProps) {
  if (!loading) return null;

  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)] animate-in fade-in duration-300"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-neutral-400" />
      <p>
        <span className="font-medium text-neutral-900">
          Searching LinkedIn, Indeed, and more.
        </span>{" "}
        <span className="text-neutral-500">This may take a moment.</span>
      </p>
    </div>
  );
}
