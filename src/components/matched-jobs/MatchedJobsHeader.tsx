import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface MatchedJobsHeaderProps {
  loading: boolean;
  onSearch: () => void;
  hasProfile: boolean;
}

export function MatchedJobsHeader({
  loading,
  onSearch,
  hasProfile,
}: MatchedJobsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
          Matched Jobs
        </h1>
        <p className="text-muted-foreground">
          Jobs tailored to your skills and experience.{" "}
          {hasProfile ? "" : "Upload a CV to see matches."}
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onSearch} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Briefcase className="mr-2 h-4 w-4" />
          )}
          {loading ? "Searching..." : "Find Matches"}
        </Button>
      </div>
    </div>
  );
}
