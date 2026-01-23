import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Upload,
  Briefcase,
  ChevronDown,
  TrendingUp,
  Zap,
  Shield,
  User,
  RefreshCw,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOutletContext } from "react-router-dom";
import type { OutletContextType } from "@/components/layout/RootLayout";
import { useJobMatching } from "@/hooks/useJobMatching";
import { useMatchedJobsCache } from "@/hooks/useMatchedJobsCache";
import { JobFeedCard, type JobFeedCardMatch } from "@/components/matched-jobs/JobFeedCard";
import { CVAnalysisView } from "@/components/dashboard/CVAnalysisView";
import { CVEditorView } from "@/components/dashboard/CVEditorView";
import { cn } from "@/lib/utils";

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
  const { profile } = useOutletContext<OutletContextType>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as DashboardTab | null;
  const [mainTab, setMainTab] = useState<DashboardTab>(
    tabParam && ["job-feed", "cv-analysis", "cv-editor"].includes(tabParam)
      ? tabParam
      : "job-feed"
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
    if (feedFilter === "specialized") list = list.filter((m) => m.match_score >= 85);
    if (feedFilter === "remote")
      list = list.filter((m) => m.job.location?.toLowerCase().includes("remote"));
    return list.slice(0, 6);
  }, [filteredMatchedJobs, feedFilter]);

  const strength = profileStrengthScore(profile);
  const hotSkills = profile?.skills?.slice(0, 2) ?? ["LLM Ops", "Terraform"];

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center animate-fade-in">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4">
            <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#3b82f6] shadow-[0_0_30px_rgba(59,130,246,0.4)]">
              <Briefcase className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Welcome to Cockpit AI
            </h2>
            <p className="text-zinc-400 text-lg">
              Upload your CV to get started with AI-powered job matching
            </p>
          </div>
          <Card className="border-white/10 bg-[#1e1e36]">
            <CardContent className="pt-6">
              <Button
                onClick={() => navigate("/cv-upload")}
                className="w-full h-14 text-lg gap-2 bg-[#3b82f6] hover:bg-[#2563eb]"
                size="lg"
              >
                <Upload className="h-5 w-5" />
                Upload Your CV
              </Button>
            </CardContent>
          </Card>
          <p className="text-sm text-zinc-500">
            No profile found. Upload a CV to see your job feed.
          </p>
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
            <span className="text-[#3b82f6]">{matchedJobs.length}</span>{" "}
            new opportunities. Let&apos;s explore them.
          </h1>
        </div>
        <div className="shrink-0">
          {isCVTab ? (
            <Card className="w-full min-w-[260px] border-white/10 bg-[#1e1e36]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <FileText className="h-5 w-5 text-[#a78bfa]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      CV Parsing Active
                    </p>
                    <p className="text-sm font-semibold text-white">Analysis depth</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Complete</span>
                    <span>100%</span>
                  </div>
                  <Progress value={100} className="h-1.5 bg-white/10 [&>div]:bg-[#a78bfa]" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full min-w-[280px] border-white/10 bg-[#1e1e36]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="p-2.5 rounded-xl bg-white/5">
                      <Briefcase className="h-5 w-5 text-[#3b82f6]" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-[#3b82f6] text-white px-1.5 py-0.5 rounded">
                      {agentProgress}%
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Agent Status
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#3b82f6] animate-pulse" />
                      <span className="text-sm font-semibold text-white">ACTIVE</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>
                      {loading ? "Scanning 450 live jobs..." : "450 live jobs scanned."}
                    </span>
                    <span>{agentProgress}%</span>
                  </div>
                  <Progress value={agentProgress} className="h-1.5 bg-white/10 [&>div]:bg-[#3b82f6]" />
                </div>
                <div className="flex -space-x-2 mt-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 border-[#1e1e36] flex items-center justify-center text-xs font-medium bg-[#2b2b45] text-zinc-400",
                        i <= 3 && "ring-2 ring-[#3b82f6]/50"
                      )}
                    >
                      <User className="h-3.5 w-3.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Main tabs: Job Feed | CV Analysis | CV Editor */}
      <Tabs value={mainTab} onValueChange={(v) => setTab(v as DashboardTab)}>
        <TabsList className="bg-[#1e1e36] border border-white/10 p-0.5 h-11 w-full max-w-md">
          <TabsTrigger
            value="job-feed"
            className="flex-1 data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white rounded-lg px-4"
          >
            Job Feed
          </TabsTrigger>
          <TabsTrigger
            value="cv-analysis"
            className="flex-1 data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white rounded-lg px-4 text-zinc-400"
          >
            CV Analysis
          </TabsTrigger>
          <TabsTrigger
            value="cv-editor"
            className="flex-1 data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white rounded-lg px-4 text-zinc-400"
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
          <h2 className="text-xl font-bold text-white">Top AI Recommendations</h2>
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
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
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
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                {loading ? "Searching..." : "Live Feed"}
              </button>
              <span className="flex items-center gap-1">
                Sort: Best Match
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Job cards grid */}
        {feedLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
            <div className="md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-32 animate-fade-in">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <Briefcase className="h-10 w-10 text-blue-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Searching for jobs...
              </h3>
              <p className="text-sm text-zinc-400">
                Matching your profile. This may take a moment.
              </p>
            </div>
          </div>
        ) : feedJobs.length === 0 ? (
          <Card className="border-white/10 bg-[#1e1e36]">
            <CardContent className="py-16 text-center">
              <Briefcase className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No recommendations yet</h3>
              <p className="text-zinc-400 mb-4 max-w-md mx-auto">
                Find matches to see your personalized job feed here.
              </p>
              <Button
                onClick={() => navigate("/job-matches")}
                className="bg-[#3b82f6] hover:bg-[#2563eb]"
              >
                Find Matching Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedJobs.map((match, idx) => (
              <JobFeedCard
                key={match.job.id}
                match={match}
                index={idx}
                onApply={() => navigate("/job-matches")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Analytics row */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-white/10 bg-[#1e1e36]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-white/5 text-[#a78bfa]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Salary Trends
              </span>
            </div>
            <p className="text-2xl font-bold text-white">+12.4%</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#1e1e36]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-white/5 text-[#a78bfa]">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Hot Skills
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hotSkills.map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg text-sm font-medium bg-white/5 text-zinc-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#1e1e36]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-white/5 text-[#a78bfa]">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Profile Strength
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white font-semibold">{strength}%</span>
              </div>
              <Progress
                value={strength}
                className="h-2 bg-white/10 [&>div]:bg-[#3b82f6]"
              />
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
