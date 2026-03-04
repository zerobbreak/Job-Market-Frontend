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

      const response = await apiClient("/profiles/cv/regenerate", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to regenerate CV");
      }

      const data = await response.json();

      if (data.success) {
        // Update CV store with optimized summary if available
        if (data.optimized_cv) {
          // Extract summary from optimized CV
          const summaryMatch =
            data.optimized_cv.match(
              /##\s*SUMMARY\s*\n([^\n]+(?:\n[^\n]+)*?)(?=\n##|\n\n\n|$)/i,
            ) ||
            data.optimized_cv.match(
              /##\s*PROFESSIONAL\s+SUMMARY\s*\n([^\n]+(?:\n[^\n]+)*?)(?=\n##|\n\n\n|$)/i,
            );
          if (summaryMatch) {
            const optimizedSummary = summaryMatch[1].trim();
            updatePersonalInfo({ summary: optimizedSummary });
          }
        }

        // Show success message
        const message =
          data.message ||
          `Injected ${data.keyword_matches?.length || 0} keywords and improved ATS score to ${data.ats_score || "N/A"}.`;

        alert(`CV optimized successfully!\n\n${message}`);

        // Navigate to CV editor to see changes
        navigate("/cv-editor");
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error: any) {
      console.error("Error regenerating CV:", error);
      alert(`Error: ${error.message || "Failed to regenerate CV"}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Button
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
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
    cvData.personalInfo.summary ||
    profile?.career_goals ||
    profile?.strengths?.join(". ") ||
    "";
  const skills = profile?.skills?.length
    ? profile.skills
    : cvData.skills.map((s) => s.name).filter(Boolean);
  const linkedin = cvData.personalInfo.linkedin || "";
  const github = cvData.personalInfo.github || "";
  const website = cvData.personalInfo.website || "";

  const enhancedSummary =
    subTab === "ai" && summary
      ? summary.replace(
          /cloud infrastructure|distributed systems/gi,
          (m) => `**${m}**`,
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
            <TabsList className="bg-card/50 border border-border p-1 h-11 rounded-lg backdrop-blur-sm">
              <TabsTrigger
                value="ai"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-4 font-medium transition-all h-full"
              >
                AI Enhanced
              </TabsTrigger>
              <TabsTrigger
                value="original"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-4 text-muted-foreground font-medium transition-all h-full"
              >
                Original
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            onClick={() => handlePrint?.()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-11 px-6 rounded-lg"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* CV display */}
        <div className="lg:col-span-2">
          <div className="glass-panel border-border/50 rounded-3xl overflow-hidden relative shadow-2xl">
            <div className="p-8 md:p-12">
              <div ref={printRef} className="print:bg-white print:text-black">
                <h1 className="text-3xl md:text-5xl font-bold text-white print:text-black uppercase tracking-tight mb-2">
                  {name}
                </h1>
                <p className="text-primary print:text-blue-700 font-semibold uppercase tracking-wide text-sm md:text-base mb-6">
                  {jobTitle || "Professional"}
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground print:text-gray-600 mb-10">
                  {location && (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {location}
                    </span>
                  )}
                  {email && (
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      {email}
                    </span>
                  )}
                  {phone && (
                    <span className="flex items-center gap-2">{phone}</span>
                  )}
                  {linkedin && (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {github && (
                    <a
                      href={github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      Portfolio
                    </a>
                  )}
                </div>
                <div className="mb-10">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-8 h-px bg-border/50"></span>
                    Strategic Profile
                  </h3>
                  <p className="text-base text-zinc-300 print:text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {enhancedSummary ? (
                      <>
                        {enhancedSummary
                          .split(/\*\*(.*?)\*\*/g)
                          .map((part, i) =>
                            i % 2 === 1 ? (
                              <span
                                key={i}
                                className="text-primary print:text-blue-700 font-bold bg-primary/10 px-1 rounded"
                              >
                                {part}
                              </span>
                            ) : (
                              <span key={i}>{part}</span>
                            ),
                          )}
                      </>
                    ) : (
                      "Add a summary in the CV editor or upload a CV."
                    )}
                  </p>
                </div>
                {skills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2 mt-8">
                      <span className="w-8 h-px bg-border/50"></span>
                      Core Skills
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                      {skills.map((s, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 text-zinc-300 border border-white/5 print:bg-gray-100 print:text-gray-800 print:border-gray-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right panels */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border-transparent">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-accent/20">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              Smart Improvements
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              We&apos;ve injected{" "}
              <strong className="text-white font-semibold">12 keywords</strong>{" "}
              and reframed your experience to match 2025 Principal Engineer
              hiring trends.
            </p>
            <RegenerateButton navigate={navigate} />
          </div>
          <div className="glass-card rounded-3xl p-6 border-transparent">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-primary/20">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              Suggested Changes
            </h3>
            <div className="space-y-4 text-sm mt-2">
              <p className="text-muted-foreground leading-relaxed p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="font-semibold text-white uppercase tracking-wider text-xs block mb-2">
                  {MOCK_SUGGESTED_CHANGE.section}
                </span>
                Reframed from{" "}
                <span className="line-through opacity-70">
                  &ldquo;{MOCK_SUGGESTED_CHANGE.from}&rdquo;
                </span>{" "}
                to{" "}
                <span className="text-accent font-medium">
                  &ldquo;{MOCK_SUGGESTED_CHANGE.to}&rdquo;
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
