import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PipelineJob {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    url: string;
    skills?: string[];
  };
  match_score: number;
  match_reasons: string[];
}

interface HighMatchPipelineSidebarProps {
  jobs: PipelineJob[];
  selectedJobId: string | null;
  onSelectJob: (job: PipelineJob) => void;
  className?: string;
}

/** Placeholder when we have no salary data – optional future API */
const salaryPlaceholder = "Competitive";

export function HighMatchPipelineSidebar({
  jobs,
  selectedJobId,
  onSelectJob,
  className,
}: HighMatchPipelineSidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col w-full max-w-sm shrink-0 border-r border-white/10 bg-[#16162a]",
        className
      )}
    >
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-[#a78bfa]">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Cockpit AI</span>
        </div>
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          High Match Pipeline
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[40vh] lg:max-h-none">
        {jobs.map((match) => {
          const isSelected = selectedJobId === match.job.id;
          return (
            <button
              key={match.job.id}
              type="button"
              onClick={() => onSelectJob(match)}
              className={cn(
                "w-full text-left p-3 rounded-xl transition-all",
                isSelected
                  ? "bg-[#a78bfa]/20 border border-[#a78bfa]/40"
                  : "hover:bg-white/5 border border-transparent"
              )}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white text-sm truncate">
                    {match.job.title}
                  </p>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {match.job.company}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-zinc-500">
                      {salaryPlaceholder}
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-xs text-zinc-500 truncate max-w-[120px]">
                      {match.job.location || "—"}
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-xs font-bold px-2 py-0.5 rounded-md",
                    match.match_score >= 90
                      ? "bg-emerald-500/20 text-emerald-400"
                      : match.match_score >= 80
                      ? "bg-[#a78bfa]/20 text-[#a78bfa]"
                      : "bg-amber-500/20 text-amber-400"
                  )}
                >
                  {match.match_score}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
