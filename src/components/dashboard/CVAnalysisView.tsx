import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfileData, CVAnalysisSkillGap } from "@/api/types";
import { getProfileStrength } from "@/components/profile/ProfileStrength";
import { cn } from "@/lib/utils";

type AiAnalysis = {
  match_readiness_score?: number;
  match_readiness_message?: string;
  skill_gaps?: CVAnalysisSkillGap[];
};

const cardClass =
  "rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

const IMPACT_STYLES: Record<string, string> = {
  High: "bg-neutral-900 text-white",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-neutral-100 text-neutral-600",
};

function Row({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className={children ? "text-neutral-900" : "text-neutral-400"}>
        {children || "Not found"}
      </dd>
    </div>
  );
}

interface CVAnalysisViewProps {
  profile: ProfileData | null;
}

export function CVAnalysisView({ profile }: CVAnalysisViewProps) {
  if (!profile) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
        <p className="font-medium text-neutral-900">No CV on file</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500 text-pretty">
          Upload a CV to see what we read from it and where it could be stronger.
        </p>
        <Button asChild className="mt-6">
          <Link to="/profile">Upload a CV</Link>
        </Button>
      </div>
    );
  }

  const extra = profile as ProfileData & {
    summary?: string;
    title?: string;
    ai_analysis?: unknown;
  };

  let ai: AiAnalysis | null = null;
  try {
    if (extra.ai_analysis) {
      ai =
        typeof extra.ai_analysis === "string"
          ? JSON.parse(extra.ai_analysis)
          : (extra.ai_analysis as AiAnalysis);
    }
  } catch (e) {
    console.error("Failed to parse ai_analysis from profile", e);
  }

  const score = ai?.match_readiness_score ?? getProfileStrength(profile).score;
  const summary = extra.summary || profile.career_goals || "";
  const role = extra.title || profile.experience_level || "";
  const skills = profile.skills ?? [];
  const gaps = ai?.skill_gaps ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <section className={cn(cardClass, "p-6")}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-medium text-neutral-900">What we read from your CV</h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              Something wrong? Fix it on your profile.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/profile">
              Edit
              <ArrowUpRight />
            </Link>
          </Button>
        </div>

        <dl className="space-y-4 text-sm">
          <Row label="Name">{profile.name}</Row>
          <Row label="Role">{role}</Row>
          <Row label="Location">{profile.location}</Row>
          <Row label="Summary">
            {summary ? (
              <span className="whitespace-pre-line leading-relaxed">
                {summary.length > 400 ? `${summary.slice(0, 400)}…` : summary}
              </span>
            ) : undefined}
          </Row>
          <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4">
            <dt className="text-neutral-500">Skills</dt>
            <dd className="flex flex-wrap gap-1.5">
              {skills.length > 0 ? (
                skills.slice(0, 16).map((skill, i) => (
                  <span
                    key={`${skill}-${i}`}
                    className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-neutral-400">None found</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <div className="space-y-6">
        <section className={cn(cardClass, "p-6")}>
          <p className="text-sm text-neutral-500">Match readiness</p>
          <p
            className={cn(
              "mt-2 text-5xl font-semibold tracking-tight tabular-nums",
              score >= 80 ? "text-emerald-700" : "text-neutral-900",
            )}
          >
            {score}%
          </p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-700"
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600 text-pretty">
            {ai?.match_readiness_message ||
              "A detailed analysis isn't available for this CV yet, so this score shows how complete your profile is."}
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-neutral-900">Skill gaps</h2>
          {gaps.length > 0 ? (
            <ul className="space-y-3">
              {gaps.map((gap, i) => (
                <li key={i} className={cn(cardClass, "p-4")}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-neutral-900">{gap.title}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                        IMPACT_STYLES[gap.impact] ?? IMPACT_STYLES.Low,
                      )}
                    >
                      {gap.impact} impact
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">{gap.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className={cn(cardClass, "p-5 text-sm text-neutral-600")}>
              {ai
                ? "No big gaps for the roles you're targeting."
                : "Skill gaps show up here once your CV has been fully analysed."}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
