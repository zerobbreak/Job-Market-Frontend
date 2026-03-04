import { useOutletContext } from "react-router-dom";
import type { OutletContextType } from "@/components/layout/RootLayout";
import { useJobMatching } from "@/hooks/useJobMatching";
import { useJobApplication } from "@/hooks/useJobApplication";
import { useMatchedJobsCache } from "@/hooks/useMatchedJobsCache";
import { MatchedJobsHeader } from "@/components/matched-jobs/MatchedJobsHeader";
import { SearchInProgressBanner } from "@/components/matched-jobs/SearchInProgressBanner";
import { ApplicationStatusBanner } from "@/components/matched-jobs/ApplicationStatusBanner";
import { TemplateSelectionDialog } from "@/components/matched-jobs/TemplateSelectionDialog";
import { ApplicationPreviewDialog } from "@/components/matched-jobs/ApplicationPreviewDialog";
import { EmptyState } from "@/components/matched-jobs/EmptyState";
import { MatchedJobsGridLayout } from "@/components/matched-jobs/MatchedJobsGridLayout";
import type { PipelineJob } from "@/components/matched-jobs/HighMatchPipelineSidebar";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function MatchedJobs() {
  const { profile } = useOutletContext<OutletContextType>();

  // Custom hooks for state management
  const {
    matchedJobs,
    setMatchedJobs,
    loading,
    cacheLoading,
    error: matchingError,
    message,
    location,
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
    previewPhase,
    previewData,
    initiatePreview,
    handleAutoApply,
    isAutoApplying,
    automationStatus,
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

      <SearchInProgressBanner loading={loading} />

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
          {!loading && !cacheLoading && matchedJobs.length === 0 && (
            <EmptyState message={message} onSearch={() => findMatches(true)} />
          )}

          {(loading || cacheLoading || matchedJobs.length > 0) && (
            <MatchedJobsGridLayout
              filteredMatchedJobs={filteredMatchedJobs as PipelineJob[]}
              handleApply={handleApply}
              isLoading={loading || cacheLoading}
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
        phase={previewPhase}
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
