
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
import { Loader2, CheckCircle, FileText, Mail, ExternalLink, Clipboard, PlayCircle, RefreshCw, AlertCircle, Download, Copy, Rocket, BrainCircuit, Sparkles, TrendingUp } from "lucide-react";
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
  strategicAnalysis?: {
    role_type?: string;
    key_requirements?: string[];
    candidate_match_level?: string;
    gap_strategy?: string;
  };
  cvImprovements?: {
    type: string;
    before?: string;
    after?: string;
    reason?: string;
    added?: string;
    context?: string;
  }[];
  applicationAnswers?: Record<string, string>;
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
  atsAnalysis,
  strategicAnalysis,
  cvImprovements,
  applicationAnswers,
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

  const handleCopyAnswer = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      show({
        title: "Copied!",
        description: `Answer for ${key.replace(/_/g, ' ')} copied to clipboard.`,
        variant: "success",
      });
      try {
        track("application_answer_copied", { jobTitle, company, key }, "app");
      } catch (_) {}
    } catch (_) {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Application Strategy
          </DialogTitle>
          <DialogDescription>
            Review the tailored strategy and assets generated for this specific role.
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
            <Tabs defaultValue="strategy" className="h-full flex flex-col">
              <div className="px-6 py-2 border-b bg-muted/20 flex items-center justify-between overflow-x-auto">
                <TabsList>
                  <TabsTrigger value="strategy" className="flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4" />
                    Strategy & Gap Analysis
                  </TabsTrigger>
                  <TabsTrigger value="cv" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Tailored CV
                  </TabsTrigger>
                  <TabsTrigger value="cl" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Cover Letter
                  </TabsTrigger>
                  <TabsTrigger value="copilot" className="flex items-center gap-2">
                    <Rocket className="h-4 w-4" />
                    Smart Apply
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

              <TabsContent value="strategy" className="flex-1 p-0 m-0 overflow-hidden bg-gray-50">
                <ScrollArea className="h-full">
                  <div className="p-6 max-w-4xl mx-auto space-y-6">
                    
                    {/* Hero Strategy Card */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                    <BrainCircuit className="w-5 h-5 text-purple-600" />
                                    Strategic Approach
                                </h3>
                                <p className="text-sm text-gray-500">How the AI tailored your profile for this role</p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Match Confidence</div>
                                <div className="font-bold text-lg text-green-600">
                                    {strategicAnalysis?.candidate_match_level || "High"}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Gap Strategy</h4>
                                <p className="text-gray-900 text-lg leading-relaxed">
                                    {strategicAnalysis?.gap_strategy || atsAnalysis || "Optimized profile by highlighting transferable skills and aligning keywords with the job description."}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                    <h5 className="font-semibold text-blue-800 mb-2">Key Requirements Targeted</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {strategicAnalysis?.key_requirements?.map((req, i) => (
                                            <span key={i} className="bg-white px-2 py-1 rounded text-sm text-blue-700 border border-blue-100 shadow-sm">
                                                {req}
                                            </span>
                                        )) || <span className="text-sm text-blue-600">Standard Role Requirements</span>}
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
                                    <h5 className="font-semibold text-purple-800 mb-2">Role Analysis</h5>
                                    <p className="text-sm text-purple-700">
                                        Identified as <span className="font-bold">{strategicAnalysis?.role_type || jobTitle || "Professional"}</span> role. 
                                        Tailored tone and structure accordingly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Improvements List */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            Key Improvements Made
                        </h3>
                        {cvImprovements && cvImprovements.length > 0 ? (
                            <div className="grid gap-4">
                                {cvImprovements.map((imp, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-lg border shadow-sm flex gap-4">
                                        <div className="mt-1">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-gray-900 capitalize">{imp.type.replace('_', ' ')}</h4>
                                                {imp.context && <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{imp.context}</span>}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{imp.reason}</p>
                                            
                                            {imp.before && imp.after && (
                                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded border">
                                                    <div>
                                                        <span className="text-xs font-bold text-red-500 uppercase">Before</span>
                                                        <p className="text-gray-500 line-through mt-1">{imp.before}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-green-600 uppercase">After</span>
                                                        <p className="text-gray-900 font-medium mt-1">{imp.after}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {imp.added && (
                                                 <div className="mt-2 text-sm">
                                                     <span className="text-green-600 font-medium">+ Added: </span>
                                                     <span className="text-gray-800">{imp.added}</span>
                                                 </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-white border rounded-lg text-gray-500">
                                <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p>No specific improvement tracking available for this version.</p>
                            </div>
                        )}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

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

              <TabsContent value="copilot" className="flex-1 p-0 m-0 overflow-hidden bg-gray-50">
                  <ScrollArea className="h-full p-6">
                      <div className="space-y-6">
                          <div className="bg-white p-6 rounded-lg border shadow-sm">
                              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                  <Rocket className="w-5 h-5 text-purple-600" />
                                  Application Copilot
                              </h3>
                              <p className="text-gray-600 mb-6">
                                  Use these AI-generated answers to speed up your application. 
                                  Click the copy button to grab the text, then paste it into the job application form.
                              </p>
                              
                              <div className="grid gap-4">
                                  {applicationAnswers && Object.entries(applicationAnswers).map(([key, value]) => (
                                      <div key={key} className="p-4 rounded-md bg-gray-50 border group hover:border-blue-300 transition-colors">
                                          <div className="flex items-center justify-between mb-2">
                                              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                                  {key.replace(/_/g, ' ')}
                                              </span>
                                              <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  className="h-8 w-8 p-0 opacity-100 transition-opacity"
                                                  onClick={() => handleCopyAnswer(value, key)}
                                                  title="Copy to clipboard"
                                              >
                                                  <Copy className="h-4 w-4" />
                                              </Button>
                                          </div>
                                          <p className="text-gray-900 whitespace-pre-wrap text-sm">{value}</p>
                                      </div>
                                  ))}
                                  
                                  {(!applicationAnswers || Object.keys(applicationAnswers).length === 0) && (
                                      <div className="text-center py-8 text-gray-500 italic">
                                          No smart answers generated for this application.
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  </ScrollArea>
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
