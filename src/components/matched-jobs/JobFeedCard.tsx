import {
  Building2,
  Cloud,
  Rocket,
  Shield,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface JobFeedCardJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  skills?: string[];
}

export interface JobFeedCardMatch {
  job: JobFeedCardJob;
  match_score: number;
  match_reasons: string[];
}

const ICONS = [Building2, Cloud, Rocket, Shield, TrendingUp] as const;

function getMatchBadgeClass(score: number) {
  if (score >= 90)
    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (score >= 85) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (score >= 80) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  if (score >= 70) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
}

function getIcon(idx: number) {
  return ICONS[idx % ICONS.length];
}

export function JobFeedCard({
  match,
  index,
  onApply,
}: {
  match: JobFeedCardMatch;
  index: number;
  onApply?: (job: JobFeedCardJob) => void;
}) {
  const Icon = getIcon(index);
  const snippet = match.job.description?.slice(0, 120)?.trim();
  const tags = (match.job.skills ?? []).slice(0, 2).map((s) => s.toUpperCase());

  return (
    <Card className="group border-border/50 bg-card/40 backdrop-blur-sm hover:border-primary/40 hover:bg-card/60 transition-all overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-white/5 text-accent">
            <Icon className="h-5 w-5" />
          </div>
          <Badge
            className={cn(
              "font-bold text-[10px] uppercase tracking-wider shrink-0",
              getMatchBadgeClass(match.match_score),
            )}
          >
            {match.match_score}% Match
          </Badge>
        </div>
        <h3 className="text-base font-semibold text-white mb-1.5 line-clamp-2">
          {match.job.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-2 font-medium">
          {match.job.company} <span className="text-border mx-1">•</span>{" "}
          {match.job.location}
        </p>
        {snippet && (
          <p className="text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
            {snippet}&hellip;
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md text-xs font-medium bg-white/5 text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          {match.job.url && /^https?:\/\//.test(match.job.url) && (
            <a
              href={match.job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-border bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-sm font-medium transition-colors"
            >
              View details
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {onApply && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApply(match.job);
              }}
              className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors shadow-lg shadow-primary/20"
            >
              Analyze Fit
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
