import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { TrendingUp, Building2, RefreshCw } from "lucide-react";
import { HighMatchPipelineSidebar, type PipelineJob } from "./HighMatchPipelineSidebar";
import { JobDetailView } from "./JobDetailView";
import { JobCardSkeleton } from "./JobCardSkeleton";
import { cn } from "@/lib/utils";

interface MatchedJobsDetailLayoutProps {
  filteredMatchedJobs: PipelineJob[];
  minMatchScore: number;
  setMinMatchScore: (v: number) => void;
  findMatches: (forceRefresh?: boolean) => void;
  handleApply: (job: PipelineJob["job"]) => void;
  isLoading?: boolean;
}

export function MatchedJobsDetailLayout({
  filteredMatchedJobs,
  minMatchScore,
  setMinMatchScore,
  findMatches,
  handleApply,
  isLoading = false,
}: MatchedJobsDetailLayoutProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const selectedMatch = filteredMatchedJobs.find((m) => m.job.id === selectedJobId) ?? filteredMatchedJobs[0];

  useEffect(() => {
    if (filteredMatchedJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(filteredMatchedJobs[0].job.id);
    }
    if (filteredMatchedJobs.length > 0 && selectedJobId) {
      const stillExists = filteredMatchedJobs.some((m) => m.job.id === selectedJobId);
      if (!stillExists) setSelectedJobId(filteredMatchedJobs[0].job.id);
    }
    if (filteredMatchedJobs.length === 0) setSelectedJobId(null);
  }, [filteredMatchedJobs, selectedJobId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="border-white/10 bg-[#1e1e36]">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <Label className="text-base font-medium text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#a78bfa]" />
                Minimum Match Score
              </Label>
              <span className="text-sm text-zinc-400">{minMatchScore}%</span>
            </div>
            <Slider
              value={[minMatchScore]}
              onValueChange={(v) => setMinMatchScore(v[0])}
              max={100}
              step={1}
              className="w-full"
            />
          </CardContent>
        </Card>
        <div className="flex gap-4 min-h-[400px]">
          <div className="w-72 shrink-0 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <JobCardSkeleton key={i} viewMode="grid" />
            ))}
          </div>
          <div className="flex-1 rounded-xl border border-white/10 bg-[#1e1e36] p-6">
            <div className="h-8 w-48 rounded bg-white/10 mb-4" />
            <div className="h-4 w-full rounded bg-white/10 mb-2" />
            <div className="h-4 w-3/4 rounded bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (filteredMatchedJobs.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="border-white/10 bg-[#1e1e36]">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <Label className="text-base font-medium text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#a78bfa]" />
                Minimum Match Score
              </Label>
              <span className="text-sm text-zinc-400">{minMatchScore}%</span>
            </div>
            <Slider
              value={[minMatchScore]}
              onValueChange={(v) => setMinMatchScore(v[0])}
              max={100}
              step={1}
              className="w-full"
            />
          </CardContent>
        </Card>
        <div className="text-center py-20 rounded-2xl border border-white/10 bg-[#1e1e36]">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
          <h3 className="text-lg font-semibold text-white mb-2">No matches found</h3>
          <p className="text-sm text-zinc-400 mb-4 max-w-md mx-auto">
            Try lowering the minimum match score or refresh to search again.
          </p>
          <Button
            onClick={() => findMatches(true)}
            variant="outline"
            className="gap-2 border-white/20 text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Search Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-white/10 bg-[#1e1e36]">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <Label className="text-base font-medium text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#a78bfa]" />
              Minimum Match Score
            </Label>
            <span className="text-sm text-zinc-400">{minMatchScore}%</span>
          </div>
          <Slider
            value={[minMatchScore]}
            onValueChange={(v) => setMinMatchScore(v[0])}
            max={100}
            step={1}
            className="w-full"
          />
        </CardContent>
      </Card>

      <div className={cn("flex flex-col lg:flex-row gap-0 border border-white/10 rounded-xl overflow-hidden bg-[#16162a] min-h-[560px]")}>
        <HighMatchPipelineSidebar
          jobs={filteredMatchedJobs}
          selectedJobId={selectedJobId}
          onSelectJob={(m) => setSelectedJobId(m.job.id)}
          className="lg:w-80 lg:min-h-[560px]"
        />
        <div className="flex-1 min-h-0 bg-[#1A1A2E]">
          {selectedMatch ? (
            <JobDetailView
              match={selectedMatch}
              onApply={handleApply}
              onOpenListing={
                hasValidUrl(selectedMatch.job.url)
                  ? (url) => window.open(url, "_blank")
                  : undefined
              }
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
              <p className="text-zinc-400">Select a job from the pipeline</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function hasValidUrl(url: unknown): url is string {
  return typeof url === "string" && /^https?:\/\//.test(url);
}
