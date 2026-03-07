import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Briefcase,
  FileText,
  ChevronDown,
  TrendingUp,
  Zap,
  Shield,
  User,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOutletContext } from "react-router-dom";
import type { OutletContextType } from "@/components/layout/RootLayout";
import { useJobMatching } from "@/hooks/useJobMatching";
import { useMatchedJobsCache } from "@/hooks/useMatchedJobsCache";
import {
  JobFeedCard,
  type JobFeedCardMatch,
} from "@/components/matched-jobs/JobFeedCard";
import { CVAnalysisView } from "@/components/dashboard/CVAnalysisView";
import { CVEditorView } from "@/components/dashboard/CVEditorView";
import { CVUploader } from "@/components/profile/CVUploader";
import { cn } from "@/lib/utils";
import { apiClient } from "@/utils/api";
import { useToast } from "@/components/ui/toast";
import { clearMatchedJobsCache } from "@/hooks/useMatchedJobsCache";
import { track } from "@/utils/analytics";

export type DashboardTab = "job-feed" | "cv-analysis" | "cv-editor";

type FeedFilter = "all" | "specialized" | "remote";

function profileStrengthScore(profile: OutletContextType["profile"]): number {
  if (!profile) return 0;
  let s = 0;
  if (profile.name) s += 10;
  if (profile.email) s += 10;
  if (profile.skills?.length) s += 20;
  if (profile.experience_level) s += 10;
  if (profile.education) s += 10;
  if (profile.location) s += 10;
  if (profile.career_goals) s += 10;
  if (profile.strengths?.length) s += 10;
  if (profile.phone) s += 10;
  return s;
}

export default function Dashboard() {
  const { profile, setProfile } = useOutletContext<OutletContextType>();
  const navigate = useNavigate();
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleCVUpload = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("cv_file", file);
      const response = await apiClient("/profiles/cv/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      const extractedProfile = data.profile || data.cv_details?.profile;

      if (data.success && extractedProfile) {
        setProfile(extractedProfile);
        clearMatchedJobsCache();
        await findMatches(true);
        track(
          "cv_uploaded",
          { filename: file.name, source: "dashboard" },
          "cv_upload",
        );
        toast.show({
          title: "CV analyzed",
          description:
            "Your profile has been generated. Welcome to Cockpit AI!",
          variant: "success",
        });
      } else {
        toast.show({
          title: "Upload failed",
          description: data.error || "Failed to analyze CV. Please try again.",
          variant: "error",
        });
      }
    } catch (err: any) {
      toast.show({
        title: "Upload error",
        description: err.message || "Error uploading CV. Please try again.",
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const tabParam = searchParams.get("tab") as DashboardTab | null;
  const [mainTab, setMainTab] = useState<DashboardTab>(
    tabParam && ["job-feed", "cv-analysis", "cv-editor"].includes(tabParam)
      ? tabParam
      : "job-feed",
  );

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
    const t = searchParams.get("tab");
    if (t && ["job-feed", "cv-analysis", "cv-editor"].includes(t))
      setMainTab(t as DashboardTab);
  }, [searchParams]);

  const setTab = (t: DashboardTab) => {
    setMainTab(t);
    const next = new URLSearchParams(searchParams);
    next.set("tab", t);
    setSearchParams(next, { replace: true });
  };

  const feedLoading = loading || cacheLoading;
  const agentProgress = feedLoading ? 85 : 100;

  // Note: Cached matches are automatically loaded on mount by useJobMatching hook
  // No need to call findMatches() here - it would trigger unnecessary API calls

  const feedJobs = useMemo(() => {
    let list = filteredMatchedJobs as JobFeedCardMatch[];
    if (feedFilter === "specialized")
      list = list.filter((m) => m.match_score >= 85);
    if (feedFilter === "remote")
      list = list.filter((m) =>
        m.job.location?.toLowerCase().includes("remote"),
      );
    return list.slice(0, 6);
  }, [filteredMatchedJobs, feedFilter]);

  const strength = profileStrengthScore(profile);
  const hotSkills = profile?.skills?.slice(0, 2) ?? ["LLM Ops", "Terraform"];

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center animate-fade-in relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
          <Briefcase className="h-96 w-96" />
        </div>
        <div className="w-full max-w-2xl space-y-8 relative z-10 glass-panel p-10 md:p-14 rounded-3xl">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight bg-linear-to-br from-white to-zinc-400 bg-clip-text text-transparent">
              Your AI job agent awaits a mission
            </h2>
            <p className="text-zinc-400 text-lg max-w-lg mx-auto">
              Upload your CV to activate Cockpit AI. We'll parse your skills,
              analyze the market, and build your personalized job feed.
            </p>
          </div>
          <CVUploader onUpload={handleCVUpload} isUploading={uploading} />
        </div>
      </div>
    );
  }

  const isCVTab = mainTab === "cv-analysis" || mainTab === "cv-editor";

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Headline + Status */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            Your personalized job feed is updated with{" "}
            <span className="text-[#3b82f6]">{matchedJobs.length}</span> new
            opportunities. Let&apos;s explore them.
          </h1>
        </div>
        <div className="shrink-0">
          {isCVTab ? (
            <div className="w-full min-w-[260px] glass-card rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-white/5">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    CV Parsing Active
                  </p>
                  <p className="text-sm font-semibold text-white">
                    Analysis depth
                  </p>
                </div>
              </div>
              <div className="space-y-1.5 mt-4">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>Complete</span>
                  <span>100%</span>
                </div>
                <Progress
                  value={100}
                  className="h-1.5 bg-white/10 [&>div]:bg-accent"
                />
              </div>
            </div>
          ) : (
            <div className="w-full min-w-[280px] glass-card rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded shadow-sm">
                    {agentProgress}%
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Agent Status
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-semibold text-white">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>
                    {loading ? "Scanning live jobs..." : "Live jobs scanned."}
                  </span>
                  <span>{agentProgress}%</span>
                </div>
                <Progress
                  value={agentProgress}
                  className="h-1.5 bg-white/10 [&>div]:bg-primary"
                />
              </div>
              <div className="flex -space-x-2 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "bg-linear-to-br from-accent/20 to-accent/5 flex items-center justify-center shrink-0",
                      "h-8 w-8 rounded-full border-2 border-card text-xs font-medium bg-secondary text-secondary-foreground shadow-sm",
                      i <= 3 && "ring-2 ring-primary/40",
                    )}
                  >
                    <User className="h-3.5 w-3.5" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main tabs: Job Feed | CV Analysis | CV Editor */}
      <Tabs value={mainTab} onValueChange={(v) => setTab(v as DashboardTab)}>
        <TabsList className="bg-card/50 border border-border p-1 h-12 w-full max-w-md rounded-xl backdrop-blur-sm">
          <TabsTrigger
            value="job-feed"
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 font-medium transition-all"
          >
            Job Feed
          </TabsTrigger>
          <TabsTrigger
            value="cv-analysis"
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 text-muted-foreground font-medium transition-all"
          >
            CV Analysis
          </TabsTrigger>
          <TabsTrigger
            value="cv-editor"
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 text-muted-foreground font-medium transition-all"
          >
            CV Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cv-analysis" className="mt-6">
          <CVAnalysisView profile={profile} />
        </TabsContent>

        <TabsContent value="cv-editor" className="mt-6">
          <CVEditorView profile={profile} />
        </TabsContent>

        <TabsContent value="job-feed" className="mt-6 space-y-8">
          {/* Top AI Recommendations */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold text-white">
                Top AI Recommendations
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex rounded-xl overflow-hidden border border-white/10 bg-[#1e1e36] p-0.5">
                  {(
                    [
                      ["all", "All Matches"],
                      ["specialized", "Highly Specialized"],
                      ["remote", "Remote Only"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setFeedFilter(key)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                        feedFilter === key
                          ? "bg-[#3b82f6] text-white"
                          : "text-zinc-400 hover:text-white hover:bg-white/5",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <button
                    type="button"
                    onClick={() => findMatches(true)}
                    disabled={feedLoading}
                    className="flex items-center gap-1 hover:text-white transition-colors disabled:opacity-50"
                    title="Refresh feed (force refresh)"
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", loading && "animate-spin")}
                    />
                    {loading ? "Searching..." : "Live Feed"}
                  </button>
                  <span className="flex items-center gap-1">
                    Sort: Best Match
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>

            {/* Split Pane Job Feed */}
            {feedLoading ? (
              <div className="flex flex-col items-center justify-center py-32 animate-fade-in glass-card rounded-3xl mt-6">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                  <Briefcase className="h-10 w-10 text-primary absolute inset-0 m-auto animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Scanning market data...
                </h3>
                <p className="text-sm text-muted-foreground">
                  Matching your skills against live job listings.
                </p>
              </div>
            ) : feedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-3xl mt-6">
                <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  No active recommendations
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  We couldn't find any jobs matching your exact filters right
                  now. Try expanding your search criteria.
                </p>
                <Button
                  onClick={() => navigate("/job-matches")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                >
                  Explore All Matches
                </Button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6 mt-6 min-h-[600px] max-h-[800px]">
                {/* Left Hand List Pane */}
                <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 pb-8 custom-scrollbar">
                  {feedJobs.map((match, idx) => (
                    <div
                      key={match.job.id}
                      onClick={() => setSelectedJob(match)}
                      className={cn(
                        "cursor-pointer rounded-2xl transition-all duration-200 border-2",
                        selectedJob?.job.id === match.job.id
                          ? "border-primary/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-primary/20"
                          : "border-transparent",
                      )}
                    >
                      <JobFeedCard match={match} index={idx} />
                    </div>
                  ))}
                </div>

                {/* Right Hand Detail Pane */}
                <div className="hidden lg:flex w-full lg:w-7/12 xl:w-2/3 glass-panel rounded-3xl flex-col overflow-hidden relative border-border/50 shadow-2xl">
                  {selectedJob ? (
                    <div className="flex flex-col h-full">
                      <div className="p-8 border-b border-border/50 bg-card/40 backdrop-blur-md">
                        <div className="flex items-start justify-between gap-6">
                          <div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                              {selectedJob.job.title}
                            </h2>
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <span className="font-medium text-white">
                                {selectedJob.job.company}
                              </span>
                              <span className="text-border">•</span>
                              <span>{selectedJob.job.location}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold">
                              {selectedJob.match_score}% Match
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Based on your profile
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 custom-scrollbar">
                        {/* High-level match breakdown mock */}
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                            Match Breakdown
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1.5">
                                <span className="font-medium">
                                  Skill Alignment
                                </span>
                                <span className="text-primary font-bold">
                                  95%
                                </span>
                              </div>
                              <Progress
                                value={95}
                                className="h-2 bg-white/5 [&>div]:bg-primary"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1.5">
                                <span className="font-medium">
                                  Experience Level
                                </span>
                                <span className="text-emerald-400 font-bold">
                                  88%
                                </span>
                              </div>
                              <Progress
                                value={88}
                                className="h-2 bg-white/5 [&>div]:bg-emerald-400"
                              />
                            </div>
                          </div>
                        </div>
                        {selectedJob.match_reasons &&
                          selectedJob.match_reasons.length > 0 && (
                            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                              <h4 className="text-sm font-semibold text-primary mb-3">
                                Why this is a strong match
                              </h4>
                              <ul className="space-y-2">
                                {selectedJob.match_reasons
                                  .slice(0, 3)
                                  .map((r, i) => (
                                    <li
                                      key={i}
                                      className="text-sm text-zinc-300 flex gap-2"
                                    >
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                      {r}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                            Job Description
                          </h3>
                          <div className="prose prose-invert prose-sm max-w-none text-zinc-300">
                            {selectedJob.job.description ||
                              "No detailed description provided by the employer."}
                          </div>
                        </div>
                      </div>
                      <div className="p-6 border-t border-border/50 bg-card/80 backdrop-blur-xl flex items-center justify-end gap-4 shrink-0">
                        {selectedJob.job.url && (
                          <Button
                            variant="outline"
                            className="h-12 px-6 rounded-xl border-border bg-white/5 hover:bg-white/10"
                            asChild
                          >
                            <a
                              href={selectedJob.job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Original
                            </a>
                          </Button>
                        )}
                        <Button
                          className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-base font-medium"
                          onClick={() => navigate("/job-matches")}
                        >
                          Apply with Cockpit AI
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                      <Briefcase className="h-16 w-16 text-muted-foreground/30 mb-6" />
                      <p className="text-xl font-medium text-white mb-2">
                        Select a role to view details
                      </p>
                      <p className="text-muted-foreground">
                        Click on any job card in the list to examine the match
                        breakdown and full description.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Analytics row */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-white/5 text-accent shadow-sm">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Salary Trends
                </span>
              </div>
              <p className="text-3xl font-bold tracking-tight">+12.4%</p>
            </div>

            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-white/5 text-primary shadow-sm">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Hot Skills
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {hotSkills.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-white/5 text-zinc-300 border border-white/5"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-white/5 text-emerald-400 shadow-sm">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Profile Strength
                </span>
              </div>
              <div className="space-y-3 mt-1">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-emerald-400">Excellent</span>
                  <span className="text-white">{strength}%</span>
                </div>
                <Progress
                  value={strength}
                  className="h-2 bg-white/10 [&>div]:bg-emerald-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


