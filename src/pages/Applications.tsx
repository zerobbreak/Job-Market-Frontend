import { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/utils/api";
import ApplicationsList from "@/components/ApplicationsList";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  MessageSquare,
  Briefcase,
  Activity,
} from "lucide-react";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  jobUrl?: string;
  location?: string;
  status: "pending" | "applied" | "interview" | "rejected";
  appliedDate: string;
  files?: { cv: string; cover_letter: string; interview_prep?: string };
}

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const API_ORIGIN = (
    import.meta.env.VITE_API_URL || "http://localhost:8000/api"
  ).replace(/\/api$/, "");

  const fetchApplications = async (p: number) => {
    setLoading(true);
    try {
      const response = await apiClient(
        `/applications?page=${p}&limit=${limit}`,
      );
      const data = await response.json();
      if (data.applications) {
        setApplications(data.applications);
        setPage(data.page || p);
        setTotal(data.total || data.applications.length);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      toast.show({
        title: "Error",
        description: "Failed to load applications",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(1);
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalApps = applications.length;
    const interviews = applications.filter(
      (a) => a.status === "interview",
    ).length;
    const responses = applications.filter(
      (a) => a.status !== "pending" && a.status !== "applied",
    ).length; // any status change from default
    const successRate =
      totalApps > 0 ? Math.round((interviews / totalApps) * 100) : 0;

    return { totalApps, interviews, responses, successRate };
  }, [applications]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Agent Activity
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track your automated job application funnel
          </p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-transparent">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-2.5 bg-primary/20 rounded-xl">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Total Applied
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {stats.totalApps}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-transparent">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-2.5 bg-accent/20 rounded-xl">
              <MessageSquare className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Responses
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {stats.responses}
                </span>
                <span className="text-xs font-medium text-emerald-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +12%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-transparent">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl">
              <Briefcase className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Interviews
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {stats.interviews}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-transparent">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-2.5 bg-orange-500/20 rounded-xl">
              <CheckCircle2 className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Success Rate
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {stats.successRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="glass-panel border-border/50 rounded-2xl overflow-hidden p-6 shadow-xl">
        {loading && applications.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            Loading application timeline...
          </div>
        ) : (
          <ApplicationsList
            applications={applications}
            API_ORIGIN={API_ORIGIN}
            serverPage={page}
            serverTotalPages={Math.max(1, Math.ceil(total / limit))}
            onPageChange={(p) => fetchApplications(p)}
          />
        )}
      </div>
    </div>
  );
}
