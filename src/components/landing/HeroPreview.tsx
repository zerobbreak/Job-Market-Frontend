const matches = [
  {
    title: "Junior Data Analyst",
    company: "Discovery",
    location: "Sandton",
    score: 92,
    reason: "SQL, Excel, and your BCom Statistics",
  },
  {
    title: "Graduate Software Developer",
    company: "Yoco",
    location: "Cape Town",
    score: 87,
    reason: "Python projects and your internship",
  },
  {
    title: "IT Support Intern",
    company: "Vodacom",
    location: "Midrand",
    score: 78,
    reason: "Networking coursework and A+ certificate",
  },
];

export const HeroPreview = () => {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between gap-4 px-4 pt-3 pb-2">
        <span className="text-sm font-medium text-neutral-900">
          Your matches today
        </span>
        <span className="hidden sm:inline text-xs text-neutral-500">
          From LinkedIn, Indeed, and more
        </span>
      </div>

      <ul className="divide-y divide-neutral-100">
        {matches.map((match, i) => (
          <li
            key={match.title}
            className="flex items-center justify-between gap-4 px-4 py-3.5 text-left animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
            style={{ animationDelay: `${400 + i * 120}ms`, animationDuration: "600ms" }}
          >
            <div className="min-w-0">
              <div className="text-sm font-medium text-neutral-900 sm:truncate">
                {match.title}
                <span className="block sm:inline font-normal text-neutral-500">
                  <span className="hidden sm:inline"> · </span>
                  {match.company}, {match.location}
                </span>
              </div>
              <div className="hidden sm:block text-xs text-neutral-500 truncate mt-0.5">
                Matches on {match.reason}
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 tabular-nums">
              {match.score}% fit
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
