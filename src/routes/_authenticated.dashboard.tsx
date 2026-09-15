import { useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  ArrowUpRight,
  Check,
  FileText,
  PencilLine,
  RefreshCw,
  Repeat,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FitBadge } from "@/components/ui/fit-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileQueryOptions } from "@/api/queries/options";
import { cvService } from "@/api/services";
import { useJobMatching } from "@/hooks/useJobMatching";
import { useMatchedJobsCache } from "@/hooks/useMatchedJobsCache";
import {
  JobFeedCard,
  type JobFeedCardMatch,
} from "@/components/matched-jobs/JobFeedCard";
import { CVAnalysisView } from "@/components/dashboard/CVAnalysisView";
import { CVEditorView } from "@/components/dashboard/CVEditorView";
import { CVUploader } from "@/components/profile/CVUploader";
import { getProfileStrength } from "@/components/profile/ProfileStrength";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { clearMatchedJobsCache } from "@/hooks/useMatchedJobsCache";
import { track } from "@/utils/analytics";

export type DashboardTab = "job-feed" | "cv-analysis" | "cv-editor";

const FEED_FILTERS = [
  ["all", "All"],
  ["strong", "Strong fits"],
  ["remote", "Remote"],
] as const;

type FeedFilter = (typeof FEED_FILTERS)[number][0];

const STRONG_FIT = 85;

const SETUP_NOTES = [
  { icon: FileText, text: "Works with PDF and Word files" },
  { icon: PencilLine, text: "Fix anything we read wrong" },
  { icon: Repeat, text: "Replace it whenever you like" },
];

const dashboardSearchSchema = z.object({
  tab: z.enum(["job-feed", "cv-analysis", "cv-editor"]).optional(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  validateSearch: dashboardSearchSchema,
  loaderDeps: ({ search }) => ({ tab: search.tab }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(profileQueryOptions());
  },
  component: Dashboard,
});

const panelShadow =
  "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]";

function Stat({
  label,
  value,
  children,
}: {
  label: string;
  value: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {children && <div className="mt-2 text-xs text-neutral-500">{children}</div>}
    </div>
  );
}

function Dashboard() {
  const { data: profile } = useSuspenseQuery(profileQueryOptions());
  const queryClient = useQueryClient();
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const { tab: tabParam } = Route.useSearch();
  const routeNavigate = Route.useNavigate();

  const handleCVUpload = async (file: File) => {
    try {
      setUploading(true);
      const data = await cvService.upload(file);
      const extractedProfile = data.profile;

      if (data.success && extractedProfile) {
        queryClient.setQueryData(profileQueryOptions().queryKey, extractedProfile);
        clearMatchedJobsCache();
        await findMatches(true);
        track(
          "cv_uploaded",
          { filename: file.name, source: "dashboard" },
          "cv_upload",
        );
        toast.show({
          title: "Your profile is ready",
          description: "We read your CV and started looking for jobs that fit it.",
          variant: "success",
        });
      } else {
        toast.show({
          title: "We couldn't read that CV",
          description: data.error || "Please try again, or upload a different file.",
          variant: "error",
        });
      }
    } catch (err: any) {
      toast.show({
        title: "Upload failed",
        description: err.message || "Please check your connection and try again.",
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const [mainTab, setMainTab] = useState<DashboardTab>(tabParam ?? "job-feed");

  const {
    matchedJobs,
    setMatchedJobs,
    loading,
    cacheLoading,
    findMatches,
    filteredMatchedJobs,
    location,
  } = useJobMatching();
  useMatchedJobsCache(matchedJobs, location, setMatchedJobs);

  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [selectedJob, setSelectedJob] = useState<JobFeedCardMatch | null>(null);

  // Sync tab with URL
  useEffect(() => {
    if (tabParam) setMainTab(tabParam);
  }, [tabParam]);

  const setTab = (t: DashboardTab) => {
    setMainTab(t);
    routeNavigate({ search: (prev) => ({ ...prev, tab: t }), replace: true });
  };

  const feedLoading = loading || cacheLoading;

  // Note: Cached matches are automatically loaded on mount by useJobMatching hook
  // No need to call findMatches() here - it would trigger unnecessary API calls

  const allMatches = filteredMatchedJobs as JobFeedCardMatch[];
  const strongCount = allMatches.filter((m) => m.match_score >= STRONG_FIT).length;

  const feedJobs = useMemo(() => {
    let list = allMatches;
    if (feedFilter === "strong")
      list = list.filter((m) => m.match_score >= STRONG_FIT);
    if (feedFilter === "remote")
      list = list.filter((m) =>
        m.job.location?.toLowerCase().includes("remote"),
      );
    return list.slice(0, 8);
  }, [allMatches, feedFilter]);

  // Keep a job selected so the detail pane is never empty
  useEffect(() => {
    if (feedJobs.length === 0) {
      setSelectedJob(null);
    } else if (!selectedJob || !feedJobs.some((m) => m.job.id === selectedJob.job.id)) {
      setSelectedJob(feedJobs[0]);
    }
  }, [feedJobs]);

  const strength = profile ? getProfileStrength(profile).score : 0;
  const firstName = profile?.name?.trim().split(/\s+/)[0];

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl py-4 md:py-12">
        <p className="mb-4 text-sm text-neutral-500 animate-in fade-in duration-700">
          Let&apos;s get you set up
        </p>
        <h1 className="mb-4 text-4xl font-semibold leading-[1.08] tracking-tight text-balance md:text-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          Start with your CV.{" "}
          <span className="text-neutral-400">We&apos;ll find the jobs that fit it.</span>
        </h1>
        <p className="mb-10 max-w-xl text-lg leading-relaxed text-neutral-600 text-pretty animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
          Upload it once. We read your skills and experience, then search
          LinkedIn, Indeed, and more for roles worth applying to.
        </p>

        <div className="rounded-2xl border border-neutral-200 bg-[#FAFAF9] p-2 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 fill-mode-both sm:p-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-3">
            <CVUploader onUpload={handleCVUpload} isUploading={uploading} />
          </div>
        </div>

        <ul className="mt-6 grid gap-3 text-sm text-neutral-600 sm:grid-cols-3">
          {SETUP_NOTES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-neutral-400" strokeWidth={1.75} />
              {text}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm text-neutral-500">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            {feedLoading ? (
              "Looking for new jobs…"
            ) : matchedJobs.length === 0 ? (
              "No matches yet"
            ) : (
              <>
                {matchedJobs.length}{" "}
                {matchedJobs.length === 1 ? "job fits" : "jobs fit"} your CV{" "}
                <span className="text-neutral-400">right now</span>
              </>
            )}
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => findMatches(true)}
          disabled={feedLoading}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={cn(loading && "animate-spin")} />
          {loading ? "Searching…" : "Search again"}
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Matches found" value={matchedJobs.length}>
          From LinkedIn, Indeed, and more
        </Stat>
        <Stat label="Strong fits" value={strongCount}>
          {STRONG_FIT}% fit or higher
        </Stat>
        <Stat label="Profile strength" value={`${strength}%`}>
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-700"
              style={{ width: `${strength}%` }}
            />
          </div>
          {strength < 100 ? (
            <Link to="/profile" className="text-neutral-900 underline-offset-4 hover:underline">
              Complete your profile for better matches
            </Link>
          ) : (
            "Your profile is complete"
          )}
        </Stat>
      </section>

      <Tabs value={mainTab} onValueChange={(v) => setTab(v as DashboardTab)}>
        <TabsList>
          <TabsTrigger value="job-feed">Job feed</TabsTrigger>
          <TabsTrigger value="cv-analysis">CV analysis</TabsTrigger>
          <TabsTrigger value="cv-editor">Your CV</TabsTrigger>
        </TabsList>

        <TabsContent value="cv-analysis" className="mt-6">
          <CVAnalysisView profile={profile} />
        </TabsContent>

        <TabsContent value="cv-editor" className="mt-6">
          <CVEditorView profile={profile} />
        </TabsContent>

        <TabsContent value="job-feed" className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {FEED_FILTERS.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFeedFilter(key)}
                  aria-pressed={feedFilter === key}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                    feedFilter === key
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <Link
              to="/job-matches"
              className="inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
            >
              See all matches
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {feedLoading ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-neutral-200 bg-white p-5"
                  >
                    <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
                    <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-neutral-100" />
                    <div className="mt-5 h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
                  </div>
                ))}
              </div>
              <div className="hidden items-center justify-center rounded-2xl border border-neutral-200 bg-white p-10 text-center lg:flex">
                <div>
                  <Search className="mx-auto mb-3 h-5 w-5 text-neutral-400" />
                  <p className="font-medium">Searching LinkedIn, Indeed, and more</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Matching live listings against your CV.
                  </p>
                </div>
              </div>
            </div>
          ) : feedJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
              <p className="font-medium">
                {feedFilter === "all" ? "No matches yet" : "Nothing matches this filter"}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500 text-pretty">
                {feedFilter === "all"
                  ? "Search again, or try a wider location on the matches page."
                  : "Try another filter to see the rest of your matches."}
              </p>
              <div className="mt-6 flex justify-center gap-2">
                {feedFilter !== "all" && (
                  <Button variant="outline" onClick={() => setFeedFilter("all")}>
                    Show all
                  </Button>
                )}
                <Button asChild>
                  <Link to="/job-matches">Go to matches</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
              <ul className="space-y-3">
                {feedJobs.map((match, idx) => {
                  const isSelected = selectedJob?.job.id === match.job.id;
                  return (
                    <li key={match.job.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        onClick={() => setSelectedJob(match)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedJob(match);
                          }
                        }}
                        className={cn(
                          "cursor-pointer rounded-2xl outline-none transition-shadow focus-visible:ring-4 focus-visible:ring-neutral-900/10",
                          isSelected && "ring-2 ring-neutral-900",
                        )}
                      >
                        <JobFeedCard match={match} index={idx} />
                      </div>
                    </li>
                  );
                })}
              </ul>

              {selectedJob && (
                <article
                  className={cn(
                    "hidden max-h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:sticky lg:top-8 lg:flex",
                    panelShadow,
                  )}
                >
                  <header className="flex items-start justify-between gap-6 border-b border-neutral-100 p-6">
                    <div className="min-w-0">
                      <h2 className="text-xl font-semibold tracking-tight text-balance">
                        {selectedJob.job.title}
                      </h2>
                      <p className="mt-1 text-sm text-neutral-500">
                        {selectedJob.job.company}
                        {selectedJob.job.location && ` · ${selectedJob.job.location}`}
                      </p>
                    </div>
                    <FitBadge score={selectedJob.match_score} />
                  </header>

                  <div className="flex-1 space-y-6 overflow-y-auto p-6">
                    {selectedJob.match_reasons && selectedJob.match_reasons.length > 0 && (
                      <section>
                        <h3 className="mb-3 text-sm font-medium">Why it fits you</h3>
                        <ul className="space-y-2">
                          {selectedJob.match_reasons.slice(0, 4).map((reason, i) => (
                            <li key={i} className="flex gap-2.5 text-sm text-neutral-700">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                    <section>
                      <h3 className="mb-2 text-sm font-medium">About the role</h3>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                        {selectedJob.job.description ||
                          "The employer didn't include a description. Open the listing for details."}
                      </p>
                    </section>
                  </div>

                  <footer className="flex items-center justify-end gap-2 border-t border-neutral-100 p-4">
                    {selectedJob.job.url && (
                      <Button variant="outline" asChild>
                        <a
                          href={selectedJob.job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View listing
                          <ArrowUpRight />
                        </a>
                      </Button>
                    )}
                    <Button asChild>
                      <Link to="/job-matches">Tailor my CV and apply</Link>
                    </Button>
                  </footer>
                </article>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
