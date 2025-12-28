import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Trophy } from "lucide-react";
import type { ProfileData } from "@/api/types";
import { cn } from "@/lib/utils";

interface ProfileStrengthProps {
  profile: ProfileData;
}

export function ProfileStrength({ profile }: ProfileStrengthProps) {
  const calculateStrength = () => {
    let score = 0;
    const missing: string[] = [];

    if (profile.name) score += 10;
    else missing.push("Add your full name");

    if (profile.email) score += 10;
    else missing.push("Add your email");

    if (profile.skills && profile.skills.length > 0) score += 20;
    else missing.push("Add at least one skill");

    if (profile.experience_level) score += 10;
    else missing.push("Specify experience level");

    if (profile.education) score += 10;
    else missing.push("Add education details");

    if (profile.location) score += 10;
    else missing.push("Add your location");

    if (profile.career_goals) score += 10;
    else missing.push("Define career goals");

    if (profile.strengths && profile.strengths.length > 0) score += 10;
    else missing.push("Add key strengths");
    
    if (profile.phone) score += 10;
    else missing.push("Add phone number");

    return { score, missing };
  };

  const { score, missing } = calculateStrength();

  const getStrengthLabel = (score: number) => {
    if (score < 40) return "Beginner";
    if (score < 70) return "Intermediate";
    if (score < 90) return "Advanced";
    return "All-Star";
  };

  const getStrengthColor = (score: number) => {
    if (score < 40) return "text-red-500";
    if (score < 70) return "text-yellow-500";
    if (score < 90) return "text-blue-500";
    return "text-green-500";
  };
  
  const getProgressColor = (score: number) => {
    if (score < 40) return "bg-red-500";
    if (score < 70) return "bg-yellow-500";
    if (score < 90) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <Card className="border-border/60 shadow-sm mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className={cn("h-5 w-5", getStrengthColor(score))} />
            Profile Strength: <span className={getStrengthColor(score)}>{getStrengthLabel(score)}</span>
          </CardTitle>
          <span className="font-bold text-lg">{score}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-500 ease-in-out", getProgressColor(score))} 
              style={{ width: `${score}%` }} 
            />
          </div>
          
          {missing.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Steps to improve:</p>
              <ul className="grid sm:grid-cols-2 gap-2">
                {missing.slice(0, 4).map((item, idx) => (
                  <li key={idx} className="text-sm flex items-center gap-2 text-foreground/80">
                    <Circle className="h-3 w-3 text-muted-foreground" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600 bg-green-500/10 p-3 rounded-lg">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-medium">Your profile is complete! You're ready to apply.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
