import type { CSSProperties, ReactNode } from "react";
import {
  BadgeCheck,
  Briefcase,
  CalendarClock,
  GraduationCap,
  Sparkles,
  Wallet,
} from "lucide-react";

type FloatingCard = {
  position: string;
  rotate: number;
  duration: number;
  delay: number;
  depth: "front" | "back";
  content: ReactNode;
};

const IconTile = ({ children }: { children: ReactNode }) => (
  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
    {children}
  </div>
);

const cards: FloatingCard[] = [
  {
    position: "top-[132px] left-[3%]",
    rotate: -7,
    duration: 11,
    delay: 0,
    depth: "back",
    content: (
      <div className="flex items-center gap-3">
        <IconTile>
          <GraduationCap className="h-4 w-4" strokeWidth={1.75} />
        </IconTile>
        <div>
          <div className="text-[13px] font-medium text-neutral-900">
            Graduate Programme
          </div>
          <div className="text-xs text-neutral-500">Sasol · Secunda</div>
        </div>
      </div>
    ),
  },
  {
    position: "top-[124px] right-[3%]",
    rotate: 6,
    duration: 13,
    delay: 1.2,
    depth: "front",
    content: (
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0">
          <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#f5f5f4" strokeWidth="4" />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="#059669"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${0.92 * 94.25} 94.25`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-neutral-900 tabular-nums">
            92
          </span>
        </div>
        <div>
          <div className="text-[13px] font-medium text-neutral-900">
            Junior Data Analyst
          </div>
          <div className="text-xs text-emerald-700">Strong fit for you</div>
        </div>
      </div>
    ),
  },
  {
    position: "top-[408px] left-[1%]",
    rotate: 4,
    duration: 12,
    delay: 0.6,
    depth: "front",
    content: (
      <div className="flex items-center gap-3">
        <IconTile>
          <Sparkles className="h-4 w-4" strokeWidth={1.75} />
        </IconTile>
        <div>
          <div className="text-[13px] font-medium text-neutral-900">
            CV tailored for Capitec
          </div>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} />
            Cover letter ready
          </div>
        </div>
      </div>
    ),
  },
  {
    position: "top-[420px] right-[1%]",
    rotate: -5,
    duration: 10,
    delay: 2,
    depth: "front",
    content: (
      <div className="flex items-center gap-3">
        <IconTile>
          <CalendarClock className="h-4 w-4" strokeWidth={1.75} />
        </IconTile>
        <div>
          <div className="text-[13px] font-medium text-neutral-900">
            Interview · Thu 10:00
          </div>
          <div className="text-xs text-neutral-500">Absa · Rosebank</div>
        </div>
      </div>
    ),
  },
  {
    position: "top-[528px] left-[8%]",
    rotate: -3,
    duration: 14,
    delay: 1.6,
    depth: "back",
    content: (
      <div className="flex items-center gap-3">
        <IconTile>
          <Wallet className="h-4 w-4" strokeWidth={1.75} />
        </IconTile>
        <div>
          <div className="text-[13px] font-semibold text-neutral-900 tabular-nums">
            R22k / month
          </div>
          <div className="text-xs text-neutral-500">Typical pay in Gauteng</div>
        </div>
      </div>
    ),
  },
  {
    position: "top-[512px] right-[8%]",
    rotate: 7,
    duration: 12.5,
    delay: 0.3,
    depth: "back",
    content: (
      <div className="flex items-center gap-3">
        <IconTile>
          <Briefcase className="h-4 w-4" strokeWidth={1.75} />
        </IconTile>
        <div>
          <div className="text-[13px] font-medium text-neutral-900">
            Learnership
          </div>
          <div className="text-xs text-neutral-500">Vodacom · Midrand</div>
        </div>
      </div>
    ),
  },
];

export const FloatingJobCards = () => {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 mx-auto hidden h-[760px] max-w-7xl select-none xl:block"
    >
      {cards.map((card, i) => (
        <div
          key={i}
          className={`absolute ${card.position} animate-in fade-in zoom-in-95 fill-mode-both`}
          style={{ animationDelay: `${500 + i * 110}ms`, animationDuration: "900ms" }}
        >
          <div
            className={`job-float rounded-2xl border border-neutral-200/80 bg-white/90 px-4 py-3 backdrop-blur-sm ${
              card.depth === "back"
                ? "scale-90 opacity-70 shadow-[0_6px_20px_-12px_rgba(0,0,0,0.12)]"
                : "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_14px_32px_-16px_rgba(0,0,0,0.18)]"
            }`}
            style={
              {
                "--float-rotate": `${card.rotate}deg`,
                "--float-duration": `${card.duration}s`,
                "--float-delay": `-${card.delay}s`,
              } as CSSProperties
            }
          >
            {card.content}
          </div>
        </div>
      ))}
    </div>
  );
};
