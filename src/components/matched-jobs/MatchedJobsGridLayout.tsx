import { JobFeedCard } from "./JobFeedCard";
import type { PipelineJob } from "./HighMatchPipelineSidebar";

interface MatchedJobsGridLayoutProps {
  filteredMatchedJobs: PipelineJob[];
  handleApply: (job: PipelineJob["job"]) => void;
  isLoading?: boolean;
}

export function MatchedJobsGridLayout({
  filteredMatchedJobs,
  handleApply,
  isLoading = false,
}: MatchedJobsGridLayoutProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex justify-between gap-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
              <div className="h-5 w-14 animate-pulse rounded-full bg-neutral-100" />
            </div>
            <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-neutral-100" />
            <div className="mt-5 h-3 w-full animate-pulse rounded bg-neutral-100" />
            <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-neutral-100" />
            <div className="mt-5 h-9 w-32 animate-pulse rounded-full bg-neutral-100" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredMatchedJobs.length === 0) {
    return null; // Handled by parent EmptyState
  }

  const sorted = [...filteredMatchedJobs].sort((a, b) => b.match_score - a.match_score);

  return (
    <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {sorted.map((match, i) => (
        <li
          key={match.job.id}
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
          style={{ animationDelay: `${Math.min(i, 8) * 60}ms`, animationDuration: "500ms" }}
        >
          <JobFeedCard match={match} index={i} onApply={handleApply} />
        </li>
      ))}
    </ul>
  );
}
