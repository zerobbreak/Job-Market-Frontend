import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import type { OutletContextType } from "@/components/layout/RootLayout";
import { useJobMatching } from "@/hooks/useJobMatching";
import { useJobApplication } from "@/hooks/useJobApplication";
import { useMatchedJobsCache } from "@/hooks/useMatchedJobsCache";
import { MatchedJobsHeader } from "@/components/matched-jobs/MatchedJobsHeader";
import { ApplicationStatusBanner } from "@/components/matched-jobs/ApplicationStatusBanner";
import { TemplateSelectionDialog } from "@/components/matched-jobs/TemplateSelectionDialog";
import { EmptyState } from "@/components/matched-jobs/EmptyState";
import { LoadingState } from "@/components/matched-jobs/LoadingState";

// Import MatchedResults lazily as done in Dashboard
const MatchedResults = React.lazy(() => import("@/components/MatchedResults"));

export default function MatchedJobs() {
  const { profile } = useOutletContext<OutletContextType>();

  // Custom hooks for state management
  const {
    matchedJobs,
    setMatchedJobs,
    loading,
    error: matchingError,
    location,
    minMatchScore,
    setMinMatchScore,
    findMatches,
    filteredMatchedJobs,
  } = useJobMatching();

  const {
    applying,
    applyAttempts,
    applyMaxAttempts,
    generatedFiles,
    error: applicationError,
    showTemplateDialog,
    setShowTemplateDialog,
    applyTemplate,
    setApplyTemplate,
    handleApply,
    confirmApply,
    handleCancelApply,
  } = useJobApplication();

  // Cache management
  useMatchedJobsCache(matchedJobs, location, setMatchedJobs);

  const error = matchingError || applicationError;

  return (
    <div className="space-y-6">
      <MatchedJobsHeader
        loading={loading}
        onSearch={findMatches}
        hasProfile={!!profile}
      />

      <ApplicationStatusBanner
        applying={applying}
        applyAttempts={applyAttempts}
        applyMaxAttempts={applyMaxAttempts}
        generatedFiles={generatedFiles}
        error={error}
        onCancel={handleCancelApply}
      />

      {/* Results Area */}
      <div className="min-h-[400px]">
        {loading && <LoadingState />}

        {!loading && matchedJobs.length === 0 && <EmptyState />}

        {matchedJobs.length > 0 && (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            }
          >
            <MatchedResults
              filteredMatchedJobs={filteredMatchedJobs}
              minMatchScore={minMatchScore}
              setMinMatchScore={setMinMatchScore}
              findMatches={findMatches}
              handleApply={handleApply}
            />
          </Suspense>
        )}
      </div>

      <TemplateSelectionDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        template={applyTemplate}
        onTemplateChange={setApplyTemplate}
        onConfirm={confirmApply}
      />
    </div>
  );
}
