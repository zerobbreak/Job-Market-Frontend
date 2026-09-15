import { ArrowUpRight, MapPin } from "lucide-react";
import { FitBadge } from "@/components/ui/fit-badge";

export interface JobFeedCardJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  skills?: string[];
}

export interface JobFeedCardMatch {
  job: JobFeedCardJob;
  match_score: number;
  match_reasons: string[];
}

export function JobFeedCard({
  match,
  onApply,
}: {
  match: JobFeedCardMatch;
  index?: number;
  onApply?: (job: JobFeedCardJob) => void;
}) {
  const { job } = match;
  const reason = match.match_reasons?.[0];
  const snippet = job.description?.replace(/\s+/g, " ").slice(0, 140).trim();
  const skills = (job.skills ?? []).slice(0, 3);
  const hasUrl = !!job.url && /^https?:\/\//.test(job.url);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-medium text-neutral-900 line-clamp-2">{job.title}</h3>
          <p className="mt-0.5 truncate text-sm text-neutral-500">{job.company}</p>
        </div>
        <FitBadge score={match.match_score} />
      </div>

      {job.location && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{job.location}</span>
        </p>
      )}

      {reason ? (
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 line-clamp-2">{reason}</p>
      ) : (
        snippet && (
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 line-clamp-2">
            {snippet}&hellip;
          </p>
        )
      )}

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {(onApply || hasUrl) && (
        <div className="mt-auto flex items-center gap-1 pt-4">
          {onApply && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onApply(job);
              }}
              className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-neutral-700 active:scale-[0.98]"
            >
              Tailor and apply
            </button>
          )}
          {hasUrl && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
            >
              View listing
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
