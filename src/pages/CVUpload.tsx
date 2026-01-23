import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Loader2,
  CheckCircle,
  FileText,
  Briefcase,
  Trash2,
  Search,
  ArrowRight,
  AlertCircle,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CardSkeleton } from "@/components/ui/loading";
import { apiClient } from "@/utils/api";

import { useOutletContext } from "react-router-dom";
import { storage, BUCKET_ID_CVS } from "@/utils/appwrite";
import type { OutletContextType } from "@/components/layout/RootLayout";
import { track } from "@/utils/analytics";
import { clearMatchedJobsCache } from "@/hooks/useMatchedJobsCache";

interface CVStatus {
  fileId: string;
  filename: string;
  uploadedAt: string;
  analyzed: boolean;
  matchingStatus: "idle" | "searching" | "completed" | "error";
  matchCount?: number;
  profile?: any;
  isActive?: boolean;
}

export default function CVUpload() {
  const { setProfile } = useOutletContext<OutletContextType>();
  const toast = useToast();
  const navigate = useNavigate();

  const [cvList, setCvList] = useState<CVStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    fileId: string | null;
  }>({ open: false, fileId: null });
  const [replaceDialog, setReplaceDialog] = useState<{
    open: boolean;
    file: File | null;
    filename: string;
  }>({ open: false, file: null, filename: "" });

  useEffect(() => {
    loadCVList();
  }, []);

  const loadCVList = async () => {
    try {
      setLoading(true);

      // Fetch from database instead of storage to match backend logic
      // Backend route is /api/list (no /profile prefix)
      const response = await apiClient("/list", {
        method: "GET",
      });

      const data = await response.json();

      if (data.success && data.profiles) {
        const cvStatuses: CVStatus[] = data.profiles.map((prof: any) => ({
          fileId: prof.$id, // Use Profile ID for deletion
          filename: prof.cv_filename || "CV.pdf",
          uploadedAt: prof.$updatedAt || prof.$createdAt,
          analyzed: true, // If in database, it's analyzed
          matchingStatus: "idle",
          isActive: prof.is_active || false,
        }));

        // Sort: Active first, then by date desc
        cvStatuses.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        });

        setCvList(cvStatuses);
      } else {
        setCvList([]);
      }
    } catch (e) {
      console.error("Error loading CV list:", e);
      setCvList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCVUpload = async (
    eventOrFile: React.ChangeEvent<HTMLInputElement> | File,
    overwrite = false,
    retryCount = 0
  ) => {
    const file =
      eventOrFile instanceof File ? eventOrFile : eventOrFile.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf("."));

    if (file.size > MAX_SIZE) {
      setError("File is too large. Max 10MB.");
      toast.show({
        title: "Upload failed",
        description: `File size: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum allowed: 10MB.`,
        variant: "error",
      });
      return;
    }

    if (
      !ALLOWED_TYPES.includes(file.type) &&
      !allowedExtensions.includes(fileExt)
    ) {
      setError("Invalid file type. Only PDF, DOC, and DOCX files are allowed.");
      toast.show({
        title: "Upload failed",
        description: "Please upload a PDF, DOC, or DOCX file.",
        variant: "error",
      });
      return;
    }

    setError("");
    setUploading(true);

    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    try {
      const formData = new FormData();
      formData.append("cv", file);
      if (overwrite) {
        formData.append("overwrite", "true");
      }

      // Backend route is /api/analyze-cv (still correct, no /profile prefix)
      const response = await apiClient("/analyze-cv", {
        method: "POST",
        body: formData,
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Server error: ${response.status}`,
        }));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setProfile(data.profile);

        // Clear matched jobs cache to prevent showing stale results
        clearMatchedJobsCache();

        track("cv_uploaded", { filename: file.name, idempotent: data.idempotent }, "cv_upload");
        
        toast.show({
          title: data.idempotent ? "CV restored" : "CV analyzed",
          description: data.message || data.idempotent 
            ? "Your existing CV profile has been restored."
            : "Your profile has been updated.",
          variant: "success",
        });
        loadCVList(); // Refresh the list
        
        // Reset file input
        const fileInput = document.getElementById("cv-upload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        // Handle specific error cases
        const errorMsg = data.error || "Failed to analyze CV";
        setError(errorMsg);
        toast.show({
          title: "Upload failed",
          description: errorMsg,
          variant: "error",
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || "Error uploading CV. Please try again.";
      
      // Retry logic for network errors
      if (retryCount < MAX_RETRIES && (
        errorMessage.includes("network") ||
        errorMessage.includes("fetch") ||
        errorMessage.includes("timeout") ||
        err.name === "TypeError"
      )) {
        console.log(`Retrying upload (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        setUploading(false);
        setTimeout(() => {
          handleCVUpload(eventOrFile, overwrite, retryCount + 1);
        }, RETRY_DELAY * (retryCount + 1)); // Exponential backoff
        return;
      }

      setError(errorMessage);
      toast.show({
        title: "Upload failed",
        description: retryCount >= MAX_RETRIES
          ? "Upload failed after multiple attempts. Please check your connection and try again."
          : errorMessage,
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFindMatches = async (cvStatus: CVStatus) => {
    // Update status to searching
    setCvList((prev) =>
      prev.map((cv) =>
        cv.fileId === cvStatus.fileId
          ? { ...cv, matchingStatus: "searching" }
          : cv
      )
    );

    try {
      const response = await apiClient("/match-jobs", {
        method: "POST",
        body: JSON.stringify({
          location: "South Africa",
          max_results: 20,
          min_score: 0.0,
          force_refresh: true, // Force fresh search after CV upload
        }),
      });

      // Handle 429 status (duplicate request)
      if (response.status === 429) {
        await response.json();
        setCvList((prev) =>
          prev.map((cv) =>
            cv.fileId === cvStatus.fileId
              ? { ...cv, matchingStatus: "error", error: "Search already in progress. Please wait." }
              : cv
          )
        );
        return;
      }

      const data = await response.json();

      if (data.success && data.matches) {
        const matchCount = data.matches.length;

        // Save matches to localStorage for the Job Matches page
        localStorage.setItem("matchedJobs", JSON.stringify(data.matches));
        localStorage.setItem("matchedJobsLocation", "South Africa");

        // Update status to completed
        setCvList((prev) =>
          prev.map((cv) =>
            cv.fileId === cvStatus.fileId
              ? { ...cv, matchingStatus: "completed", matchCount }
              : cv
          )
        );

        toast.show({
          title: "Matches found!",
          description: `Found ${matchCount} matching jobs. Redirecting...`,
          variant: "success",
        });

        // Navigate to job matches page after a short delay
        setTimeout(() => {
          navigate("/job-matches");
        }, 1000);
      } else {
        setCvList((prev) =>
          prev.map((cv) =>
            cv.fileId === cvStatus.fileId
              ? { ...cv, matchingStatus: "error" }
              : cv
          )
        );
        toast.show({
          title: "Search failed",
          description:
            data.error || "Failed to find matches. Please try again.",
          variant: "error",
        });
      }
    } catch (err: any) {
      console.error("Error finding matches:", err);
      setCvList((prev) =>
        prev.map((cv) =>
          cv.fileId === cvStatus.fileId
            ? { ...cv, matchingStatus: "error" }
            : cv
        )
      );
      toast.show({
        title: "Search failed",
        description: "Error finding matches",
        variant: "error",
      });
    }
  };

  const handleSetActive = async (fileId: string) => {
    try {
      await apiClient(`/profile/${fileId}/active`, {
        method: 'PUT'
      });
      
      toast.show({
        title: "Active CV Updated",
        description: "Your active CV has been updated.",
        variant: "success",
      });
      
      loadCVList();
    } catch (e) {
      console.error("Error setting active CV:", e);
      toast.show({
        title: "Update failed",
        description: "Failed to set active CV.",
        variant: "error",
      });
    }
  };

  const handleDeleteCV = async (fileId: string) => {
    setDeleteDialog({ open: true, fileId });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.fileId) return;

    try {
      // Use backend API to delete both storage file and database record
      await apiClient(`/profile/${deleteDialog.fileId}`, {
        method: "DELETE",
      });

      toast.show({
        title: "CV deleted",
        description: "CV has been removed.",
        variant: "success",
      });
      loadCVList();
    } catch (error) {
      console.error("Error deleting CV:", error);
      toast.show({
        title: "Delete failed",
        description: "Could not delete CV.",
        variant: "error",
      });
    } finally {
      setDeleteDialog({ open: false, fileId: null });
    }
  };

  const confirmReplace = async () => {
    if (!replaceDialog.file) return;

    setReplaceDialog({ open: false, file: null, filename: "" });
    await handleCVUpload(replaceDialog.file, true);
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleViewCV = async (_fileId: string, url: string) => {
    try {
        // Verify file exists before opening
        const response = await fetch(url, { method: 'HEAD' });
        if (response.status === 404) {
             toast.show({
                title: "File Not Found",
                description: "This CV file seems to be missing. Please delete this entry and upload again.",
                variant: "error",
             });
             return;
        }
        window.open(url, '_blank');
    } catch (e) {
        // Network error or CORS might block HEAD, try opening anyway as fallback
        window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            CV Upload & Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload your resume to get AI-powered insights and job matches
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive/20 text-destructive-foreground px-4 py-3 rounded-xl animate-fade-in flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Upload Section */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <label
            htmlFor="cv-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-4 bg-muted rounded-full group-hover:bg-blue-500/10 transition-colors">
                {uploading ? (
                  <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground group-hover:text-blue-400" />
                )}
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground group-hover:text-blue-400">
                  {uploading ? "Uploading..." : "Upload New CV"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, DOC, or DOCX (Max 10MB)
                </p>
              </div>
            </div>
            <input
              id="cv-upload"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleCVUpload}
              disabled={uploading}
            />
          </label>
        </CardContent>
      </Card>

      {/* CV List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            Your CVs ({cvList.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} lines={2} />
            ))}
          </div>
        ) : cvList.length === 0 ? (
          <Card className="border-border bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground text-center">
                No CVs uploaded yet. Upload your first CV to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {cvList.map((cv) => (
              <Card
                key={cv.fileId}
                className="border-border bg-card/50 backdrop-blur-sm hover:border-blue-500/30 transition-all group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="p-3 bg-blue-500/10 rounded-xl shrink-0">
                        <FileText className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleViewCV(cv.fileId, storage.getFileView(BUCKET_ID_CVS, cv.fileId).toString());
                              }}
                              className="hover:text-blue-400 hover:underline transition-colors text-left"
                            >
                              {cv.filename}
                            </button>
                          </CardTitle>
                        <CardDescription className="mt-1">
                          Uploaded {formatDate(cv.uploadedAt)}
                        </CardDescription>

                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {cv.isActive && (
                            <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/50">
                                <Star className="h-3 w-3 mr-1 fill-blue-400" />
                                Active
                            </Badge>
                          )}
                          {cv.analyzed ? (
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Analyzed
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Analyzing...
                            </Badge>
                          )}

                          {cv.matchingStatus === "searching" && (
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse">
                              <Search className="h-3 w-3 mr-1 animate-spin" />
                              Finding matches...
                            </Badge>
                          )}

                          {cv.matchingStatus === "completed" && (
                            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {cv.matchCount} matches found
                            </Badge>
                          )}

                          {cv.matchingStatus === "error" && (
                            <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Search failed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 shrink-0">
                      {!cv.isActive && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSetActive(cv.fileId)}
                            className="hover:text-blue-400 hover:bg-blue-500/10"
                            title="Set as Active CV"
                        >
                            <Star className="h-4 w-4" />
                        </Button>
                      )}

                      {cv.analyzed && cv.matchingStatus === "idle" && (
                        <Button
                          size="sm"
                          onClick={() => handleFindMatches(cv)}
                          className="gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Search className="h-4 w-4" />
                          Find Matches
                        </Button>
                      )}

                      {cv.matchingStatus === "completed" && (
                        <Button
                          size="sm"
                          onClick={() => navigate("/job-matches")}
                          className="gap-2"
                        >
                          View Matches
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCV(cv.fileId)}
                        className="hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, fileId: null })}
        title="Delete CV?"
        description="Are you sure you want to delete this CV? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
      />

      <ConfirmDialog
        open={replaceDialog.open}
        onOpenChange={(open) =>
          setReplaceDialog({ open, file: null, filename: "" })
        }
        title="Replace CV?"
        description={`A CV named "${replaceDialog.filename}" already exists. Do you want to replace it with the new file?`}
        confirmText="Replace"
        cancelText="Cancel"
        onConfirm={confirmReplace}
      />
    </div>
  );
}
