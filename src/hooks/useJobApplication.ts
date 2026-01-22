/**
 * useJobApplication Hook
 * 
 * Manages job application state and preview generation.
 * 
 * IMPORTANT: Hook order must remain constant for React Fast Refresh compatibility.
 * Do not reorder hooks or add conditional hooks.
 */
import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/utils/api";
import { useToast } from "@/components/ui/toast";
import { track } from "@/utils/analytics";
import type { Job } from "./useJobMatching";
import { applicationsService } from "@/api/services/applications.service";

const GENERATED_FILES_STORAGE_KEY = "generatedApplicationFiles";

interface GeneratedFiles {
  cv: string;
  cover_letter: string;
  interview_prep?: string;
  form_data?: string;
  jobId?: string;
  jobTitle?: string;
  generatedAt?: string;
}

function loadGeneratedFilesFromStorage(): GeneratedFiles | null {
  try {
    const stored = localStorage.getItem(GENERATED_FILES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if files were generated within the last 24 hours
      if (parsed.generatedAt) {
        const generatedTime = new Date(parsed.generatedAt).getTime();
        const now = Date.now();
        const hoursSinceGenerated = (now - generatedTime) / (1000 * 60 * 60);
        if (hoursSinceGenerated < 24) {
          return parsed;
        }
        // Expired, clear it
        localStorage.removeItem(GENERATED_FILES_STORAGE_KEY);
      }
    }
  } catch (e) {
    console.error("Error loading generated files from storage:", e);
  }
  return null;
}

function saveGeneratedFilesToStorage(files: GeneratedFiles | null) {
  try {
    if (files) {
      localStorage.setItem(GENERATED_FILES_STORAGE_KEY, JSON.stringify(files));
    } else {
      localStorage.removeItem(GENERATED_FILES_STORAGE_KEY);
    }
  } catch (e) {
    console.error("Error saving generated files to storage:", e);
  }
}

export function useJobApplication() {
  // ============================================================================
  // HOOK ORDER MUST REMAIN CONSTANT - DO NOT REORDER OR ADD CONDITIONAL HOOKS
  // ============================================================================
  // All hooks must be called unconditionally and in the same order every render
  // This ensures React Hooks rules are followed and prevents hook order violations
  
  // Context hooks (always first)
  const toast = useToast();

  // State hooks (application state)
  const [applying, setApplying] = useState(false);
  const [applyAttempts] = useState(0);
  const [applyMaxAttempts] = useState(40);
  const [currentApplyJobId, setCurrentApplyJobId] = useState<string | null>(null);
  const [pendingJob, setPendingJob] = useState<Job | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [applyTemplate, setApplyTemplate] = useState<"MODERN" | "PROFESSIONAL" | "ACADEMIC">("MODERN");
  const [generatedFiles] = useState<GeneratedFiles | null>(
    () => loadGeneratedFilesFromStorage()
  );
  const [error, setError] = useState<string>("");
  
  // Preview state hooks (grouped together)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewProgress, setPreviewProgress] = useState<number>(0);
  const [previewPhase, setPreviewPhase] = useState<string>("");
  const [previewData, setPreviewData] = useState<{
    cvHtml: string;
    coverLetterHtml: string;
    atsScore?: number;
    atsAnalysis?: string;
    jobId?: string;
    applicationAnswers?: Record<string, string>;
  } | null>(null);
  
  // Automation state hooks
  const [isAutoApplying, setIsAutoApplying] = useState(false);
  const [automationStatus, setAutomationStatus] = useState<string>("");

  // Ref hooks (after state)
  const applyCancelledRef = useRef(false);

  // Effect hooks (always last, after all state/ref hooks)
  useEffect(() => {
    saveGeneratedFilesToStorage(generatedFiles);
  }, [generatedFiles]);

  const handleApply = (job: Job) => {
    setPendingJob(job);
    setShowTemplateDialog(true);
  };

  const confirmApply = async () => {
    if (!pendingJob) return;
    setShowTemplateDialog(false);
    
    // Legacy support: "Confirm" now means "I've applied manually" or "Process Complete"
    // The actual generation happened in initiatePreview
    
    try {
      track("application_manual_complete", {
        jobId: pendingJob.id,
        title: pendingJob.title,
        company: pendingJob.company,
        template: applyTemplate,
      }, "app");
      
      toast.show({
        title: "Application Recorded",
        description: "Good luck with your application!",
        variant: "success",
      });
      
    } catch (_) {
      // Ignore tracking errors
    } finally {
      setShowPreviewDialog(false);
      setApplying(false);
      setCurrentApplyJobId(null);
      // We don't clear generatedFiles here in case they want to download them later from history
    }
  };

  const initiatePreview = async () => {
    if (!pendingJob) return;
    setShowTemplateDialog(false);
    setShowPreviewDialog(true);
    setPreviewLoading(true);
    setPreviewData(null);
    setPreviewProgress(0);
    setPreviewPhase("");
    setError("");

    try {
      const startResp = await apiClient("/apply-preview/start", {
        method: "POST",
        body: JSON.stringify({
          job: pendingJob,
          template: applyTemplate,
        }),
      });
      
      if (!startResp.ok) {
          if (startResp.status === 401) {
              throw new Error("You must be logged in to generate a preview.");
          }
          const errorText = await startResp.text();
          throw new Error(`Server error: ${startResp.status} - ${errorText}`);
      }

      const startData = await startResp.json();
      if (!startData.success || !startData.job_id) {
              throw new Error(startData.error || "Failed to start preview");
            }
            const jobId = startData.job_id as string;

            // Wait a moment for the job to be persisted in Appwrite
            const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
            await delay(1000);

            let attempts = 0;
            const maxAttempts = 180; // ~7.5 minutes max (with exponential backoff)
            let consecutiveErrors = 0;
      const maxConsecutiveErrors = 3;

      while (attempts < maxAttempts) {
        try {
          const statusResp = await apiClient(`/apply-preview/status?job_id=${jobId}`, {
            method: "GET",
          });
          
          if (!statusResp.ok) {
            if (statusResp.status === 404) {
              // Job not found - might have been cleared, wait a bit and retry once
              if (attempts < 5) {
                await delay(1000);
                attempts += 1;
                continue;
              }
              throw new Error("Preview job not found. Please try again.");
            }
            const errorText = await statusResp.text();
            throw new Error(`Server error: ${statusResp.status} - ${errorText}`);
          }

          const statusData = await statusResp.json();

          if (!statusData.success) {
            consecutiveErrors += 1;
            if (consecutiveErrors >= maxConsecutiveErrors) {
              throw new Error(statusData.error || "Preview status failed");
            }
            // Continue polling on transient errors
            await delay(1000);
            attempts += 1;
            continue;
          }

          // Reset error counter on success
          consecutiveErrors = 0;

          // Update progress and phase
          setPreviewProgress(statusData.progress ?? 0);
          setPreviewPhase(statusData.phase || "");

          if (statusData.status === "done" && statusData.result) {
            setPreviewData({
              cvHtml: statusData.result.cv_html,
              coverLetterHtml: statusData.result.cover_letter_html,
              atsScore: statusData.result.ats?.score,
              atsAnalysis: statusData.result.ats?.analysis,
              jobId: jobId,
              applicationAnswers: statusData.result.application_answers,
            });
            setPreviewPhase("Preview ready!");
            break;
          }
          
          if (statusData.status === "error") {
            throw new Error(statusData.error || "Preview generation failed");
          }

          // Exponential backoff with jitter for better performance
          attempts += 1;
          const baseDelay = 600;
          const backoff = Math.min(baseDelay + attempts * 150, 2500);
          const jitter = Math.random() * 200; // Add randomness to prevent thundering herd
          await delay(backoff + jitter);
        } catch (pollError: any) {
          // If it's a network error or transient issue, retry
          if (attempts < 10 && pollError.message?.includes("fetch")) {
            consecutiveErrors += 1;
            if (consecutiveErrors < maxConsecutiveErrors) {
              await delay(2000);
              attempts += 1;
              continue;
            }
          }
          throw pollError;
        }
      }

      // Timeout check
      if (attempts >= maxAttempts && !previewData) {
        throw new Error("Preview generation timed out. Please try again.");
      }
      if (!previewData) {
        // If loop finishes without setting data (unlikely given breaks), check if we have data now
        // This is a safety fallback, usually the loop breaks on done.
      }
    } catch (err: any) {
      console.error("Preview generation failed:", err);
      setError(err.message || "Failed to generate preview");
      // Don't close dialog on error, allow retry
      // setShowPreviewDialog(false); 
      toast.show({
        title: "Preview Failed",
        description: err.message || "Could not generate application preview",
        variant: "error",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleAutoApply = async () => {
    if (!previewData?.jobId) {
      toast.show({
        title: "Error",
        description: "Preview data not ready. Please generate preview first.",
        variant: "error",
      });
      return;
    }
    
    try {
      setIsAutoApplying(true);
      setAutomationStatus("Initializing automation agent...");
      toast.show({
        title: "Starting Auto-Apply",
        description: "Launching browser automation...",
      });
      
      const startResp = await apiClient("/apply-automation/start", {
        method: "POST",
        body: JSON.stringify({
          job_id: previewData.jobId,
        }),
      });
      const startData = await startResp.json();
      
      if (!startData.success) {
        throw new Error(startData.error || "Failed to start automation");
      }
      
      const autoId = startData.automation_id;
      
      // Poll for status
      let attempts = 0;
      const maxAttempts = 60; // 60s timeout for demo
      const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
      
      while (attempts < maxAttempts) {
        const statusResp = await apiClient(`/apply-automation/status?automation_id=${autoId}`, {
           method: "GET"
        });
        const status = await statusResp.json();
        
        // Update status for UI
        if (status.step) {
            setAutomationStatus(status.step);
        }

        if (status.status === 'submitted') {
           setAutomationStatus("Application Submitted Successfully!");
           toast.show({
             title: "Application Submitted!",
             description: "The automation agent successfully applied.",
             variant: "success"
           });
           break;
        } else if (status.status === 'error' || status.status === 'manual_review_needed') {
           setAutomationStatus(status.error || "Manual review needed");
           toast.show({
             title: "Automation Ended",
             description: status.error || "Manual review needed.",
             variant: status.status === 'error' ? "error" : "default"
           });
           break;
        }
        
        attempts++;
        await delay(1000);
      }
      
    } catch (e: any) {
      console.error("Auto-apply error:", e);
      setAutomationStatus("Error: " + (e.message || "Failed"));
      toast.show({
        title: "Auto-Apply Failed",
        description: e.message || "Could not start automation agent",
        variant: "error",
      });
    } finally {
        // Keep the success/error message visible for a moment or handle cleanup
        // We might want to reset isAutoApplying after a delay or let the user dismiss
        setTimeout(() => setIsAutoApplying(false), 3000);
    }
  };

  const handleBatchAutoApply = async (jobIds: string[], cvId: string) => {
    try {
      setIsAutoApplying(true);
      setAutomationStatus(`Queuing ${jobIds.length} applications...`);
      
      const result = await applicationsService.autoApply(jobIds, cvId);
      
      if (result.success) {
        toast.show({
          title: "Batch Application Queued",
          description: result.message,
          variant: "success",
        });
      } else {
         throw new Error(result.message || "Failed to queue applications");
      }
    } catch (e: any) {
      console.error("Batch apply failed:", e);
      toast.show({
        title: "Batch Apply Failed",
        description: e.message || "Could not queue applications",
        variant: "error",
      });
    } finally {
      setIsAutoApplying(false);
      setAutomationStatus("");
    }
  };

  const handleCancelApply = async () => {
    try {
      applyCancelledRef.current = true;
      if (currentApplyJobId) {
        await apiClient(`/apply-cancel?job_id=${currentApplyJobId}`, {
          method: "POST",
        });
      }
      toast.show({
        title: "Cancelled",
        description: "Application process cancelled",
        variant: "error",
      });
    } catch (e) {
      console.error("Cancel apply failed", e);
    }
  };

  return {
    applying,
    applyAttempts,
    applyMaxAttempts,
    generatedFiles,
    error,
    setError,
    pendingJob,
    showTemplateDialog,
    setShowTemplateDialog,
    applyTemplate,
    setApplyTemplate,
    handleApply,
    confirmApply,
    handleCancelApply,
    showPreviewDialog,
    setShowPreviewDialog,
    previewData,
    previewLoading,
    previewProgress,
    previewPhase,
    initiatePreview,
    handleAutoApply,
    handleBatchAutoApply,
    isAutoApplying,
    automationStatus
  };
}
