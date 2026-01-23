import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  Sparkles,
  FileText,
  Download,
  Mail,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OutletContextType } from "@/components/layout/RootLayout";
import { useCVStore } from "@/stores/cvStore";
import { apiClient } from "@/utils/api";

/** Mock suggested change */
const MOCK_SUGGESTED_CHANGE = {
  section: "SUMMARY",
  from: "Cloud Infrastructure",
  to: "High-Concurrency Distributed Architectures",
};

interface CVEditorViewProps {
  profile: OutletContextType["profile"];
}

function RegenerateButton({ navigate }: { navigate: (path: string) => void }) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { updatePersonalInfo } = useCVStore();

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      
      const response = await apiClient("/regenerate-cv", {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to regenerate CV");
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update CV store with optimized summary if available
        if (data.optimized_cv) {
          // Extract summary from optimized CV
          const summaryMatch = data.optimized_cv.match(/##\s*SUMMARY\s*\n([^\n]+(?:\n[^\n]+)*?)(?=\n##|\n\n\n|$)/i) ||
                            data.optimized_cv.match(/##\s*PROFESSIONAL\s+SUMMARY\s*\n([^\n]+(?:\n[^\n]+)*?)(?=\n##|\n\n\n|$)/i);
          if (summaryMatch) {
            const optimizedSummary = summaryMatch[1].trim();
            updatePersonalInfo({ summary: optimizedSummary });
          }
        }
        
        // Show success message
        const message = data.message || 
          `Injected ${data.keyword_matches?.length || 0} keywords and improved ATS score to ${data.ats_score || 'N/A'}.`;
        
        alert(`CV optimized successfully!\n\n${message}`);
        
        // Navigate to CV editor to see changes
        navigate("/cv-editor");
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error: any) {
      console.error("Error regenerating CV:", error);
      alert(`Error: ${error.message || 'Failed to regenerate CV'}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Button
      className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white disabled:opacity-50"
      onClick={handleRegenerate}
      disabled={isRegenerating}
    >
      {isRegenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Regenerating...
        </>
      ) : (
        "Regenerate with AI"
      )}
    </Button>
  );
}

export function CVEditorView({ profile }: CVEditorViewProps) {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const { data: cvData } = useCVStore();
  const [subTab, setSubTab] = useState<"ai" | "original">("ai");

  const name = cvData.personalInfo.fullName || profile?.name || "—";
  const email = profile?.email || cvData.personalInfo.email || "";
  const phone = profile?.phone || cvData.personalInfo.phone || "";
  const location = profile?.location || cvData.personalInfo.address || "";
  const jobTitle =
    cvData.personalInfo.jobTitle || profile?.experience_level || "";
  const summary =
    cvData.personalInfo.summary || profile?.career_goals || profile?.strengths?.join(". ") || "";
  const skills = profile?.skills?.length
    ? profile.skills
    : cvData.skills.map((s) => s.name).filter(Boolean);
  const linkedin = cvData.personalInfo.linkedin || "";
  const github = cvData.personalInfo.github || "";
  const website = cvData.personalInfo.website || "";

  const enhancedSummary = subTab === "ai" && summary
    ? summary.replace(
        /cloud infrastructure|distributed systems/gi,
        (m) => `**${m}**`
      )
    : summary;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${name.replace(/\s+/g, "_")}_CV`,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-white">
          AI-Enhanced Document Editor
        </h2>
        <div className="flex items-center gap-3">
          <Tabs
            value={subTab}
            onValueChange={(v) => setSubTab(v as "ai" | "original")}
          >
            <TabsList className="bg-[#1e1e36] border border-white/10 p-0.5 h-9">
              <TabsTrigger
                value="ai"
                className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white rounded-lg px-4"
              >
                AI Enhanced
              </TabsTrigger>
              <TabsTrigger
                value="original"
                className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white rounded-lg px-4 text-zinc-400"
              >
                Original
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            onClick={() => handlePrint?.()}
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white gap-2"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* CV display */}
        <div className="lg:col-span-2">
          <Card className="border-white/10 bg-[#1e1e36] overflow-hidden">
            <CardContent className="p-6">
              <div ref={printRef} className="print:bg-white print:text-black">
                <h1 className="text-2xl font-bold text-white print:text-black uppercase tracking-tight mb-1">
                  {name}
                </h1>
                <p className="text-[#3b82f6] print:text-blue-700 font-semibold uppercase tracking-wide text-sm mb-4">
                  {jobTitle || "Professional"}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400 print:text-gray-600 mb-6">
                  {location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {location}
                    </span>
                  )}
                  {email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {email}
                    </span>
                  )}
                  {phone && (
                    <span className="flex items-center gap-1.5">
                      {phone}
                    </span>
                  )}
                  {linkedin && (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-[#3b82f6]"
                    >
                      <Linkedin className="h-3.5 w-3.5" />
                      LinkedIn
                    </a>
                  )}
                  {github && (
                    <a
                      href={github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-[#3b82f6]"
                    >
                      <Github className="h-3.5 w-3.5" />
                      GitHub
                    </a>
                  )}
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-[#3b82f6]"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Portfolio
                    </a>
                  )}
                </div>
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Strategic Profile
                  </h3>
                  <p className="text-sm text-zinc-300 print:text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {enhancedSummary ? (
                      <>
                        {enhancedSummary.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                          i % 2 === 1 ? (
                            <span
                              key={i}
                              className="text-[#3b82f6] print:text-blue-700 font-medium"
                            >
                              {part}
                            </span>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )}
                      </>
                    ) : (
                      "Add a summary in the CV editor or upload a CV."
                    )}
                  </p>
                </div>
                {skills.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      Core Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-zinc-400 print:bg-gray-100 print:text-gray-800"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right panels */}
        <div className="space-y-4">
          <Card className="border-white/10 bg-[#1e1e36]">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-[#a78bfa]" />
                Smart Improvements
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                We&apos;ve injected <strong className="text-white">12 keywords</strong> and
                reframed your experience to match 2025 Principal Engineer hiring
                trends.
              </p>
              <RegenerateButton navigate={navigate} />
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[#1e1e36]">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-[#a78bfa]" />
                Suggested Changes
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-zinc-400">
                  <span className="font-medium text-white">
                    {MOCK_SUGGESTED_CHANGE.section}:
                  </span>{" "}
                  Reframed from &ldquo;{MOCK_SUGGESTED_CHANGE.from}&rdquo; to
                  &ldquo;
                  <span className="text-[#a78bfa]">
                    {MOCK_SUGGESTED_CHANGE.to}
                  </span>
                  &rdquo;.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
