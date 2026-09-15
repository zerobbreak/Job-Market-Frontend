import { CheckCircle2, Circle } from "lucide-react";
import type { ProfileData } from "@/api/types";

/** Scores how complete a profile is (0-100) and lists what's missing. */
export function getProfileStrength(profile: ProfileData) {
  let score = 0;
  const missing: string[] = [];

  if (profile.name) score += 10;
  else missing.push("Add your full name");

  if (profile.email) score += 10;
  else missing.push("Add your email");

  if (profile.skills && profile.skills.length > 0) score += 20;
  else missing.push("Add at least one skill");

  if (profile.experience_level) score += 10;
  else missing.push("Add your experience level");

  if (profile.education) score += 10;
  else missing.push("Add your education");

  if (profile.location) score += 10;
  else missing.push("Add where you are based");

  if (profile.career_goals) score += 10;
  else missing.push("Say what you are looking for");

  if (profile.strengths && profile.strengths.length > 0) score += 10;
  else missing.push("Add a few strengths");

  if (profile.phone) score += 10;
  else missing.push("Add your phone number");

  return { score, missing };
}

export function ProfileStrength({ profile }: { profile: ProfileData }) {
  const { score, missing } = getProfileStrength(profile);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm text-neutral-500">Profile strength</p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">{score}%</p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-700"
          style={{ width: `${score}%` }}
        />
      </div>

      {missing.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {missing.slice(0, 4).map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-neutral-600">
              <Circle className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Your profile is complete
        </p>
      )}
    </div>
  );
}
