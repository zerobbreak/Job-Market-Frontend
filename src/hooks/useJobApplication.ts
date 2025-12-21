import { useState, useRef } from "react";
import { apiClient } from "@/utils/api";
import { useToast } from "@/components/ui/toast";
import { track } from "@/utils/analytics";
import type { Job } from "./useJobMatching";

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
  const [generatedFiles, setGeneratedFiles] = useState<{
    cv: string;
    cover_letter: string;
    interview_prep?: string;
  } | null>(null);
  const [error, setError] = useState<string>("");

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
  };
}
