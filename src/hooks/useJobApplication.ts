import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/utils/api";
import { useToast } from "@/components/ui/toast";
import { track } from "@/utils/analytics";
import type { Job } from "./useJobMatching";

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
  const toast = useToast();

  const [applying, setApplying] = useState(false);
  const [applyAttempts, setApplyAttempts] = useState(0);
  const [applyMaxAttempts, setApplyMaxAttempts] = useState(40);
  const [currentApplyJobId, setCurrentApplyJobId] = useState<string | null>(
    null
  );
  const applyCancelledRef = useRef(false);
  const [pendingJob, setPendingJob] = useState<Job | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [applyTemplate, setApplyTemplate] = useState<
    "MODERN" | "PROFESSIONAL" | "ACADEMIC"
  >("MODERN");
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFiles | null>(
    () => loadGeneratedFilesFromStorage()
  );
  const [error, setError] = useState<string>("");
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{
    cvHtml: string;
    coverLetterHtml: string;
    atsScore?: number;
    atsAnalysis?: string;
    jobId?: string; // Add jobId to track which preview job we're looking at
  } | null>(null);
  const [previewProgress, setPreviewProgress] = useState<number>(0);
  
  // Automation State
  const [isAutoApplying, setIsAutoApplying] = useState(false);
  const [automationStatus, setAutomationStatus] = useState<string>("");

  // Persist generatedFiles to localStorage whenever it changes
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
    setApplying(true);
    setError("");
    applyCancelledRef.current = false;
    setGeneratedFiles(null);

    try {
      const start = await apiClient("/apply-job", {
        method: "POST",
        body: JSON.stringify({ job: pendingJob, template: applyTemplate }),
      });
      const startData = await start.json();
      if (!startData.success || !startData.job_id) {
        setError(startData.error || "Failed to start application");
        setApplying(false);
        return;
      }
      const jobId = startData.job_id;
      setCurrentApplyJobId(jobId);
      try {
        track("application_submitted", {
          jobId,
          title: pendingJob.title,
          company: pendingJob.company,
          template: applyTemplate,
        }, "app");
      } catch (_) {}

      let attempts = 0;
      const maxAttempts = 40;
      setApplyMaxAttempts(maxAttempts);
      const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

      while (attempts < maxAttempts) {
        if (applyCancelledRef.current) break;

        const statusResp = await apiClient(`/apply-status?job_id=${jobId}`, {
          method: "GET",
        });
        const statusData = await statusResp.json();

        if (statusData.status === "done" && statusData.files) {
          setGeneratedFiles({
            cv: statusData.files.cv,
            cover_letter: statusData.files.cover_letter,
            interview_prep: statusData.files.interview_prep,
            form_data: statusData.files.form_data,
            jobId: pendingJob.id,
            jobTitle: pendingJob.title,
            generatedAt: new Date().toISOString(),
          });
          track(
            "apply_complete",
            {
              jobId,
              title: pendingJob.title,
              company: pendingJob.company,
              template: applyTemplate,
            },
            "app"
          );
          toast.show({
            title: "Application Ready!",
            description: "Your files have been generated successfully.",
            variant: "success",
          });
          break;
        }
        if (statusData.status === "error") {
          setError(statusData.error || "Application failed");
          break;
        }
        attempts += 1;
        setApplyAttempts(attempts);
        const backoff = Math.min(1000 * Math.pow(1.3, attempts), 5000);
        await delay(backoff);
      }
    } catch (error) {
      console.error("Error applying to job:", error);
      setError("Error submitting application. Please try again.");
    } finally {
      setApplying(false);
      setCurrentApplyJobId(null);
    }
  };

  const initiatePreview = async () => {
    if (!pendingJob) return;
    setShowTemplateDialog(false);
    setShowPreviewDialog(true);
    setPreviewLoading(true);
    setPreviewData(null);
    setPreviewProgress(0);
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

      let attempts = 0;
      const maxAttempts = 180;
      const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

      while (attempts < maxAttempts) {
        const statusResp = await apiClient(`/apply-preview/status?job_id=${jobId}`, {
          method: "GET",
        });
        const statusData = await statusResp.json();

        if (!statusData.success) {
          throw new Error(statusData.error || "Preview status failed");
        }

        setPreviewProgress(statusData.progress ?? 0);

        if (statusData.status === "done" && statusData.result) {
          setPreviewData({
            cvHtml: statusData.result.cv_html,
            coverLetterHtml: statusData.result.cover_letter_html,
            atsScore: statusData.result.ats?.score,
            atsAnalysis: statusData.result.ats?.analysis,
            jobId: jobId, // Store the preview job ID
          });
          break;
        }
        if (statusData.status === "error") {
          throw new Error(statusData.error || "Preview failed");
        }
        attempts += 1;
        const backoff = Math.min(600 + attempts * 150, 2500);
        await delay(backoff);
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
    initiatePreview,
    handleAutoApply,
    isAutoApplying,
    automationStatus
  };
}
