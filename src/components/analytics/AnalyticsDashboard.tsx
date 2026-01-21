import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { analyticsService, type EngagementAnalytics, type HeatmapData } from "@/api/services/analytics.service";
import { Loader2, TrendingUp, Briefcase, CheckCircle, Target, Zap } from "lucide-react";

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<EngagementAnalytics | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsData, heatmapData] = await Promise.all([
        analyticsService.getEngagementAnalytics(30),
        analyticsService.getHeatmap(),
      ]);
      setAnalytics(analyticsData);
      setHeatmap(heatmapData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!analytics || !heatmap) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      applied: "bg-blue-500",
      interview: "bg-yellow-500",
      accepted: "bg-green-500",
      rejected: "bg-red-500",
      generated: "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getHeatLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-500",
      medium: "bg-yellow-500",
      low: "bg-green-500",
    };
    return colors[level] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Application Analytics</h2>
        <p className="text-muted-foreground">
          Track your application performance and engagement
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_applications}</div>
                <p className="text-xs text-muted-foreground">
                  Last {analytics.period_days} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.average_match_score}%</div>
                <Progress value={analytics.average_match_score} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.response_rate_percent.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.interview_rate_percent.toFixed(1)}% interview rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Probability</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(analytics.average_success_probability * 100).toFixed(1)}%
                </div>
                <Progress value={analytics.average_success_probability * 100} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Application Status Distribution</CardTitle>
              <CardDescription>Breakdown of your applications by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(analytics.status_distribution).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                      <span className="capitalize">{status}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>High Engagement Applications</CardTitle>
              <CardDescription>Applications with highest success probability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.high_engagement_applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{app.role}</div>
                      <div className="text-sm text-muted-foreground">{app.company}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {(app.success_probability * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Success</div>
                      </div>
                      <Badge variant={app.status === 'accepted' ? 'default' : 'secondary'}>
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Heatmap</CardTitle>
              <CardDescription>
                Visual representation of application engagement (ZipRecruiter-style)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{heatmap.high_heat_count}</div>
                  <div className="text-sm text-muted-foreground">High Heat</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{heatmap.medium_heat_count}</div>
                  <div className="text-sm text-muted-foreground">Medium Heat</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{heatmap.low_heat_count}</div>
                  <div className="text-sm text-muted-foreground">Low Heat</div>
                </div>
              </div>

              <div className="space-y-2">
                {heatmap.heatmap.slice(0, 20).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.role}</div>
                      <div className="text-sm text-muted-foreground">{item.company}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.heat_score.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Heat Score</div>
                      </div>
                      <Badge
                        className={getHeatLevelColor(item.heat_level)}
                        variant="default"
                      >
                        {item.heat_level}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actionable Insights</CardTitle>
              <CardDescription>Recommendations based on your application data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

