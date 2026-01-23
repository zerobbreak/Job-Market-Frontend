import {
  Building2,
  MapPin,
  Bookmark,
  Share2,
  ExternalLink,
  Settings,
  Users,
  BarChart2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { PipelineJob } from "./HighMatchPipelineSidebar";

interface JobDetailViewProps {
  match: PipelineJob;
  onApply: (job: PipelineJob["job"]) => void;
  onOpenListing?: (url: string) => void;
  className?: string;
}

const salaryPlaceholder = "Competitive";
const bonusPlaceholder = "Equity & Bonus";

export function JobDetailView({
  match,
  onApply,
  onOpenListing,
  className,
}: JobDetailViewProps) {
  const { job, match_score, match_reasons } = match;
  const isHighPriority = match_score >= 90;
  const skills = job.skills ?? [];
  const hasValidUrl = typeof job.url === "string" && /^https?:\/\//.test(job.url);

  const handleShare = () => {
    if (hasValidUrl && navigator.share) {
      navigator.share({
        title: job.title,
        text: `${job.title} at ${job.company}`,
        url: job.url,
      }).catch(() => {});
    } else if (hasValidUrl) {
      navigator.clipboard.writeText(job.url).catch(() => {});
    }
  };

  return (
    <div className={cn("flex-1 min-w-0 overflow-y-auto", className)}>
      <div className="max-w-4xl space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-[#a78bfa]" />
                {job.company}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#a78bfa]" />
                {job.location || "—"}
              </span>
              {isHighPriority && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#a78bfa]/20 text-[#a78bfa] border border-[#a78bfa]/40">
                  High priority
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-white/10"
              onClick={() => {}}
              title="Save"
            >
              <Bookmark className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-white/10"
              onClick={handleShare}
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            {hasValidUrl && onOpenListing && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-white/20 text-zinc-300 hover:bg-white/10 hover:text-white"
                onClick={() => onOpenListing(job.url)}
              >
                <ExternalLink className="h-4 w-4" />
                Original listing
              </Button>
            )}
          </div>
        </div>

        {/* Three overview cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Total compensation */}
          <Card className="border-white/10 bg-[#1e1e36]">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Total compensation
              </p>
              <p className="text-xl font-bold text-white mb-1">
                {salaryPlaceholder}
              </p>
              <p className="text-sm text-zinc-500">+ {bonusPlaceholder}</p>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Base salary</span>
                  </div>
                  <Progress
                    value={75}
                    className="h-2 bg-white/10 [&>div]:bg-[#a78bfa]"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Target bonus</span>
                  </div>
                  <Progress
                    value={40}
                    className="h-2 bg-white/10 [&>div]:bg-[#a78bfa]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Match score */}
          <Card className="border-white/10 bg-[#1e1e36] flex items-center justify-center">
            <CardContent className="p-4 flex flex-col items-center">
              <div
                className={cn(
                  "w-24 h-24 rounded-full flex flex-col items-center justify-center border-2",
                  match_score >= 90
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "bg-[#a78bfa]/10 border-[#a78bfa]/40 text-[#a78bfa]"
                )}
              >
                <span className="text-2xl font-bold leading-none">{match_score}%</span>
              </div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mt-2">
                Match
              </p>
            </CardContent>
          </Card>

          {/* Why you're a great fit */}
          <Card className="border-white/10 bg-[#1e1e36] md:col-span-1">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                Why you&apos;re a great fit
              </p>
              <p className="text-sm text-zinc-300 mb-3 line-clamp-4">
                {match_reasons.length > 0
                  ? match_reasons.slice(0, 2).join(" ")
                  : "Your profile aligns well with this role based on skills and experience."}
              </p>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 5).map((s, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-md text-xs font-medium bg-white/5 text-zinc-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom row: The Role, About Company, Agent Insight */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* The Role */}
          <div className="lg:col-span-2 space-y-4 relative">
            <h2 className="text-lg font-semibold text-white">The Role</h2>
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {job.description || "No description available."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
              <p className="text-sm text-zinc-500">
                Ready to go? Match probability: <strong className="text-[#a78bfa]">{match_score}%</strong>
              </p>
              <Button
                className="bg-[#a78bfa] hover:bg-[#936eea] text-white rounded-xl px-6 py-6 text-base font-semibold shadow-lg shadow-[#a78bfa]/20"
                onClick={() => onApply(job)}
              >
                Apply with AI
              </Button>
            </div>
          </div>

          {/* About Company + Agent Insight */}
          <div className="space-y-4">
            <Card className="border-white/10 bg-[#1e1e36]">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold text-white mb-3">
                  About {job.company}
                </h2>
                <p className="text-sm text-zinc-400 mb-4">
                  Learn more about {job.company} from the official listing or
                  company website.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Users className="h-4 w-4 text-[#a78bfa]" />
                    <span>Company size: —</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <BarChart2 className="h-4 w-4 text-[#a78bfa]" />
                    <span>Market phase: —</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-[#1e1e36]">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#a78bfa]" />
                  Agent insight
                </h2>
                <p className="text-sm text-zinc-400">
                  {match_reasons.length > 0
                    ? match_reasons.join(" ").slice(0, 280) +
                      (match_reasons.join(" ").length > 280 ? "…" : "")
                    : "Your profile matches this role well. Consider applying to explore fit."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
