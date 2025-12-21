import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  variant = "default",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
    xl: "h-16 w-16 border-4",
  };

  const variantClasses = {
    default: "border-muted-foreground/20 border-t-foreground",
    primary: "border-blue-500/20 border-t-blue-500",
    success: "border-green-500/20 border-t-green-500",
    warning: "border-yellow-500/20 border-t-yellow-500",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
}

interface PulseDotsProps {
  className?: string;
}

export function PulseDotsLoader({ className }: PulseDotsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted/50", className)} />
  );
}

interface ProgressBarProps {
  progress?: number; // 0-100
  indeterminate?: boolean;
  className?: string;
}

export function ProgressBar({
  progress = 0,
  indeterminate = false,
  className,
}: ProgressBarProps) {
  return (
    <div
      className={cn(
        "h-1 w-full bg-muted/30 rounded-full overflow-hidden",
        className
      )}
    >
      {indeterminate ? (
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-[shimmer_2s_infinite]"
          style={{
            width: "40%",
            animation: "shimmer 2s ease-in-out infinite",
          }}
        />
      ) : (
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export function LoadingOverlay({
  message = "Loading...",
  submessage,
  className,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card/50 border border-border shadow-2xl">
        <LoadingSpinner size="lg" variant="primary" />
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">{message}</p>
          {submessage && (
            <p className="text-sm text-muted-foreground mt-1">{submessage}</p>
          )}
        </div>
        <PulseDotsLoader />
      </div>
    </div>
  );
}

interface CardSkeletonProps {
  lines?: number;
  className?: string;
}

export function CardSkeleton({ lines = 3, className }: CardSkeletonProps) {
  return (
    <div
      className={cn(
        "space-y-3 p-6 border border-border rounded-xl bg-card/50",
        className
      )}
    >
      <Skeleton className="h-6 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 w-full"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
}

// Add shimmer animation to global CSS
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(400%); }
    }
  `;
  document.head.appendChild(style);
}
