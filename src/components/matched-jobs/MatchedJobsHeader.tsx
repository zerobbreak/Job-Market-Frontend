import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatchedJobsHeaderProps {
  loading: boolean;
  onSearch: (force?: boolean) => void;
  hasProfile: boolean;
  count?: number;
}

export function MatchedJobsHeader({
  loading,
  onSearch,
  hasProfile,
  count = 0,
}: MatchedJobsHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-sm text-neutral-500">Top matches</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          {loading
            ? "Looking for new jobs…"
            : count > 0
              ? `${count} ${count === 1 ? "role" : "roles"} worth applying to`
              : "Roles worth applying to"}
        </h1>
        <p className="mt-2 max-w-xl text-neutral-600 text-pretty">
          Pick one and we&apos;ll tailor your CV and cover letter to it before
          you apply.
        </p>
      </div>
      <Button
        variant="outline"
        onClick={() => onSearch(true)} // Pass true to force refresh
        disabled={loading || !hasProfile}
        className="self-start sm:self-auto"
      >
        {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
        {loading ? "Searching…" : "Search again"}
      </Button>
    </header>
  );
}
