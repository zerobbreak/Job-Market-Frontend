import { useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  AlertTriangle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCVAnalysis } from "@/api/queries";
import type { OutletContextType } from "@/components/layout/RootLayout";
import type { CVAnalysisSkillGap } from "@/api/types";
import { cn } from "@/lib/utils";

/** Keywords we treat as "highlighted" in the summary (e.g. from job trends) */
const HIGHLIGHT_TERMS = [
  "distributed systems",
  "cloud infrastructure",
  "microservices",
  "kubernetes",
  "k8s",
  "terraform",
  "rust",
  "event-driven",
  "auto-scaling",
  "ci/cd",
];

function highlightSummary(text: string) {
  if (!text) return null;
  const lower = text.toLowerCase();
  const segs: { s: string; hi: boolean }[] = [];
  let pos = 0;
  while (pos < text.length) {
    let found = -1;
    let len = 0;
    for (const t of HIGHLIGHT_TERMS) {
      const i = lower.indexOf(t, pos);
      if (i !== -1 && (found === -1 || i < found)) {
        found = i;
        len = t.length;
      }
    }
    if (found === -1) {
      segs.push({ s: text.slice(pos), hi: false });
      break;
    }
    if (found > pos) segs.push({ s: text.slice(pos, found), hi: false });
    segs.push({ s: text.slice(found, found + len), hi: true });
    pos = found + len;
  }
  if (segs.length === 0) return <>{text}</>;
  return (
    <>
      {segs.map((p, i) =>
        p.hi ? (
          <span key={i} className="text-primary font-medium">
            {p.s}
          </span>
        ) : (
          <span key={i}>{p.s}</span>
        ),
      )}
    </>
  );
}

function impactToClass(impact: string): string {
  switch (impact) {
    case "High":
      return "bg-accent/20 text-accent border-accent/40";
    case "Medium":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    case "Low":
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/40";
    default:
      return "bg-accent/20 text-accent border-accent/40";
  }
}

function impactLabel(impact: string): string {
  if (impact === "High") return "High Impact";
  if (impact === "Medium") return "Medium Impact";
  if (impact === "Low") return "Low Impact";
  return impact;
}

interface CVAnalysisViewProps {
  profile: OutletContextType["profile"];
}

export function CVAnalysisView({ profile: _profile }: CVAnalysisViewProps) {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useCVAnalysis() as any;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-6 w-32 bg-white/10" />
            <Card className="glass-card border-transparent">
              <CardContent className="p-6 space-y-5">
                <Skeleton className="h-7 w-48 bg-white/10" />
                <Skeleton className="h-4 w-36 bg-white/10" />
                <Skeleton className="h-16 w-full bg-white/10" />
                <Skeleton className="h-20 w-full bg-white/10" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-6 w-24 bg-white/10" />
            <Card className="glass-card border-transparent">
              <CardContent className="p-6 flex items-center gap-6">
                <Skeleton className="h-28 w-28 rounded-full bg-white/10" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full bg-white/10" />
                  <Skeleton className="h-4 w-3/4 bg-white/10" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const noProfile = (error as Error)?.message === "No profile";
  if (isError && noProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-6 text-center animate-fade-in">
        <FileText className="h-14 w-14 text-zinc-500 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No CV on file</h3>
        <p className="text-zinc-400 mb-6 max-w-md">
          Upload a CV to see your parsed details, match readiness score, and
          AI-generated skill gaps.
        </p>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={() => navigate("/profile")}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload CV
        </Button>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-6 text-center animate-fade-in">
        <AlertTriangle className="h-14 w-14 text-amber-500 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Could not load analysis
        </h3>
        <p className="text-zinc-400 mb-6 max-w-md">
          {(error as Error)?.message || "Something went wrong. Try again."}
        </p>
        <Button
          variant="outline"
          className="border-white/20"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  const doc = data?.uploaded_document;
  const ai = data?.ai_analysis;
  const parsing = data?.parsing_status;

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-6 text-center animate-fade-in">
        <AlertTriangle className="h-14 w-14 text-amber-500 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No CV data</h3>
        <p className="text-zinc-400 mb-6">Upload a CV to get started.</p>
        <Button
          variant="outline"
          className="border-white/20"
          onClick={() => navigate("/profile")}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload CV
        </Button>
      </div>
    );
  }

  const score = ai?.match_readiness_score ?? doc.skill_density_alignment;
  const summary = doc.professional_summary || "";
  const skills = doc.core_skills ?? [];
  const roleType = doc.role_type || "";

  return (
    <div className="space-y-6 animate-fade-in">
      {parsing && (
        <div className="flex justify-end">
          <Card className="glass-card border-transparent px-4 py-2">
            <div className="flex items-center gap-2">
              {(parsing.progress ?? 100) < 100 ? (
                <Loader2 className="h-4 w-4 text-accent animate-spin" />
              ) : null}
              <span className="text-xs font-medium text-zinc-400">
                CV PARSING ACTIVE
              </span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs text-zinc-300">
                {parsing.message || "Complete"} {parsing.progress ?? 100}%
              </span>
            </div>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Uploaded Document */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Uploaded Document
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-zinc-300 hover:bg-white/10 hover:text-white"
              onClick={() => navigate("/profile")}
            >
              <Upload className="h-4 w-4 mr-2" />
              Update CV
            </Button>
          </div>
          <Card className="glass-card border-transparent overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                  {doc.candidate_name || "—"}
                </h3>
                <p className="text-sm text-zinc-400 mt-1">{roleType || "—"}</p>
              </div>
              {summary && (
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                    Professional Summary
                  </p>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {highlightSummary(summary.slice(0, 400))}
                    {summary.length > 400 ? "…" : ""}
                  </p>
                </div>
              )}
              {skills.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                    Core Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 12).map((s: any, i: number) => (
                      <span
                        key={i}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-medium",
                          HIGHLIGHT_TERMS.some((t) =>
                            String(s).toLowerCase().includes(t),
                          )
                            ? "bg-primary/20 text-primary"
                            : "bg-white/5 text-zinc-400",
                        )}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  Experience
                </p>
                <p className="text-sm text-zinc-400">{doc.experience || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  Skill Density Alignment
                </p>
                <Progress
                  value={doc.skill_density_alignment ?? 0}
                  className="h-2 bg-white/10 [&>div]:bg-accent"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            AI Analysis
          </h2>
          <Card className="glass-card border-transparent">
            <CardContent className="p-6">
              {ai ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="flex items-center justify-center shrink-0">
                    <div
                      className={cn(
                        "w-28 h-28 rounded-full flex flex-col items-center justify-center border-2",
                        score >= 80
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : "bg-accent/10 border-accent/40 text-accent",
                      )}
                    >
                      <span className="text-3xl font-bold leading-none">
                        {score}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">
                      Match Readiness
                    </p>
                    <p className="text-sm text-zinc-300">
                      {ai.match_readiness_message}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="flex items-center justify-center shrink-0">
                    <div className="w-28 h-28 rounded-full flex flex-col items-center justify-center border-2 bg-accent/10 border-accent/40 text-accent">
                      <span className="text-3xl font-bold leading-none">
                        {score}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">
                      Match Readiness
                    </p>
                    <p className="text-sm text-zinc-300">
                      AI analysis is temporarily unavailable. Score is based on
                      profile completeness.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Critical Skill Gaps
            </h3>
            {ai?.skill_gaps && ai.skill_gaps.length > 0 ? (
              <div className="space-y-3">
                {ai.skill_gaps.map((gap: CVAnalysisSkillGap, i: number) => (
                  <Card
                    key={i}
                    className="glass-card border-transparent hover:border-accent/30 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-xs font-semibold border",
                            impactToClass(gap.impact),
                          )}
                        >
                          {impactLabel(gap.impact)}
                        </span>
                      </div>
                      <p className="font-medium text-white text-sm mb-1">
                        {gap.title}
                      </p>
                      <p className="text-sm text-zinc-400">{gap.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-card border-transparent">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-zinc-400">
                    {ai
                      ? "No critical skill gaps identified. Your profile aligns well with your target roles."
                      : "Upload a CV and run AI analysis to see personalized skill gap suggestions."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
