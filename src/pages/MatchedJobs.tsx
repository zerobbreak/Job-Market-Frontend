import React, { useState, useEffect, Suspense, useRef } from "react";
import { Loader2, Briefcase, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/utils/api";
import { useOutletContext } from "react-router-dom";
import type { OutletContextType } from "@/components/layout/RootLayout";
import { track } from "@/utils/analytics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "@/components/ui/label";

// Import MatchedResults lazily as done in Dashboard
const MatchedResults = React.lazy(() => import("@/components/MatchedResults"));

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
}

interface MatchedJob {
  job: Job;
  match_score: number;
  match_reasons: string[];
}

export default function MatchedJobs() {
  const { profile } = useOutletContext<OutletContextType>();
  const toast = useToast();

  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [location, setLocation] = useState("South Africa");
  const [useDemoJobs, setUseDemoJobs] = useState(false);

  // Filtering state for matches
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDescription, setManualDescription] = useState("");

  // Application state
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

  // New state to track generated files to show success
  const [generatedFiles, setGeneratedFiles] = useState<{
    cv: string;
    cover_letter: string;
    interview_prep?: string;
  } | null>(null);

  // Load cached matches from localStorage on mount
  useEffect(() => {
    const loadCachedMatches = () => {
      try {
        const cachedData = localStorage.getItem("matchedJobs");
        const cachedLocation = localStorage.getItem("matchedJobsLocation");

        if (cachedData && cachedLocation === location) {
          const parsed = JSON.parse(cachedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMatchedJobs(parsed);
            console.log("Loaded cached matches:", parsed.length);
          }
        }
      } catch (e) {
        console.error("Error loading cached matches:", e);
      }
    };

    loadCachedMatches();
  }, []); // Only run once on mount

  // Save matches to localStorage whenever they change
  useEffect(() => {
    if (matchedJobs.length > 0) {
      try {
        localStorage.setItem("matchedJobs", JSON.stringify(matchedJobs));
        localStorage.setItem("matchedJobsLocation", location);
        console.log("Cached matches:", matchedJobs.length);
      } catch (e) {
        console.error("Error caching matches:", e);
      }
    }
  }, [matchedJobs, location]);

  const findMatches = async () => {
    setLoading(true);
    setError("");
    setMatchedJobs([]); // Clear current matches

    try {
      const response = await apiClient("/match-jobs", {
        method: "POST",
        body: JSON.stringify({
          location: location,
          max_results: 20,
          use_demo: useDemoJobs,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMatchedJobs(data.matches || []);
        track(
          "matches_search",
          {
            location,
            count: (data.matches || []).length,
            use_demo: useDemoJobs,
          },
          "app"
        );
      } else {
        setError(data.error || "Failed to find matches");
      }
    } catch (err) {
      setError("Error finding job matches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const filteredMatchedJobs = matchedJobs.filter(
    (match) => match.match_score >= minMatchScore
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            Matched Jobs
          </h1>
          <p className="text-muted-foreground">
            Jobs tailored to your skills and experience.{" "}
            {profile ? "" : "Upload a CV to see matches."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={findMatches} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Briefcase className="mr-2 h-4 w-4" />
            )}
            {loading ? "Searching..." : "Find Matches"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive/20 text-destructive-foreground px-4 py-3 rounded-xl animate-fade-in">
          {error}
        </div>
      )}

      {applying && (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 px-4 py-3 rounded-xl flex items-center justify-between animate-fade-in p-6 shadow-lg shadow-blue-500/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">
                Generating Application...
              </h3>
              <p className="text-sm text-blue-300">
                Tailoring your CV and writing a cover letter (
                {Math.min(
                  100,
                  Math.round((applyAttempts / applyMaxAttempts) * 100)
                )}
                %)
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelApply}
            className="hover:bg-blue-100 border-blue-300"
          >
            Cancel
          </Button>
        </div>
      )}

      {generatedFiles && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3 rounded-xl flex items-center gap-4 animate-fade-in p-6">
          <div className="p-3 bg-green-500/20 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-green-100">
              Application Generated!
            </h3>
            <p className="text-sm text-green-300">
              Your tailored CV and cover letter are ready. Check 'Applications'
              to view them.
            </p>
          </div>
        </div>
      )}

      {/* Results Area */}
      <div className="min-h-[400px]">
        {loading && (
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
        )}

        {!loading && matchedJobs.length === 0 && (
          <div className="text-center py-20 text-muted-foreground bg-muted/30 rounded-2xl border border-border">
            <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-10" />
            <h3 className="text-lg font-medium">No matches found yet</h3>
            <p>Click "Find Matches" to search based on your profile.</p>
          </div>
        )}

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
              useDemoJobs={useDemoJobs}
              setUseDemoJobs={setUseDemoJobs}
              location={location}
              setLocation={setLocation}
              manualTitle={manualTitle}
              setManualTitle={setManualTitle}
              manualDescription={manualDescription}
              setManualDescription={setManualDescription}
              findMatches={findMatches}
              handleApply={handleApply}
            />
          </Suspense>
        )}
      </div>

      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Choose Application Template</DialogTitle>
            <DialogDescription>
              Select a style for your tailored CV and cover letter.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template" className="text-right">
                Template
              </Label>
              <Select
                value={applyTemplate}
                onValueChange={(v: any) => setApplyTemplate(v)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MODERN">Modern (Recommended)</SelectItem>
                  <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                  <SelectItem value="ACADEMIC">Academic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTemplateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmApply}>Generate Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
