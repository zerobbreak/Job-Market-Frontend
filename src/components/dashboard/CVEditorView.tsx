import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useReactToPrint } from "@/lib/react-to-print";
import {
  Check,
  Download,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfileData } from "@/api/types";
import { useCVStore } from "@/stores/cvStore";
import { cn } from "@/lib/utils";

interface CVEditorViewProps {
  profile: ProfileData | null;
}

const cardClass =
  "rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

export function CVEditorView({ profile }: CVEditorViewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { data: cvData } = useCVStore();

  const name = cvData.personalInfo.fullName || profile?.name || "Your name";
  const email = profile?.email || cvData.personalInfo.email || "";
  const phone = profile?.phone || cvData.personalInfo.phone || "";
  const location = profile?.location || cvData.personalInfo.address || "";
  const jobTitle = cvData.personalInfo.jobTitle || profile?.experience_level || "";
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

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${name.replace(/\s+/g, "_")}_CV`,
  });

  const checklist = [
    { label: "Email and phone number", done: !!email && !!phone },
    { label: "Where you are based", done: !!location },
    { label: "A short summary", done: !!summary },
    { label: "At least five skills", done: skills.length >= 5 },
    { label: "LinkedIn or portfolio link", done: !!(linkedin || website || github) },
  ];
  const doneCount = checklist.filter((item) => item.done).length;

  const contactLink = "flex items-center gap-1.5 transition-colors hover:text-neutral-900";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-medium text-neutral-900">Your CV</h2>
          <p className="mt-0.5 text-sm text-neutral-500 text-pretty">
            Built from your profile. Export it as it is, or open the editor to
            change sections and layout.
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Button variant="outline" asChild>
            <Link to="/cv-editor">Open editor</Link>
          </Button>
          <Button onClick={() => handlePrint?.()}>
            <Download />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <div className="rounded-2xl border border-neutral-200 bg-[#FAFAF9] p-2 sm:p-3">
          <div
            ref={printRef}
            className="rounded-xl border border-neutral-200 bg-white p-8 text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-12 print:rounded-none print:border-0 print:shadow-none"
          >
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{name}</h1>
            {jobTitle && <p className="mt-1 text-lg text-neutral-500">{jobTitle}</p>}

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-600">
              {location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                  {location}
                </span>
              )}
              {email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-neutral-400" />
                  {email}
                </span>
              )}
              {phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-neutral-400" />
                  {phone}
                </span>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className={contactLink}>
                  <Linkedin className="h-3.5 w-3.5 text-neutral-400" />
                  LinkedIn
                </a>
              )}
              {github && (
                <a href={github} target="_blank" rel="noopener noreferrer" className={contactLink}>
                  <Github className="h-3.5 w-3.5 text-neutral-400" />
                  GitHub
                </a>
              )}
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer" className={contactLink}>
                  <Globe className="h-3.5 w-3.5 text-neutral-400" />
                  Portfolio
                </a>
              )}
            </div>

            <section className="mt-8 border-t border-neutral-100 pt-6">
              <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                Summary
              </h2>
              {summary ? (
                <p className="mt-3 whitespace-pre-wrap leading-relaxed text-neutral-700">
                  {summary}
                </p>
              ) : (
                <p className="mt-3 text-neutral-400 print:hidden">
                  Add a short summary on your profile so employers know what
                  you&apos;re after.
                </p>
              )}
            </section>

            {skills.length > 0 && (
              <section className="mt-8 border-t border-neutral-100 pt-6">
                <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Skills
                </h2>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {skills.map((skill, i) => (
                    <li
                      key={`${skill}-${i}`}
                      className="rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-sm text-neutral-700"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        <aside className={cn(cardClass, "p-5 lg:sticky lg:top-8")}>
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-medium text-neutral-900">Before you send it</h3>
            <span className="text-sm tabular-nums text-neutral-500">
              {doneCount}/{checklist.length}
            </span>
          </div>
          <ul className="mt-4 space-y-3">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5 text-sm">
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    item.done ? "bg-emerald-50 text-emerald-700" : "border border-neutral-300",
                  )}
                >
                  {item.done && <Check className="h-3 w-3" strokeWidth={2.5} />}
                </span>
                <span
                  className={
                    item.done
                      ? "text-neutral-500 line-through decoration-neutral-300"
                      : "text-neutral-900"
                  }
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
          {doneCount < checklist.length && (
            <Button variant="outline" size="sm" asChild className="mt-5 w-full">
              <Link to="/profile">Fill in the gaps</Link>
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
}
