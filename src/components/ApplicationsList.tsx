import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { FileText, Upload, Sparkles, ExternalLink, LayoutGrid, List as ListIcon } from "lucide-react";
import { track } from "@/utils/analytics";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient } from "@/utils/api";

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

function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "applied") return "default";
  if (status === "interview") return "secondary";
  if (status === "rejected") return "destructive";
  return "outline";
}

export default function ApplicationsList({
  applications,
  API_ORIGIN,
  onApply,
  serverPage,
  serverTotalPages,
  onPageChange,
}: {
  applications: Application[];
  API_ORIGIN: string;
  onApply: (app: {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    url: string;
  }) => void;
  serverPage?: number;
  serverTotalPages?: number;
  onPageChange?: (page: number) => void;
}) {
  const toast = useToast();
  const [page, setPage] = React.useState(serverPage ?? 1);
  const [viewMode, setViewMode] = React.useState<"list" | "board">("list");
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
  const [sortBy, setSortBy] = React.useState<
    "date_desc" | "date_asc" | "company" | "title"
  >("date_desc");

  // Helper to download files using signed URLs (Industry Standard - AWS S3/Cloudflare R2 Pattern)
  const handleDownload = async (fileUrl: string | undefined, fileName: string) => {
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
      
      // Extract bucket_id and file_id from URL
      // Format: /api/storage/download?bucket_id=xxx&file_id=yyy
      const urlObj = new URL(fileUrl, window.location.origin);
      const bucketId = urlObj.searchParams.get('bucket_id');
      const fileId = urlObj.searchParams.get('file_id');
      
      if (!bucketId || !fileId) {
        // Fallback to old method if URL format is unexpected
        const endpoint = fileUrl.replace(/^\/api/, '');
        const response = await apiClient(endpoint);
        
        if (!response.ok) {
          throw new Error("Download failed");
        }
        
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
        // Generate signed URL (Industry Standard)
        const signedUrlResponse = await apiClient('/files/signed-url', {
          method: 'POST',
          body: JSON.stringify({
            file_id: fileId,
            bucket_id: bucketId,
            file_type: 'storage',
            expires_in: 3600 // 1 hour
          })
        });
        
        if (!signedUrlResponse.ok) {
          const errorData = await signedUrlResponse.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to generate download URL");
        }
        
        const { url: signedUrl } = await signedUrlResponse.json();
        
        // Use signed URL for direct download (no authentication headers needed)
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
        description: error instanceof Error ? error.message : "Failed to download file. Please try again.",
        variant: "error",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  // 1. Filter first
  const filtered = localApps.filter((a) => {
    const statusOk = filterStatus ? a.status === filterStatus : true;
    const q = searchQuery.trim().toLowerCase();
    const textOk = q
      ? [a.jobTitle, a.company, a.location, a.appliedDate]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      : true;
    return statusOk && textOk;
  });

  // 2. Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "date_desc")
      return (b.appliedDate || "").localeCompare(a.appliedDate || "");
    if (sortBy === "date_asc")
      return (a.appliedDate || "").localeCompare(b.appliedDate || "");
    if (sortBy === "company")
      return (a.company || "").localeCompare(b.company || "");
    return (a.jobTitle || "").localeCompare(b.jobTitle || "");
  });

  // 3. Paginate
  const totalPages =
    serverTotalPages ?? Math.max(1, Math.ceil(sorted.length / 10));
  const start = serverTotalPages ? 0 : (page - 1) * 10;
  const visible = serverTotalPages ? sorted : sorted.slice(start, start + 10);

  // Status update handler
  const handleStatusUpdate = async (id: string, newStatus: Application["status"]) => {
    try {
      const res = await fetch(
        `${API_ORIGIN}/applications/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await res.json();
      if (!res.ok || data.success === false)
        throw new Error(
          data.error || "Status update failed"
        );
      setLocalApps((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: newStatus }
            : a
        )
      );
      toast.show({
        title: "Updated",
        description: "Application status updated",
      });
      track(
        "application_status_changed",
        {
          applicationId: id,
          status: newStatus,
        },
        "applications"
      );
    } catch (err) {
      toast.show({
        title: "Error",
        description: "Could not update status",
        variant: "error",
      });
    }
  };

  const KanbanColumn = ({
    title,
    apps,
  }: {
    title: string;
    apps: Application[];
  }) => (
    <div className="flex flex-col h-full bg-muted/30 rounded-lg border border-border/50">
      <div className="p-3 border-b border-border/50 flex justify-between items-center bg-muted/50 rounded-t-lg">
        <h3 className="font-medium text-sm flex items-center gap-2">
          {title}
          <Badge variant="secondary" className="text-xs px-1.5 h-5 min-w-[1.25rem]">
            {apps.length}
          </Badge>
        </h3>
      </div>
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {apps.map((app) => (
            <Card key={app.id} className="bg-card shadow-sm hover:shadow-md transition-shadow border-border/60">
              <CardHeader className="p-3 pb-2 space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-semibold text-sm leading-tight line-clamp-2">
                    {app.jobTitle}
                  </h4>
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusUpdate(app.id, e.target.value as Application["status"])}
                    className="h-6 w-24 rounded-md border border-border bg-card text-foreground px-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="pending">Pending</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <p className="text-xs text-muted-foreground truncate">{app.company}</p>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                 <div className="text-xs text-muted-foreground mb-2">
                   {app.location}
                 </div>
                 <div className="flex gap-1 justify-end">
                    {app.jobUrl && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => window.open(app.jobUrl, '_blank')}
                            title="View Job"
                        >
                            <ExternalLink className="h-3 w-3" />
                        </Button>
                    )}
                 </div>
              </CardContent>
            </Card>
          ))}
          {apps.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-xs border-2 border-dashed border-border/50 rounded-md">
              No applications
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-foreground">Your Applications</h2>
        <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
            <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 text-xs"
            >
                <ListIcon className="h-3.5 w-3.5 mr-2" />
                List
            </Button>
            <Button
                variant={viewMode === "board" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("board")}
                className="h-8 text-xs"
            >
                <LayoutGrid className="h-3.5 w-3.5 mr-2" />
                Board
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <Input
            placeholder="Search title, company, location"
            value={searchQuery}
            onChange={(e) => {
              const v = e.target.value;
              setSearchQuery(v);
              track("applications_search", { query: v }, "applications");
            }}
            aria-label="Search applications"
          />
        </div>
        {viewMode === "list" && (
            <>
                <div>
                <select
                    value={filterStatus}
                    onChange={(e) => {
                    const v = e.target.value;
                    setFilterStatus(v);
                    track(
                        "applications_filter_status",
                        { status: v || "all" },
                        "applications"
                    );
                    }}
                    className="w-full h-10 rounded-md border border-border bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Filter by status"
                >
                    <option value="">All statuses</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="rejected">Rejected</option>
                    <option value="pending">Pending</option>
                </select>
                </div>
                <div>
                <select
                    value={sortBy}
                    onChange={(e) => {
                    const v = e.target.value as typeof sortBy;
                    setSortBy(v);
                    track("applications_sort", { sortBy: v }, "applications");
                    }}
                    className="w-full h-10 rounded-md border border-border bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Sort applications"
                >
                    <option value="date_desc">Newest first</option>
                    <option value="date_asc">Oldest first</option>
                    <option value="company">Company</option>
                    <option value="title">Job Title</option>
                </select>
                </div>
            </>
        )}
      </div>

      {viewMode === "board" ? (
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-250px)] min-h-[500px]">
            <KanbanColumn
                title="Pending"
                apps={filtered.filter(a => a.status === 'pending')}
            />
            <KanbanColumn
                title="Applied"
                apps={filtered.filter(a => a.status === 'applied')}
            />
            <KanbanColumn
                title="Interview"
                apps={filtered.filter(a => a.status === 'interview')}
            />
             <KanbanColumn
                title="Rejected"
                apps={filtered.filter(a => a.status === 'rejected')}
            />
         </div>
      ) : (
        /* LIST VIEW (Existing) */
        applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No applications yet
            </h3>
            <p className="text-muted-foreground">
              Start applying to jobs to see them here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {visible.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{application.jobTitle}</CardTitle>
                    <CardDescription>
                      {application.company}
                      {application.location ? ` • ${application.location}` : ""}
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-1">
                      Applied on {application.appliedDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusBadgeVariant(application.status)}>
                      {application.status.charAt(0).toUpperCase() +
                        application.status.slice(1)}
                    </Badge>
                    <select
                      value={application.status}
                      onChange={(e) => handleStatusUpdate(application.id, e.target.value as Application["status"])}
                      className="h-8 rounded-md border border-border bg-card text-foreground px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="rejected">Rejected</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              {application.files && (
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="flex items-center justify-between p-3 h-auto bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
                      disabled={downloadingId === application.files.cv}
                      onClick={() => {
                        track(
                          "file_download_cv",
                          { applicationId: application.id },
                          "applications"
                        );
                        handleDownload(application.files!.cv, `CV-${application.company}-${application.jobTitle}.pdf`);
                      }}
                    >
                      <div className="flex items-center">
                        {downloadingId === application.files.cv ? (
                           <span className="h-5 w-5 mr-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                        ) : (
                           <FileText className="h-5 w-5 text-blue-400 mr-3" />
                        )}
                        <span className="font-medium text-blue-300">
                          Tailored CV
                        </span>
                      </div>
                      <Upload className="h-4 w-4 text-blue-400 rotate-180" />
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center justify-between p-3 h-auto bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors"
                      disabled={downloadingId === application.files.cover_letter}
                      onClick={() => {
                        track(
                          "file_download_cover_letter",
                          { applicationId: application.id },
                          "applications"
                        );
                         handleDownload(application.files!.cover_letter, `CoverLetter-${application.company}.txt`);
                      }}
                    >
                      <div className="flex items-center">
                         {downloadingId === application.files.cover_letter ? (
                           <span className="h-5 w-5 mr-3 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                        ) : (
                           <FileText className="h-5 w-5 text-purple-400 mr-3" />
                        )}
                        <span className="font-medium text-purple-300">
                          Cover Letter
                        </span>
                      </div>
                      <Upload className="h-4 w-4 text-purple-400 rotate-180" />
                    </Button>
                    {application.files.interview_prep && (
                      <Button
                        variant="outline"
                        className="flex items-center justify-between p-3 h-auto bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
                        disabled={downloadingId === application.files.interview_prep}
                        onClick={() => {
                          track(
                            "file_download_interview_prep",
                            { applicationId: application.id },
                            "applications"
                          );
                          handleDownload(application.files!.interview_prep!, `InterviewPrep-${application.company}.txt`);
                        }}
                      >
                        <div className="flex items-center">
                          {downloadingId === application.files.interview_prep ? (
                             <span className="h-5 w-5 mr-3 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
                          ) : (
                             <Sparkles className="h-5 w-5 text-green-400 mr-3" />
                          )}
                          <span className="font-medium text-green-300">
                            Interview Prep
                          </span>
                        </div>
                        <Upload className="h-4 w-4 text-green-400 rotate-180" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
              <CardFooter className="flex gap-3">
                {(() => {
                  const url = application.jobUrl;
                  const valid =
                    typeof url === "string" && /^https?:\/\//.test(url);
                  return (
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={!valid}
                      onClick={() => {
                        if (!valid) {
                          toast.show({
                            title: "Invalid link",
                            description: "This job link is invalid or missing.",
                            variant: "error",
                          });
                          return;
                        }
                        track(
                          "application_view_job",
                          { applicationId: application.id, url },
                          "applications"
                        );
                        window.open(url!, "_blank", "noopener,noreferrer");
                      }}
                    >
                      View Job <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  );
                })()}
                <Button
                  className="flex-1"
                  onClick={() => {
                    track(
                      "application_apply_again",
                      { applicationId: application.id },
                      "applications"
                    );
                    onApply({
                      id: application.id,
                      title: application.jobTitle,
                      company: application.company,
                      location: application.location || "",
                      description: "",
                      url: application.jobUrl || "",
                    });
                  }}
                >
                  Apply Again
                </Button>
              </CardFooter>
            </Card>
          ))}
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => {
                  const next = Math.max(1, page - 1);
                  setPage(next);
                  onPageChange?.(next);
                  track(
                    "applications_pagination_prev",
                    { page: next },
                    "applications"
                  );
                }}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => {
                  const next = Math.min(totalPages, page + 1);
                  setPage(next);
                  onPageChange?.(next);
                  track(
                    "applications_pagination_next",
                    { page: next },
                    "applications"
                  );
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )
      )}
    </>
  );
}
