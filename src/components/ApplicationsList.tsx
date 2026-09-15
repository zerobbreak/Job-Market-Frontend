import React, { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  FileText,
  LayoutGrid,
  List,
  Loader2,
  MessageSquareText,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { track } from "@/utils/analytics";
import { applicationsService, filesService } from "@/api/services";
import type { Application } from "@/api/services/applications.service";
import { cn } from "@/lib/utils";

type Status = Application["status"];

const STATUSES = [
  { value: "pending", label: "Pending", dot: "bg-neutral-300" },
  { value: "applied", label: "Applied", dot: "bg-sky-500" },
  { value: "interview", label: "Interview", dot: "bg-emerald-500" },
  { value: "rejected", label: "Unsuccessful", dot: "bg-red-400" },
] as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats in UTC so the server and browser render the same text. */
function formatDay(value: string) {
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

const softShadow = "shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

function StatusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: Status) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Status)}
      onClick={(e) => e.stopPropagation()}
      aria-label="Application status"
      className={cn(
        "h-9 cursor-pointer rounded-full border border-neutral-200 bg-white px-3 text-sm text-neutral-700 transition-colors hover:border-neutral-300 focus:outline-none focus:ring-4 focus:ring-neutral-900/5",
        softShadow,
      )}
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

export default function ApplicationsList({
  applications,
  serverPage,
  serverTotalPages,
  onPageChange,
}: {
  applications: Application[];
  serverPage?: number;
  serverTotalPages?: number;
  onPageChange?: (page: number) => void;
}) {
  const toast = useToast();
  const [page, setPage] = React.useState(serverPage ?? 1);
  const [viewMode, setViewMode] = React.useState<"timeline" | "board">("timeline");
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (serverPage) setPage(serverPage);
  }, [serverPage]);

  // Local copy to support inline status edits without requiring parent refresh
  const [localApps, setLocalApps] = React.useState<Application[]>(applications);
  React.useEffect(() => {
    setLocalApps(applications);
  }, [applications]);

  // Filters / search state
  const [filterStatus, setFilterStatus] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Helper to download files using signed URLs
  const handleDownload = async (fileUrl: string | undefined, fileName: string) => {
    if (!fileUrl) {
      toast.show({
        title: "File not found",
        description: "This file is missing. Try generating the application again.",
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
        const response = await filesService.downloadFile(endpoint);
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
        const { url: signedUrl } = await filesService.getSignedUrl(fileId, bucketId);
        window.location.href = signedUrl;
      }

      toast.show({
        title: "Download started",
        variant: "success",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast.show({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Please try again.",
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

  // Newest first
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) =>
      (b.appliedDate || "").localeCompare(a.appliedDate || ""),
    );
  }, [filtered]);

  const totalPages = serverTotalPages ?? Math.max(1, Math.ceil(sorted.length / 10));
  const start = serverTotalPages ? 0 : (page - 1) * 10;
  const visible = serverTotalPages ? sorted : sorted.slice(start, start + 10);

  // Group applications by date for the list view
  const dateGroups = useMemo(() => {
    const groups: Record<string, Application[]> = {};
    visible.forEach((app) => {
      const date = app.appliedDate || "";
      if (!groups[date]) groups[date] = [];
      groups[date].push(app);
    });
    return groups;
  }, [visible]);

  const handleStatusUpdate = async (id: string, newStatus: Status) => {
    try {
      const data = await applicationsService.updateStatus(id, newStatus);
      if (data.success === false) throw new Error(data.error || "Status update failed");

      setLocalApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
      toast.show({ title: "Status updated", variant: "success" });
      track(
        "application_status_changed",
        { applicationId: id, status: newStatus },
        "applications",
      );
    } catch (err) {
      toast.show({
        title: "Couldn't update the status",
        description: "Please try again.",
        variant: "error",
      });
    }
  };

  const changePage = (next: number) => {
    setPage(next);
    onPageChange?.(next);
  };

  const fileButton = (
    url: string | undefined,
    label: string,
    fileName: string,
    Icon: typeof FileText = FileText,
  ) =>
    url ? (
      <button
        key={label}
        type="button"
        disabled={downloadingId === url}
        onClick={() => handleDownload(url, fileName)}
        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-900 disabled:opacity-50"
      >
        {downloadingId === url ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Icon className="h-3.5 w-3.5" />
        )}
        {label}
      </button>
    ) : null;

  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
        <p className="font-medium text-neutral-900">No applications yet</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500 text-pretty">
          When you tailor your CV for a job and apply, it shows up here so you
          can keep track of it.
        </p>
        <Button asChild className="mt-6">
          <Link to="/job-matches">Find a job to apply for</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex self-start rounded-full bg-neutral-100 p-1" role="tablist" aria-label="View">
          {(
            [
              ["timeline", "List", List],
              ["board", "Board", LayoutGrid],
            ] as const
          ).map(([mode, label, Icon]) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={viewMode === mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                viewMode === mode
                  ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  : "text-neutral-500 hover:text-neutral-900",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 md:w-64 md:flex-none">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Search by role or company"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search applications"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filter by status"
            className={cn(
              "h-10 cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 transition-colors hover:border-neutral-300 focus:outline-none focus:ring-4 focus:ring-neutral-900/5",
              softShadow,
            )}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {viewMode === "board" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {STATUSES.map((status) => {
            const apps = filtered.filter((a) => a.status === status.value);
            return (
              <section key={status.value} className="flex flex-col rounded-2xl bg-neutral-100/70 p-2">
                <header className="flex items-center justify-between px-2 py-2">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                    <span className={cn("h-2 w-2 rounded-full", status.dot)} />
                    {status.label}
                  </h3>
                  <span className="text-xs tabular-nums text-neutral-500">{apps.length}</span>
                </header>
                <ul className="max-h-[70vh] space-y-2 overflow-y-auto">
                  {apps.map((app) => (
                    <li
                      key={app.id}
                      className={cn("rounded-xl border border-neutral-200 bg-white p-3.5", softShadow)}
                    >
                      <p className="text-sm font-medium text-neutral-900 line-clamp-2">
                        {app.jobTitle}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        {app.company}
                        {app.location && ` · ${app.location}`}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <StatusSelect
                          value={app.status}
                          onChange={(v) => handleStatusUpdate(app.id, v)}
                        />
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open the listing for ${app.jobTitle}`}
                            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                  {apps.length === 0 && (
                    <li className="rounded-xl border border-dashed border-neutral-300 px-3 py-6 text-center text-xs text-neutral-500">
                      Nothing here
                    </li>
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      ) : Object.keys(dateGroups).length === 0 ? (
        <p className="rounded-2xl border border-neutral-200 bg-white px-6 py-10 text-center text-sm text-neutral-500">
          No applications match your search.
        </p>
      ) : (
        <div className="space-y-8">
          {Object.entries(dateGroups).map(([date, apps]) => (
            <section key={date || "undated"}>
              <h3 className="mb-3 text-sm text-neutral-500">
                {date ? formatDay(date) : "No date"}
              </h3>
              <ul
                className={cn(
                  "divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white",
                  softShadow,
                )}
              >
                {apps.map((app) => (
                  <li key={app.id} className="p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900">{app.jobTitle}</p>
                        <p className="mt-0.5 text-sm text-neutral-500">
                          {app.company}
                          {app.location && ` · ${app.location}`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <StatusSelect
                          value={app.status}
                          onChange={(v) => handleStatusUpdate(app.id, v)}
                        />
                        {app.jobUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={app.jobUrl} target="_blank" rel="noopener noreferrer">
                              Listing
                              <ArrowUpRight />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    {app.files && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {fileButton(
                          app.files.cv,
                          "Tailored CV",
                          `CV-${app.company}-${app.jobTitle}.pdf`,
                        )}
                        {fileButton(
                          app.files.cover_letter,
                          "Cover letter",
                          `CoverLetter-${app.company}.txt`,
                        )}
                        {fileButton(
                          app.files.interview_prep,
                          "Interview prep",
                          `InterviewPrep-${app.company}.txt`,
                          MessageSquareText,
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {totalPages > 1 && (
            <nav className="flex items-center justify-between" aria-label="Pagination">
              <p className="text-sm text-neutral-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => changePage(Math.max(1, page - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => changePage(Math.min(totalPages, page + 1))}
                >
                  Next
                </Button>
              </div>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
