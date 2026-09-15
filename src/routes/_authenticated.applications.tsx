import { useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import ApplicationsList from "@/components/ApplicationsList";
import { useToast } from "@/components/ui/toast";
import { applicationsQueryOptions } from "@/api/queries/options";

const LIMIT = 10;

export const Route = createFileRoute("/_authenticated/applications")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(applicationsQueryOptions(1, LIMIT));
  },
  component: Applications,
});

function Stat({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {note && <p className="mt-1 text-xs text-neutral-400">{note}</p>}
    </div>
  );
}

function Applications() {
  const [page, setPage] = useState(1);
  const toast = useToast();

  const { data, isLoading, isError } = useQuery(applicationsQueryOptions(page, LIMIT));

  useEffect(() => {
    if (isError) {
      toast.show({
        title: "Couldn't load your applications",
        description: "Please refresh the page to try again.",
        variant: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  const applications = data?.applications ?? [];
  const total = data?.total ?? 0;

  // Status counts come from the page that's loaded
  const stats = useMemo(() => {
    const onPage = applications.length;
    const interviews = applications.filter((a) => a.status === "interview").length;
    const waiting = applications.filter((a) => a.status === "applied").length;
    const interviewRate = onPage > 0 ? Math.round((interviews / onPage) * 100) : 0;
    return { interviews, waiting, interviewRate };
  }, [applications]);

  const pageNote = total > LIMIT ? "On this page" : undefined;

  return (
    <div className="space-y-8 pb-10">
      <header>
        <p className="mb-2 text-sm text-neutral-500">Applications</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Everything you&apos;ve applied for
        </h1>
        <p className="mt-2 max-w-xl text-neutral-600 text-pretty">
          Update the status when you hear back, so you always know what to
          follow up on.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Applications" value={total} />
        <Stat label="Waiting to hear back" value={stats.waiting} note={pageNote} />
        <Stat label="Interviews" value={stats.interviews} note={pageNote} />
        <Stat label="Interview rate" value={`${stats.interviewRate}%`} note={pageNote} />
      </section>

      {isLoading && applications.length === 0 ? (
        <div className="space-y-3" role="status" aria-label="Loading applications">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-neutral-200 bg-white"
            />
          ))}
        </div>
      ) : (
        <ApplicationsList
          applications={applications}
          serverPage={page}
          serverTotalPages={Math.max(1, Math.ceil(total / LIMIT))}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
}
