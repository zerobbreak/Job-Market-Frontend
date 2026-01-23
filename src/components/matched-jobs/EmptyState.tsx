import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  message?: string | null;
  onSearch?: () => void;
}

export function EmptyState({ message, onSearch }: EmptyStateProps) {
  return (
    <div className="text-center py-20 text-muted-foreground bg-muted/30 rounded-2xl border border-border">
      <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-10" />
      <h3 className="text-lg font-medium mb-2">No matches found yet</h3>
      {message ? (
        <p className="mb-4">{message}</p>
      ) : (
        <p className="mb-4">Click "Refresh Matches" to search based on your profile.</p>
      )}
      {onSearch && (
        <Button onClick={onSearch} variant="outline">
          Search for Jobs
        </Button>
      )}
    </div>
  );
}
