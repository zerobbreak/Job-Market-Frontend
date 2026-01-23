import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface MatchedJobsHeaderProps {
  loading: boolean;
  onSearch: (force?: boolean) => void;
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
        <Button 
          onClick={() => onSearch(true)} // Pass true to force refresh
          disabled={loading || !hasProfile}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Matches
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
