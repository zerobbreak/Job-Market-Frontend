import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface JobCardSkeletonProps {
  viewMode: "grid" | "list";
}

export function JobCardSkeleton({ viewMode }: JobCardSkeletonProps) {
  return (
    <Card
      className={cn(
        "border-border bg-card/50 backdrop-blur-sm",
        viewMode === "grid" ? "flex flex-col" : ""
      )}
    >
      <CardHeader className={viewMode === "grid" ? "flex-1" : ""}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0 space-y-3">
            {/* Job Title */}
            <Skeleton className="h-7 w-3/4" />

            {/* Company and Location */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>

          {/* Match Score Badge */}
          <Skeleton className="h-6 w-12 rounded-full shrink-0" />
        </div>

        {/* Match Reasons Section */}
        <div className="bg-muted/30 rounded-lg p-4 border border-border/50 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: viewMode === "grid" ? 2 : 3 }).map(
              (_, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Skeleton className="h-1.5 w-1.5 rounded-full mt-2 shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              )
            )}
          </div>
        </div>

        {/* Description (List view only) */}
        {viewMode === "list" && (
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}
      </CardHeader>

      <CardFooter
        className={cn("gap-2", viewMode === "grid" ? "flex-col" : "flex-row")}
      >
        {/* Action Buttons */}
        <Skeleton
          className={cn("h-10", viewMode === "grid" ? "w-full" : "flex-1")}
        />
        <Skeleton
          className={cn("h-10", viewMode === "grid" ? "w-full" : "flex-1")}
        />
      </CardFooter>
    </Card>
  );
}
