import type { ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

const questions = [
  {
    text: "Tell us about a report you built that changed a decision.",
    tag: "From the job ad",
  },
  {
    text: "This role uses Tableau. How would you get up to speed quickly?",
    tag: "Gap in your CV",
  },
  {
    text: "Why do you want to work in health insurance?",
    tag: "About the company",
  },
];

const applications = [
  { role: "Junior Data Analyst", company: "Discovery", status: "Interview" },
  { role: "Reporting Analyst Graduate", company: "Absa", status: "Applied" },
  { role: "BI Intern", company: "Takealot", status: "Not sent yet" },
];

const statusStyles: Record<string, string> = {
  Interview: "bg-emerald-50 text-emerald-700",
  Applied: "bg-neutral-100 text-neutral-700",
  "Not sent yet": "border border-neutral-200 text-neutral-500",
};

const Card = ({
  title,
  description,
  children,
  className = "",
  delay,
  inView,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  delay: number;
  inView: boolean;
}) => (
  <div
    className={`flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 ${className}`}
    style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 700ms ease-out, transform 700ms ease-out",
      transitionDelay: `${delay}ms`,
    }}
  >
    <h3 className="text-xl font-semibold tracking-tight text-neutral-900 mb-2">
      {title}
    </h3>
    <p className="text-neutral-600 leading-relaxed text-pretty mb-6">
      {description}
    </p>
    <div>{children}</div>
  </div>
);

export const AfterYouApply = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="px-4 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-14 md:mb-20">
          <p className="text-sm text-neutral-500 mb-3">After you apply</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-balance">
            Walk into the interview prepared
          </h2>
          <p className="mt-4 text-lg text-neutral-600 text-pretty">
            Keep track of every application and know what to expect when
            an employer calls you back.
          </p>
        </div>

        <div ref={ref} className="grid gap-4 lg:grid-cols-5">
          <Card
            title="Prepare for interviews"
            description="Get the questions you're likely to be asked, based on the job ad and the gaps in your CV, with tips on how to answer."
            className="lg:col-span-3 lg:row-span-2"
            delay={0}
            inView={inView}
          >
            <ul className="space-y-3">
              {questions.map((question) => (
                <li
                  key={question.text}
                  className="rounded-xl border border-neutral-200 bg-[#FAFAF9] p-4"
                >
                  <p className="text-neutral-900 leading-snug mb-2">
                    “{question.text}”
                  </p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      question.tag === "Gap in your CV"
                        ? "bg-amber-50 text-amber-800"
                        : "bg-white border border-neutral-200 text-neutral-600"
                    }`}
                  >
                    {question.tag}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card
            title="Track your applications"
            description="See which applications are sent, waiting, or moving to an interview."
            className="lg:col-span-2"
            delay={120}
            inView={inView}
          >
            <ul className="divide-y divide-neutral-100">
              {applications.map((application) => (
                <li
                  key={application.company}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-neutral-900 truncate">
                      {application.role}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {application.company}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[application.status]}`}
                  >
                    {application.status}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card
            title="Know the salary"
            description="See the typical pay for a role before you're asked what you expect."
            className="lg:col-span-2"
            delay={240}
            inView={inView}
          >
            <div className="rounded-xl border border-neutral-200 bg-[#FAFAF9] p-4">
              <div className="text-xs text-neutral-500 mb-1">
                Junior Data Analyst · Gauteng
              </div>
              <div className="text-2xl font-semibold tracking-tight text-neutral-900 tabular-nums">
                R18k – R26k
              </div>
              <div className="text-xs text-neutral-500">
                per month, typical range
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
