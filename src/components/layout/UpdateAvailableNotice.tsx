import { useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppVersion } from "@/hooks/useAppVersion";

/**
 * Non-blocking notice shown when a new deploy is detected while the user is
 * on the page. Sits in a pointer-events-none wrapper so only the card itself
 * is clickable — everything underneath stays fully usable.
 */
export function UpdateAvailableNotice() {
  const { updateAvailable } = useAppVersion();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex justify-center px-4">
      <div
        role="status"
        className="pointer-events-auto flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-neutral-200 bg-white p-3 pl-4 text-sm text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-12px_rgba(0,0,0,0.18)] animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <p>
          <span className="font-medium">An update is available.</span>{" "}
          <span className="text-neutral-500">
            Refresh whenever you're ready — nothing you're doing will be interrupted.
          </span>
        </p>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <button
            type="button"
            aria-label="Dismiss"
            className="-m-1 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
