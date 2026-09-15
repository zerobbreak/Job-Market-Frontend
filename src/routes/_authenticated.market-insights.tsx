import { useMemo } from "react";
import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profileQueryOptions } from "@/api/queries/options";
import { useJobMatching } from "@/hooks/useJobMatching";
import { useMatchedJobsCache } from "@/hooks/useMatchedJobsCache";
import type { JobFeedCardMatch } from "@/components/matched-jobs/JobFeedCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/market-insights")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(profileQueryOptions());
  },
  component: MarketInsights,
});

type Count = { label: string; count: number };

/** Case-insensitive tally of values, most common first. */
function topCounts(values: string[], limit: number): Count[] {
  const counts = new Map<string, Count>();
  for (const raw of values) {
    const label = raw.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    const entry = counts.get(key);
    if (entry) entry.count += 1;
    else counts.set(key, { label, count: 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

const cardClass =
  "rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

function Panel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(cardClass, "p-5 sm:p-6", className)}>
      <h2 className="font-medium text-neutral-900">{title}</h2>
      <p className="mb-5 mt-0.5 text-sm text-neutral-500 text-pretty">{description}</p>
      {children}
    </section>
  );
}

function BarList({
  items,
  total,
  isHighlighted,
}: {
  items: Count[];
  total: number;
  isHighlighted?: (label: string) => boolean;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="space-y-3.5">
      {items.map((item) => {
        const highlighted = isHighlighted?.(item.label) ?? false;
        return (
          <li key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-1.5 text-neutral-900">
                <span className="truncate">{item.label}</span>
                {highlighted && (
                  <Check
                    className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                    aria-label="On your CV"
                  />
                )}
              </span>
              <span className="shrink-0 tabular-nums text-neutral-500">
                {item.count} of {total}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-700",
                  highlighted ? "bg-emerald-500" : "bg-neutral-900",
                )}
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function MarketInsights() {
  const { data: profile } = useSuspenseQuery(profileQueryOptions());
  const { matchedJobs, setMatchedJobs, loading, cacheLoading, findMatches, location } =
    useJobMatching();
  useMatchedJobsCache(matchedJobs, location, setMatchedJobs);

  const busy = loading || cacheLoading;
  const matches = matchedJobs as JobFeedCardMatch[];

  const insights = useMemo(() => {
    const jobs = matches.map((m) => m.job);
    const total = jobs.length;
    const remote = jobs.filter((j) => /remote/i.test(j.location || "")).length;
    const averageFit = total
      ? Math.round(matches.reduce((sum, m) => sum + m.match_score, 0) / total)
      : 0;
    return {
      total,
      averageFit,
      remoteShare: total ? Math.round((remote / total) * 100) : 0,
      skills: topCounts(jobs.flatMap((j) => j.skills ?? []), 8),
      companies: topCounts(jobs.map((j) => j.company || ""), 6),
      locations: topCounts(jobs.map((j) => (j.location || "").split(",")[0]), 6),
    };
  }, [matches]);

  const mySkills = useMemo(
    () => new Set((profile?.skills ?? []).map((s) => s.trim().toLowerCase())),
    [profile],
  );
  const hasSkill = (label: string) => mySkills.has(label.toLowerCase());
  const skillsToAdd = insights.skills.filter((s) => !hasSkill(s.label)).slice(0, 3);

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm text-neutral-500">Market insights</p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            What employers are asking for{" "}
            <span className="text-neutral-400">in the jobs that fit you</span>
          </h1>
          <p className="mt-2 max-w-xl text-neutral-600 text-pretty">
            {insights.total > 0
              ? `Based on the ${insights.total} roles we matched to your CV.`
              : "Built from the roles we match to your CV."}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => findMatches(true)}
          disabled={busy || !profile}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={cn(loading && "animate-spin")} />
          {loading ? "Searching…" : "Search again"}
        </Button>
      </header>

      {busy && insights.total === 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className={cn(cardClass, "space-y-4 p-6")}>
              <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-100" />
              {[0, 1, 2, 3].map((j) => (
                <div key={j} className="h-2 animate-pulse rounded-full bg-neutral-100" />
              ))}
            </div>
          ))}
        </div>
      ) : insights.total === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <p className="font-medium text-neutral-900">No matches to learn from yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500 text-pretty">
            {profile
              ? "Once we find jobs that fit your CV, you'll see which skills and employers come up most."
              : "Upload your CV first, then we'll show you what the jobs that fit you have in common."}
          </p>
          <Button asChild className="mt-6">
            <Link to="/dashboard">Go to your job feed</Link>
          </Button>
        </div>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            {[
              ["Roles analysed", insights.total],
              ["Average fit", `${insights.averageFit}%`],
              ["Remote roles", `${insights.remoteShare}%`],
            ].map(([label, value]) => (
              <div key={label} className={cn(cardClass, "p-5")}>
                <p className="text-sm text-neutral-500">{label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
                  {value}
                </p>
              </div>
            ))}
          </section>

          <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            <Panel
              title="Skills in demand"
              description="How often each skill appears in your matches. Ticked skills are already on your CV."
            >
              {insights.skills.length > 0 ? (
                <>
                  <BarList
                    items={insights.skills}
                    total={insights.total}
                    isHighlighted={hasSkill}
                  />
                  {skillsToAdd.length > 0 && (
                    <p className="mt-6 rounded-xl bg-[#FAFAF9] px-4 py-3 text-sm text-neutral-600 text-pretty">
                      Worth adding if you have them:{" "}
                      <span className="text-neutral-900">
                        {skillsToAdd.map((s) => s.label).join(", ")}
                      </span>
                      .{" "}
                      <Link
                        to="/profile"
                        className="text-neutral-900 underline underline-offset-4"
                      >
                        Update your profile
                      </Link>
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-neutral-500">
                  These listings didn&apos;t include skill tags.
                </p>
              )}
            </Panel>

            <div className="space-y-4">
              <Panel
                title="Who's hiring"
                description="Employers with the most roles in your matches."
              >
                <BarList items={insights.companies} total={insights.total} />
              </Panel>
              <Panel
                title="Where the roles are"
                description="Cities and regions that come up most."
              >
                <BarList items={insights.locations} total={insights.total} />
              </Panel>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
