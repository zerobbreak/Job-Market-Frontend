
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle, FileText, Mail, ExternalLink, Clipboard, PlayCircle, RefreshCw, AlertCircle, Download } from "lucide-react";
import { track } from "@/utils/analytics";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/utils/api";

interface ApplicationPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  progress?: number;
  phase?: string;
  jobUrl?: string;
  jobTitle?: string;
  company?: string;
  autoFillData?: string;
  cvHtml: string;
  coverLetterHtml: string;
  atsScore?: number;
  atsAnalysis?: string;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
  onAutoApply?: () => void;
  onRetry?: () => void;
  isAutoApplying?: boolean;
  automationStatus?: string;
  previewJobId?: string;
}

export function ApplicationPreviewDialog({
  open,
  onOpenChange,
  loading,
  progress = 0,
  phase = "",
  jobUrl,
  jobTitle,
  company,
  autoFillData,
  cvHtml,
  coverLetterHtml,
  atsScore,
  error,
  onConfirm,
  onCancel,
  onAutoApply,
  onRetry,
  isAutoApplying = false,
  automationStatus = "",
  previewJobId,
}: ApplicationPreviewDialogProps) {
  const { show } = useToast();

  const handleOpenJobPage = () => {
    if (jobUrl) {
      try {
        track("application_started", { jobUrl, jobTitle, company }, "app");
      } catch (_) {}
      window.open(jobUrl, "_blank");
    }
  };

  const handleCopyAutoFill = async () => {
    if (!autoFillData) return;
    try {
      await navigator.clipboard.writeText(autoFillData);
      try {
        track("application_autofill_copied", { jobTitle, company }, "app");
      } catch (_) {}
    } catch (_) {}
  };

  const handleDownload = async (type: 'cv' | 'cover_letter') => {
    if (!previewJobId) return;
    
    try {
        // Industry Standard: Generate Signed URL (AWS S3/Cloudflare R2 Pattern)
        // This is the battle-tested approach used by major cloud providers
        const fileType = type === 'cv' ? 'preview_cv' : 'preview_cover_letter';
        
        const signedUrlResponse = await apiClient('/files/signed-url', {
            method: 'POST',
            body: JSON.stringify({
                file_id: previewJobId,
                bucket_id: 'preview', // Placeholder for preview files
                file_type: fileType,
                expires_in: 3600 // 1 hour
            })
        });
        
        if (!signedUrlResponse.ok) {
            const errorData = await signedUrlResponse.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to generate download URL");
        }
        
        const { url } = await signedUrlResponse.json();
        
        // Trigger Native Browser Download using Signed URL
        // Signed URLs work directly without authentication headers, perfect for browser downloads
        window.location.href = url;
        
        show({
            title: "Download Started",
            description: `Your ${type === 'cv' ? 'CV' : 'Cover Letter'} is being prepared.`,
            variant: "success",
        });

    } catch (err) {
        console.error("Download error:", err);
        show({
            title: "Download Failed",
            description: err instanceof Error ? err.message : "Could not generate download URL. Please try again.",
            variant: "error",
        });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Review Application Package</DialogTitle>
          <DialogDescription>
            Review your AI-generated CV and Cover Letter before applying.
          </DialogDescription>
          <div className="mt-3 flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleOpenJobPage} disabled={!jobUrl}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Job Page
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyAutoFill} disabled={!autoFillData}>
              <Clipboard className="h-4 w-4 mr-2" />
              Copy Auto-Fill Data
            </Button>
            {onAutoApply && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onAutoApply} 
                disabled={isAutoApplying}
                className={`border-purple-500 text-purple-600 hover:bg-purple-50 ${isAutoApplying ? 'animate-pulse' : ''}`}
              >
                {isAutoApplying ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {automationStatus || "Auto-Applying..."}
                    </>
                ) : (
                    <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Auto-Apply (Beta)
                    </>
                )}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {phase || "Generating preview..."}
              </p>
              <div className="mt-4 w-full max-w-md">
                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-3 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {phase || "Processing..."}
                  </span>
                  <span className="font-semibold text-blue-600">
                    {Math.round(Math.max(0, Math.min(100, progress)))}%
                  </span>
                </div>
                {/* Progress phases indicator */}
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {[10, 25, 50, 75, 100].map((milestone) => (
                    <div
                      key={milestone}
                      className={`h-1 rounded-full transition-colors ${
                        progress >= milestone
                          ? "bg-blue-500"
                          : "bg-gray-200"
                      }`}
                      title={`${milestone}%`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : error || (!cvHtml && !loading) ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50">
                 <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                 <h3 className="text-xl font-semibold text-gray-900 mb-2">Generation Failed</h3>
                 <p className="text-gray-600 max-w-md mb-6">{error || "Preview content is missing or invalid."}</p>
                 {onRetry && (
                     <Button onClick={onRetry}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry Generation
                     </Button>
                 )}
            </div>
          ) : (
            <Tabs defaultValue="cv" className="h-full flex flex-col">
              <div className="px-6 py-2 border-b bg-muted/20 flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="cv" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CV / Resume
                  </TabsTrigger>
                  <TabsTrigger value="cl" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Cover Letter
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-4">
                  {previewJobId && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleDownload('cv')} title="Download CV PDF">
                            <Download className="h-4 w-4 mr-1" /> CV
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload('cover_letter')} title="Download Cover Letter PDF">
                            <Download className="h-4 w-4 mr-1" /> CL
                        </Button>
                      </div>
                  )}
                  {atsScore !== undefined && (
                    <div className="flex items-center gap-2 text-sm border-l pl-4">
                      <span className="text-muted-foreground">ATS Score:</span>
                      <span
                        className={`font-bold ${
                          atsScore >= 80
                            ? "text-green-600"
                            : atsScore >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {atsScore}/100
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <TabsContent value="cv" className="flex-1 p-0 m-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <iframe
                    className="w-full h-full bg-white"
                    srcDoc={cvHtml || "<html><body><div style='padding:2rem;font-family:sans-serif;color:#111'>No preview content</div></body></html>"}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="cl" className="flex-1 p-0 m-0 overflow-hidden">
                <div className="border rounded-md bg-white h-[600px] w-full overflow-hidden relative">
                     {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                             <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                             <p className="text-lg font-medium text-gray-700">Generating Cover Letter...</p>
                        </div>
                    ) : error ? (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-center p-8">
                             <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                             <h3 className="text-xl font-semibold text-gray-900 mb-2">Generation Failed</h3>
                             <p className="text-gray-600 max-w-md mb-6">{error}</p>
                             {onRetry && (
                                <Button onClick={onRetry}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                             )}
                        </div>
                    ) : (
                        <iframe 
                            srcDoc={coverLetterHtml || "<html><body><div style='padding:2rem;font-family:sans-serif;color:#666'>No cover letter generated</div></body></html>"}
                            className="w-full h-full border-none"
                            title="Cover Letter Preview"
                        />
                    )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/10">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Back to Edit
          </Button>
          <Button onClick={onConfirm} disabled={loading} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Confirm & Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
