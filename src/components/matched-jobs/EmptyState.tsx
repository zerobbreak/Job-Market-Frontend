import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  message?: string | null;
  onSearch?: () => void;
}

export function EmptyState({ message, onSearch }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
      <Briefcase className="mx-auto mb-4 h-6 w-6 text-neutral-400" strokeWidth={1.75} />
      <h3 className="font-medium text-neutral-900">No matches yet</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500 text-pretty">
        {message || "Search to find roles that fit your CV."}
      </p>
      {onSearch && (
        <Button onClick={onSearch} className="mt-6">
          Search for jobs
        </Button>
      )}
    </div>
  );
}
