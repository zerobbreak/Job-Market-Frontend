import { cn } from "@/lib/utils";

/** The "92% fit" pill used across the landing page and the app. */
export function FitBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const value = Math.round(score);
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums",
        value >= 75
          ? "bg-emerald-50 text-emerald-700"
          : value >= 50
            ? "bg-amber-50 text-amber-700"
            : "bg-neutral-100 text-neutral-600",
        className,
      )}
    >
      {value}% fit
    </span>
  );
}
