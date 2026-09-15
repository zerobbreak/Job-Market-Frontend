import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="py-24 text-center animate-in fade-in duration-500" role="status">
      <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin text-neutral-400" />
      <h3 className="font-medium text-neutral-900">Finding jobs that fit you</h3>
      <p className="mt-1 text-sm text-neutral-500">
        Matching live listings against your CV.
      </p>
    </div>
  );
}
