import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Sparkles,
  CheckCircle,
  Award,
  Briefcase,
  FileText,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/utils/api";
import { useOutletContext } from "react-router-dom";
import type { OutletContextType } from "@/components/layout/RootLayout";

export default function Dashboard() {
  const { profile } = useOutletContext<OutletContextType>();
  const navigate = useNavigate();

  const [cvHealth, setCvHealth] = useState<{
    filename?: string;
    uploadedAt?: string;
  } | null>(null);
  const [recentMatchesCount, setRecentMatchesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [profile]); // Reload when profile changes

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load CV health from API
      const cvResp = await apiClient("/profile/current", { method: "GET" });
      const cvData = await cvResp.json();
      if (cvData.success) {
        setCvHealth({
          filename: cvData.cv_filename,
          uploadedAt: cvData.uploaded_at,
        });
      }

      // Load recent matches count from localStorage (same source as Job Matches page)
      try {
        const cachedMatches = localStorage.getItem("matchedJobs");
        if (cachedMatches) {
          const parsed = JSON.parse(cachedMatches);
          if (Array.isArray(parsed)) {
            setRecentMatchesCount(parsed.length);
          }
        } else {
          setRecentMatchesCount(0);
        }
      } catch (e) {
        console.error("Error reading cached matches:", e);
        setRecentMatchesCount(0);
      }
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const formatRecency = (iso?: string) => {
    if (!iso) return { label: "Unknown", tone: "default" as const };
    const ts = Date.parse(iso);
    if (isNaN(ts)) return { label: iso, tone: "default" as const };
    const days = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
    if (days <= 0) return { label: "Updated today", tone: "fresh" as const };
    if (days <= 7)
      return { label: `Updated ${days}d ago`, tone: "fresh" as const };
    if (days <= 30)
      return { label: `Updated ${days}d ago`, tone: "warn" as const };
    return { label: `Updated ${days}d ago`, tone: "stale" as const };
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center animate-fade-in">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4">
            <div className="h-20 w-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome to Job Market Agent
            </h2>
            <p className="text-muted-foreground text-lg">
              Upload your CV to get started with AI-powered job matching
            </p>
          </div>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <Button
                onClick={() => navigate("/cv-upload")}
                className="w-full h-14 text-lg gap-2"
                size="lg"
              >
                <Upload className="h-5 w-5" />
                Upload Your CV
              </Button>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground">
            No profile found. Please upload a CV to see matches.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your job search and applications
          </p>
        </div>
      </div>

      {/* CV Status Card */}
      {cvHealth && (
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Active CV</CardTitle>
                <CardDescription>{cvHealth.filename}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Profile Analyzed
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last updated:{" "}
                    {cvHealth.uploadedAt?.replace("T", " ").replace("Z", "")}
                  </p>
                </div>
              </div>
              {(() => {
                const r = formatRecency(cvHealth.uploadedAt);
                return (
                  <Badge
                    className={
                      r.tone === "fresh"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : r.tone === "warn"
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        : r.tone === "stale"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {r.label}
                  </Badge>
                );
              })()}
            </div>

            <Button
              onClick={() => navigate("/cv-upload")}
              variant="outline"
              className="w-full gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload New CV
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Overview Card */}
        <Card className="border-border bg-card/50 backdrop-blur-sm hover:border-blue-500/30 transition-all group">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                <Award className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>View and edit your details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Skills</span>
                <Badge
                  variant="secondary"
                  className="bg-blue-500/10 text-blue-300 border-blue-500/20"
                >
                  {profile.skills.length} listed
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Experience</span>
                <span className="font-medium text-foreground">
                  {profile.experience_level || "Not specified"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Education</span>
                <span className="font-medium text-foreground truncate max-w-[200px]">
                  {profile.education || "Not specified"}
                </span>
              </div>
            </div>

            <Button
              onClick={() => navigate("/cv-upload")}
              variant="outline"
              className="w-full gap-2 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors"
            >
              View Full Profile
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Job Matches Card */}
        <Card className="border-border bg-card/50 backdrop-blur-sm hover:border-purple-500/30 transition-all group">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                <Briefcase className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <CardTitle>Job Matches</CardTitle>
                <CardDescription>
                  Find jobs tailored to your skills
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 bg-linear-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {recentMatchesCount}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Recent matches found
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-purple-400 opacity-50" />
                </div>

                <Button
                  onClick={() => navigate("/job-matches")}
                  className="w-full gap-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  <Briefcase className="h-4 w-4" />
                  Find Matching Jobs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skills Preview */}
      {profile.skills.length > 0 && (
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Award className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <CardTitle>Your Skills</CardTitle>
                <CardDescription>
                  Extracted from your CV analysis
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.slice(0, 12).map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                >
                  {skill}
                </Badge>
              ))}
              {profile.skills.length > 12 && (
                <Badge
                  variant="outline"
                  className="px-3 py-1.5 text-sm text-muted-foreground"
                >
                  +{profile.skills.length - 12} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
