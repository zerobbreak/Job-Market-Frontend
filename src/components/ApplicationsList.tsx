import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  FileText,
  Sparkles,
  ExternalLink,
  LayoutGrid,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
} from "lucide-react";
import { track } from "@/utils/analytics";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient } from "@/utils/api";
import { cn } from "@/lib/utils";

type Application = {
  id: string;
  jobTitle: string;
  company: string;
  jobUrl?: string;
  location?: string;
  status: "pending" | "applied" | "interview" | "rejected";
  appliedDate: string;
  files?: { cv: string; cover_letter: string; interview_prep?: string };
};

export default function ApplicationsList({
  applications,
  API_ORIGIN,
  serverPage,
  serverTotalPages,
  onPageChange,
}: {
  applications: Application[];
  API_ORIGIN: string;
  serverPage?: number;
  serverTotalPages?: number;
  onPageChange?: (page: number) => void;
}) {
  const toast = useToast();
  const [page, setPage] = React.useState(serverPage ?? 1);
  const [viewMode, setViewMode] = React.useState<"timeline" | "board">(
    "timeline",
  );
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (serverPage) setPage(serverPage);
  }, [serverPage]);

  // Local copy to support inline status edits without requiring parent refresh
  const [localApps, setLocalApps] = React.useState<Application[]>(applications);
  React.useEffect(() => {
    setLocalApps(applications);
  }, [applications]);

  // Filters / sort / search state
  const [filterStatus, setFilterStatus] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Helper to download files using signed URLs
  const handleDownload = async (
    fileUrl: string | undefined,
    fileName: string,
  ) => {
    if (!fileUrl) {
      toast.show({
        title: "Error",
        description: "File URL is missing",
        variant: "error",
      });
      return;
    }

    try {
      setDownloadingId(fileUrl);
      const urlObj = new URL(fileUrl, window.location.origin);
      const bucketId = urlObj.searchParams.get("bucket_id");
      const fileId = urlObj.searchParams.get("file_id");

      if (!bucketId || !fileId) {
        const endpoint = fileUrl.replace(/^\/api/, "");
        const response = await apiClient(endpoint);
        if (!response.ok) throw new Error("Download failed");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const signedUrlResponse = await apiClient("/files/signed-url", {
          method: "POST",
          body: JSON.stringify({
            file_id: fileId,
            bucket_id: bucketId,
            file_type: "storage",
            expires_in: 3600,
          }),
        });

        if (!signedUrlResponse.ok) {
          const errorData = await signedUrlResponse.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to generate download URL");
        }

        const { url: signedUrl } = await signedUrlResponse.json();
        window.location.href = signedUrl;
      }

      toast.show({
        title: "Success",
        description: "File download started",
        variant: "success",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast.show({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to download",
        variant: "error",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = useMemo(() => {
    return localApps.filter((a) => {
      const statusOk = filterStatus ? a.status === filterStatus : true;
      const q = searchQuery.trim().toLowerCase();
      const textOk = q
        ? [a.jobTitle, a.company, a.location, a.appliedDate]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        : true;
      return statusOk && textOk;
    });
  }, [localApps, filterStatus, searchQuery]);

  // Hardcode sort descending for timeline
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) =>
      (b.appliedDate || "").localeCompare(a.appliedDate || ""),
    );
  }, [filtered]);

  const totalPages =
    serverTotalPages ?? Math.max(1, Math.ceil(sorted.length / 10));
  const start = serverTotalPages ? 0 : (page - 1) * 10;
  const visible = serverTotalPages ? sorted : sorted.slice(start, start + 10);

  // Group applications by date for Timeline view
  const timelineGroups = useMemo(() => {
    const groups: Record<string, Application[]> = {};
    visible.forEach((app) => {
      const date = app.appliedDate || "Unknown Date";
      if (!groups[date]) groups[date] = [];
      groups[date].push(app);
    });
    return groups;
  }, [visible]);

  // Status update handler
  const handleStatusUpdate = async (
    id: string,
    newStatus: Application["status"],
  ) => {
    try {
      const res = await fetch(`${API_ORIGIN}/applications/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false)
        throw new Error(data.error || "Status update failed");

      setLocalApps((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
      );
      toast.show({
        title: "Updated",
        description: "Application status updated",
      });
      track(
        "application_status_changed",
        { applicationId: id, status: newStatus },
        "applications",
      );
    } catch (err) {
      toast.show({
        title: "Error",
        description: "Could not update status",
        variant: "error",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "applied":
        return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case "interview":
        return <Sparkles className="h-4 w-4 text-emerald-400" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-primary/20 text-primary border-primary/20";
      case "interview":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/20";
      default:
        return "bg-zinc-500/20 text-zinc-400 border-zinc-500/20";
    }
  };

  const KanbanColumn = ({
    title,
    apps,
    status,
  }: {
    title: string;
    apps: Application[];
    status: string;
  }) => (
    <div className="flex flex-col h-full bg-card/30 backdrop-blur-md rounded-2xl border border-white/5 shadow-lg overflow-hidden">
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-white">
          {getStatusIcon(status)}
          {title}
          <Badge
            variant="secondary"
            className="ml-2 bg-white/10 text-white border-transparent"
          >
            {apps.length}
          </Badge>
        </h3>
      </div>
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {apps.map((app) => (
            <div
              key={app.id}
              className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors shadow-sm cursor-pointer hover:shadow-md group"
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <h4 className="font-semibold text-sm leading-tight text-white line-clamp-2">
                  {app.jobTitle}
                </h4>
                <select
                  value={app.status}
                  onChange={(e) =>
                    handleStatusUpdate(
                      app.id,
                      e.target.value as Application["status"],
                    )
                  }
                  className="h-6 w-24 rounded-md border border-white/10 bg-black/40 text-white px-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="pending">Pending</option>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <p className="text-xs text-zinc-400 truncate mb-2">
                {app.company}
              </p>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                <div className="text-xs text-zinc-500 capitalize">
                  {app.location || "Remote"}
                </div>
                <div className="flex gap-1 justify-end">
                  {app.jobUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-zinc-400 hover:text-white"
                      onClick={() => window.open(app.jobUrl, "_blank")}
                      title="View Job"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {apps.length === 0 && (
            <div className="text-center py-8 text-zinc-500 text-xs border border-dashed border-white/10 rounded-xl">
              No applications
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          <Button
            variant={viewMode === "timeline" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("timeline")}
            className={cn(
              "h-8 text-xs rounded-lg transition-all",
              viewMode === "timeline" &&
                "bg-primary text-primary-foreground shadow-sm",
            )}
          >
            <Activity className="h-3.5 w-3.5 mr-2" />
            Timeline
          </Button>
          <Button
            variant={viewMode === "board" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("board")}
            className={cn(
              "h-8 text-xs rounded-lg transition-all",
              viewMode === "board" &&
                "bg-primary text-primary-foreground shadow-sm",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5 mr-2" />
            Kanban
          </Button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search timeline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-black/20 border-white/10 h-9 text-sm rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-xl border border-white/10 bg-black/20 text-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer hidden md:block"
          >
            <option value="">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {viewMode === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[500px]">
          <KanbanColumn
            status="pending"
            title="Pending"
            apps={filtered.filter((a) => a.status === "pending")}
          />
          <KanbanColumn
            status="applied"
            title="Applied"
            apps={filtered.filter((a) => a.status === "applied")}
          />
          <KanbanColumn
            status="interview"
            title="Interview"
            apps={filtered.filter((a) => a.status === "interview")}
          />
          <KanbanColumn
            status="rejected"
            title="Rejected"
            apps={filtered.filter((a) => a.status === "rejected")}
          />
        </div>
      ) : /* TIMELINE VIEW */
      applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-3xl mt-2">
          <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">
            No activity yet
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Start applying to jobs and Cockpit AI will track your application
            funnel timeline here.
          </p>
        </div>
      ) : (
        <div className="relative pl-4 md:pl-8 py-4 space-y-12 before:absolute before:inset-0 before:ml-4 md:before:ml-8 before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-border/80 before:to-transparent">
          {Object.keys(timelineGroups).length === 0 && (
            <div className="text-center text-muted-foreground py-10">
              No applications match your search criteria.
            </div>
          )}
          {Object.entries(timelineGroups).map(([date, apps]) => (
            <div key={date} className="relative">
              <div className="sticky top-6 z-10 flex items-center mb-6">
                <div className="absolute -left-4 md:-left-8 w-8 h-8 flex items-center justify-center bg-card rounded-full border-2 border-primary/30 z-10 shadow-lg -translate-x-1/2 md:translate-x-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest bg-card/80 backdrop-blur px-3 py-1.5 rounded-lg border border-white/5 ml-4 md:ml-6 shadow-sm">
                  {date}
                </h3>
              </div>

              <div className="space-y-6 ml-4 md:ml-6">
                {apps.map((app) => (
                  <div
                    key={app.id}
                    className="glass-card rounded-2xl p-5 hover:border-primary/30 transition-colors shadow-lg group relative"
                  >
                    <div className="flex flex-col lg:flex-row gap-5">
                      {/* Event summary */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={cn(
                              "px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded border",
                              getStatusColor(app.status),
                            )}
                          >
                            {app.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {app.appliedDate}
                          </span>
                        </div>
                        <h4
                          className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors cursor-pointer"
                          onClick={() =>
                            app.jobUrl && window.open(app.jobUrl, "_blank")
                          }
                        >
                          {app.jobTitle}
                        </h4>
                        <p className="text-sm text-zinc-400 flex items-center gap-2">
                          <span className="font-medium text-zinc-300">
                            {app.company}
                          </span>
                          {app.location && (
                            <>
                              <span className="text-zinc-600">•</span>
                              <span>{app.location}</span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Actions / Status updater */}
                      <div className="flex flex-col sm:flex-row lg:flex-col justify-end gap-3 shrink-0">
                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleStatusUpdate(
                              app.id,
                              e.target.value as Application["status"],
                            )
                          }
                          className="h-9 rounded-xl border border-white/10 bg-black/40 text-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer w-full sm:w-auto"
                        >
                          <option value="pending">Pending</option>
                          <option value="applied">Applied</option>
                          <option value="interview">Interview</option>
                          <option value="rejected">Rejected</option>
                        </select>

                        {app.jobUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-xs h-9"
                            onClick={() => window.open(app.jobUrl, "_blank")}
                          >
                            View Posting{" "}
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Assets Generated */}
                    {app.files && (
                      <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary rounded-lg text-xs"
                          disabled={downloadingId === app.files.cv}
                          onClick={() =>
                            handleDownload(
                              app.files!.cv,
                              `CV-${app.company}-${app.jobTitle}.pdf`,
                            )
                          }
                        >
                          {downloadingId === app.files.cv ? (
                            <span className="h-3.5 w-3.5 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 mr-2" />
                          )}
                          Tailored CV
                        </Button>
                        {app.files.cover_letter && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent rounded-lg text-xs"
                            disabled={downloadingId === app.files.cover_letter}
                            onClick={() =>
                              handleDownload(
                                app.files!.cover_letter,
                                `CoverLetter-${app.company}.txt`,
                              )
                            }
                          >
                            {downloadingId === app.files.cover_letter ? (
                              <span className="h-3.5 w-3.5 mr-2 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                            ) : (
                              <FileText className="h-3.5 w-3.5 mr-2" />
                            )}
                            Cover Letter
                          </Button>
                        )}
                        {app.files.interview_prep && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg text-xs"
                            disabled={
                              downloadingId === app.files.interview_prep
                            }
                            onClick={() =>
                              handleDownload(
                                app.files!.interview_prep!,
                                `InterviewPrep-${app.company}.txt`,
                              )
                            }
                          >
                            {downloadingId === app.files.interview_prep ? (
                              <span className="h-3.5 w-3.5 mr-2 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5 mr-2" />
                            )}
                            Interview Prep
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/5">
            <p className="text-sm text-zinc-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  const next = Math.max(1, page - 1);
                  setPage(next);
                  onPageChange?.(next);
                }}
                className="rounded-xl border-white/10"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => {
                  const next = Math.min(totalPages, page + 1);
                  setPage(next);
                  onPageChange?.(next);
                }}
                className="rounded-xl border-white/10"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
