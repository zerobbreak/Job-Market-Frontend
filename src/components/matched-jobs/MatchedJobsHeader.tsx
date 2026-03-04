import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Top Matches
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search matches..."
            className="pl-9 bg-[#12121a] border-white/5 text-sm h-10 w-full rounded-xl focus-visible:ring-1 focus-visible:ring-white/20"
          />
        </div>
        <Button
          onClick={() => onSearch(true)} // Pass true to force refresh
          disabled={loading || !hasProfile}
          variant="outline"
          className="h-10 bg-[#12121a] border-white/5 hover:bg-white/5 text-white transition-all rounded-xl"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-400" />
              Searching...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4 text-zinc-400" />
              Refresh
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
