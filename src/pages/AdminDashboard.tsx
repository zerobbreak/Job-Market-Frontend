import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, AlertTriangle, Cpu, HardDrive, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/utils/api";
import { Progress } from "@/components/ui/progress";

interface HealthData {
  status: string;
  task_manager: {
    active_threads: number;
    total_processed: number;
    status: string;
  };
  system: {
    cpu_percent: number;
    memory_usage_mb: number;
    uptime_seconds: number;
  };
  business_metrics: {
    recent_job_failures: number;
    total_applications: number;
    application_breakdown: Record<string, number>;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchHealth = async () => {
    try {
      // Note: In a real app, this would be protected by admin middleware
      const res = await apiClient("/admin/health");
      const json = await res.json();
      if (res.ok) {
        setData(json);
        setError("");
      } else {
        setError("Failed to fetch system health");
      }
    } catch (e) {
      setError("Network error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Activity className="w-8 h-8 animate-pulse text-blue-500" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">System Unavailable</h2>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">Real-time monitoring of backend services and agents.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-green-600">Live</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threads</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.task_manager.active_threads}</div>
            <p className="text-xs text-muted-foreground">Background workers running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.system.cpu_percent}%</div>
            <Progress value={data?.system.cpu_percent} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.system.memory_usage_mb} MB</div>
            <p className="text-xs text-muted-foreground">Uptime: {formatUptime(data?.system.uptime_seconds || 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.business_metrics.total_applications}</div>
            <p className="text-xs text-muted-foreground">
              Failures (last 10 jobs): {data?.business_metrics.recent_job_failures}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Manager Status</CardTitle>
            <CardDescription>Worker thread pool health and throughput</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${data?.task_manager.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {data?.task_manager.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium">Total Tasks Processed</span>
              <span>{data?.task_manager.total_processed}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Breakdown</CardTitle>
            <CardDescription>Distribution of application statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(data?.business_metrics.application_breakdown || {}).map(([key, value]) => (
                key !== 'total' && (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{key}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${(value / (data?.business_metrics.total_applications || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{value}</span>
                    </div>
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}