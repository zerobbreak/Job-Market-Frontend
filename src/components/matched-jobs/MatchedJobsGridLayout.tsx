import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Banknote, Sparkles } from "lucide-react";
import type { PipelineJob } from "./HighMatchPipelineSidebar";
import { cn } from "@/lib/utils";

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="bg-[#12121a] border-white/5 h-[320px] rounded-2xl p-6"
          >
            <div className="h-6 w-3/4 bg-white/5 rounded mx-auto mb-4" />
            <div className="h-4 w-1/2 bg-white/5 rounded mx-auto mb-8" />
            <div className="space-y-2 mb-8">
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-5/6 bg-white/5 rounded" />
            </div>
            <div className="h-12 w-full bg-white/5 rounded-xl" />
          </Card>
        ))}
      </div>
    );
  }

  if (filteredMatchedJobs.length === 0) {
    return null; // Handled by parent EmptyState
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <p className="text-zinc-400 text-sm mb-1">Found for you today</p>
        <h2 className="text-2xl font-bold text-white">
          {filteredMatchedJobs.length} high-intent opportunities
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatchedJobs.map((match) => {
          const job = match.job;
          // generate random color variants for skills to simulate the mockup's match/unmatch borders
          // the mockup has green pills and gray pills.
          const renderSkills = () => {
            const allSkills =
              job.skills && job.skills.length > 0
                ? job.skills
                : ["React", "TypeScript", "Node.js", "System Design"];
            return allSkills.slice(0, 5).map((skill, idx) => {
              const isMatch = idx % 2 === 0; // Simulate match logic
              return (
                <span
                  key={idx}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium border rounded-full whitespace-nowrap",
                    isMatch
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-white/5 border-white/10 text-zinc-400",
                  )}
                >
                  {skill}
                </span>
              );
            });
          };

          return (
            <Card
              key={job.id}
              className="bg-[#12121a] border-[#2a2a35] hover:border-[#3a3a45] transition-colors rounded-2xl flex flex-col p-6 overflow-hidden relative group"
            >
              <div className="flex justify-between items-start mb-2 gap-4">
                <h3 className="text-xl font-bold text-white leading-tight line-clamp-2">
                  {job.title}
                </h3>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-extrabold text-[#a78bfa] leading-none mb-1">
                    {match.match_score}%
                  </div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">
                    Match
                  </div>
                </div>
              </div>

              <div className="text-sm text-zinc-400 mb-4">
                {job.company} <span className="mx-1.5">•</span>{" "}
                {job.location || "Remote"}
              </div>

              <div className="flex items-center gap-2 text-zinc-300 font-medium text-sm mb-6 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                <Banknote className="w-4 h-4 text-zinc-400" />
                $160k – $210k
              </div>

              <div className="mb-6 flex-1">
                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3">
                  Skill Match
                </div>
                <div className="flex flex-wrap gap-2">{renderSkills()}</div>
              </div>

              <Button
                onClick={() => handleApply(job)}
                className="w-full h-12 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-base shadow-lg shadow-purple-500/20 border-0"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Apply with Agent
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
