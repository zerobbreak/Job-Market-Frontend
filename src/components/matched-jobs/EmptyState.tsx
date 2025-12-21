import { Briefcase } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-20 text-muted-foreground bg-muted/30 rounded-2xl border border-border">
      <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-10" />
      <h3 className="text-lg font-medium">No matches found yet</h3>
      <p>Click "Find Matches" to search based on your profile.</p>
    </div>
  );
}
