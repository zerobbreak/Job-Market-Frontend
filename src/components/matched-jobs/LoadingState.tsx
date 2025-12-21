import { Briefcase } from "lucide-react";

export function LoadingState() {
  return (
    <div className="text-center py-32 animate-fade-in">
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        <Briefcase className="h-10 w-10 text-blue-600 absolute inset-0 m-auto animate-pulse" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-2">
        Finding Your Perfect Matches...
      </h3>
      <p className="text-muted-foreground">
        Analyzing thousands of jobs to find the best fit for you
      </p>
    </div>
  );
}
