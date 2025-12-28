import { useOutletContext } from "react-router-dom";
import type { OutletContextType } from "@/components/layout/RootLayout";
import { useJobMatching } from "@/hooks/useJobMatching";
import { useJobApplication } from "@/hooks/useJobApplication";
import { useMatchedJobsCache } from "@/hooks/useMatchedJobsCache";
import { MatchedJobsHeader } from "@/components/matched-jobs/MatchedJobsHeader";
import { ApplicationStatusBanner } from "@/components/matched-jobs/ApplicationStatusBanner";
import { TemplateSelectionDialog } from "@/components/matched-jobs/TemplateSelectionDialog";
import { ApplicationPreviewDialog } from "@/components/matched-jobs/ApplicationPreviewDialog";
import { EmptyState } from "@/components/matched-jobs/EmptyState";
import MatchedResults from "@/components/MatchedResults";
import { ErrorBoundary } from "@/components/ui/error-boundary";

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
    pendingJob,
    showPreviewDialog,
    setShowPreviewDialog,
    previewLoading,
    previewProgress,
    previewData,
    initiatePreview,
    handleAutoApply,
    isAutoApplying,
    automationStatus
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
      <ErrorBoundary>
      <div className="min-h-[400px]">
        {!loading && matchedJobs.length === 0 && <EmptyState />}

        {(loading || matchedJobs.length > 0) && (
            <MatchedResults
              filteredMatchedJobs={filteredMatchedJobs}
              minMatchScore={minMatchScore}
              setMinMatchScore={setMinMatchScore}
              findMatches={findMatches}
              handleApply={handleApply}
              isLoading={loading}
            />
        )}
      </div>
      </ErrorBoundary>

      <TemplateSelectionDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        template={applyTemplate}
        onTemplateChange={setApplyTemplate}
        onConfirm={initiatePreview}
      />

      <ApplicationPreviewDialog
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        loading={previewLoading}
        progress={previewProgress}
        jobUrl={pendingJob?.url}
        jobTitle={pendingJob?.title}
        company={pendingJob?.company}
        autoFillData={[
          `Full Name: ${profile?.name || ""}`,
          `Email: ${profile?.email || ""}`,
          `Phone: ${profile?.phone || ""}`,
          `Location: ${profile?.location || ""}`,
          `Role: ${pendingJob?.title || ""}`,
          `Company: ${pendingJob?.company || ""}`,
          `Job Location: ${pendingJob?.location || ""}`,
          ...(Array.isArray(profile?.skills)
            ? [`Skills: ${(profile?.skills || []).slice(0, 10).join(", ")}`]
            : []),
        ].join("\n")}
        cvHtml={previewData?.cvHtml || ""}
        coverLetterHtml={previewData?.coverLetterHtml || ""}
        atsScore={previewData?.atsScore}
        atsAnalysis={previewData?.atsAnalysis}
        error={applicationError}
        onConfirm={confirmApply}
        onCancel={() => setShowPreviewDialog(false)}
        onAutoApply={handleAutoApply}
        onRetry={initiatePreview}
        isAutoApplying={isAutoApplying}
        automationStatus={automationStatus}
        previewJobId={previewData?.jobId}
      />
    </div>
  );
}
