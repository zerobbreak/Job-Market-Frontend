import type { ReactNode } from "react";
import { FileText } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const Panel = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl border border-neutral-200 bg-[#FAFAF9] p-3 sm:p-4">
    <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {children}
    </div>
  </div>
);

const UploadVisual = () => (
  <Panel>
    <div className="flex items-center gap-3 pb-4 mb-4 border-b border-neutral-100">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
        <FileText className="h-5 w-5 text-neutral-600" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-neutral-900 truncate">
          Thandi_Mokoena_CV.pdf
        </div>
        <div className="text-xs text-emerald-700">Read in a few seconds</div>
      </div>
    </div>

    <dl className="space-y-3 text-sm">
      <div className="flex flex-col sm:flex-row sm:gap-4">
        <dt className="w-28 shrink-0 text-neutral-500">Qualification</dt>
        <dd className="text-neutral-900">BCom Statistics, University of Johannesburg</dd>
      </div>
      <div className="flex flex-col sm:flex-row sm:gap-4">
        <dt className="w-28 shrink-0 text-neutral-500">Experience</dt>
        <dd className="text-neutral-900">6-month data internship, Standard Bank</dd>
      </div>
      <div className="flex flex-col sm:flex-row sm:gap-4">
        <dt className="w-28 shrink-0 text-neutral-500 sm:pt-1">Skills</dt>
        <dd className="flex flex-wrap gap-1.5 mt-1 sm:mt-0">
          {["SQL", "Excel", "Power BI", "Python", "Reporting"].map((skill) => (
            <span
              key={skill}
              className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-700"
            >
              {skill}
            </span>
          ))}
        </dd>
      </div>
    </dl>
  </Panel>
);

const matches = [
  {
    title: "Junior Data Analyst",
    company: "Discovery, Sandton",
    score: 92,
    reason: "Uses SQL and Power BI daily",
  },
  {
    title: "Reporting Analyst Graduate",
    company: "Absa, Johannesburg",
    score: 88,
    reason: "Asks for a Statistics degree",
  },
  {
    title: "Business Intelligence Intern",
    company: "Takealot, Cape Town",
    score: 74,
    reason: "Prefers Python, which you have",
  },
];

const MatchesVisual = () => (
  <Panel>
    <div className="text-sm font-medium text-neutral-900 mb-3">
      Jobs that fit your CV
    </div>
    <ul className="divide-y divide-neutral-100">
      {matches.map((match) => (
        <li key={match.title} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <div className="text-sm font-medium text-neutral-900 truncate">
              {match.title}
            </div>
            <div className="text-xs text-neutral-500 truncate">
              {match.company} · {match.reason}
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 tabular-nums">
            {match.score}% fit
          </span>
        </li>
      ))}
    </ul>
  </Panel>
);

const TailoredVisual = () => (
  <Panel>
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="text-sm font-medium text-neutral-900">
        Your CV, tailored for Discovery
      </div>
      <span className="shrink-0 text-xs text-neutral-500">Summary rewritten</span>
    </div>

    <div className="space-y-4 text-sm leading-relaxed">
      <div>
        <div className="text-xs text-neutral-500 mb-1.5">Summary</div>
        <p className="rounded-md bg-red-50 px-2.5 py-1.5 text-red-700 line-through decoration-red-300">
          Hard-working graduate looking for an opportunity to grow.
        </p>
        <p className="mt-1.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-emerald-800">
          Statistics graduate who built weekly Power BI reports from SQL data
          during a Standard Bank internship.
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
        <span className="text-neutral-600">Cover letter ready to review</span>
        <span className="shrink-0 whitespace-nowrap rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-800">
          Review and send
        </span>
      </div>
    </div>
  </Panel>
);

const steps = [
  {
    number: "1",
    title: "Upload your CV",
    description:
      "Drop in your CV as a PDF or Word file. We pick out your qualifications, experience, and skills, so there are no long forms to fill in.",
    visual: <UploadVisual />,
  },
  {
    number: "2",
    title: "See the jobs that fit you",
    description:
      "We search LinkedIn, Indeed, and other job boards, then rank the roles by how well they match your CV and tell you why.",
    visual: <MatchesVisual />,
  },
  {
    number: "3",
    title: "Apply with a CV made for that job",
    description:
      "For each job you choose, we rewrite your CV and draft a cover letter to match what the employer asks for. You see every change and edit anything before you send.",
    visual: <TailoredVisual />,
  },
];

const Step = ({
  step,
  reversed,
}: {
  step: (typeof steps)[number];
  reversed: boolean;
}) => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className="grid items-center gap-8 md:grid-cols-2 md:gap-16"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 700ms ease-out, transform 700ms ease-out",
      }}
    >
      <div className={reversed ? "md:order-2" : undefined}>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-sm font-medium text-neutral-700 tabular-nums mb-5">
          {step.number}
        </span>
        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 mb-3 text-balance">
          {step.title}
        </h3>
        <p className="text-neutral-600 text-lg leading-relaxed text-pretty max-w-md">
          {step.description}
        </p>
      </div>
      <div className={reversed ? "md:order-1" : undefined}>{step.visual}</div>
    </div>
  );
};

export const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="px-4 py-24 md:py-32 bg-white border-y border-neutral-200/70 scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-24">
          <p className="text-sm text-neutral-500 mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-balance">
            From CV to application in three steps
          </h2>
        </div>

        <div className="space-y-20 md:space-y-32">
          {steps.map((step, index) => (
            <Step key={step.number} step={step} reversed={index % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
};
