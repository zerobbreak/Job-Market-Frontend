import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  CheckCircle,
  ExternalLink,
  Grid3x3,
  List,
  MapPin,
  Building2,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
};

type MatchedJob = {
  job: Job;
  match_score: number;
  match_reasons: string[];
};

function getMatchBadgeColor(score: number) {
  if (score >= 85) return "bg-green-500/10 text-green-400 border-green-500/20";
  if (score >= 70) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (score >= 50)
    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  return "bg-red-500/10 text-red-400 border-red-500/20";
}

export default function MatchedResults({
  filteredMatchedJobs,
  minMatchScore,
  setMinMatchScore,
  findMatches,
  handleApply,
}: {
  filteredMatchedJobs: MatchedJob[];
  minMatchScore: number;
  setMinMatchScore: (v: number) => void;
  findMatches: () => void;
  handleApply: (job: Job) => void;
}) {
  const toast = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-bold text-foreground">
            Your Matched Jobs
          </h3>
          <p className="text-base text-muted-foreground mt-1">
            {filteredMatchedJobs.length}{" "}
            {filteredMatchedJobs.length === 1 ? "job" : "jobs"} found
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={cn(
              "gap-2",
              viewMode === "grid"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Grid3x3 className="h-4 w-4" />
            Grid
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={cn(
              "gap-2",
              viewMode === "list"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-4 w-4" />
            List
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Minimum Match Score
              </Label>
              <Badge variant="outline" className="font-mono">
                {minMatchScore}%
              </Badge>
            </div>
            <Slider
              value={[minMatchScore]}
              onValueChange={(value) => setMinMatchScore(value[0])}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Job Results */}
      {filteredMatchedJobs.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-border">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No matches found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your minimum match score or search in a different
                location
              </p>
            </div>
            <Button onClick={findMatches} variant="outline">
              Search Again
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "gap-6",
            viewMode === "grid"
              ? "grid md:grid-cols-2 lg:grid-cols-3"
              : "grid gap-4"
          )}
        >
          {filteredMatchedJobs.map((match, idx) => (
            <Card
              key={idx}
              className={cn(
                "group border-border bg-card/50 backdrop-blur-sm hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/5",
                viewMode === "grid" ? "flex flex-col" : ""
              )}
            >
              <CardHeader className={viewMode === "grid" ? "flex-1" : ""}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl mb-2 line-clamp-2">
                      {match.job.title}
                    </CardTitle>
                    <div className="flex flex-col gap-1.5">
                      <CardDescription className="flex items-center gap-2 text-base">
                        <Building2 className="h-4 w-4 text-blue-400 shrink-0" />
                        <span className="truncate">{match.job.company}</span>
                      </CardDescription>
                      <CardDescription className="flex items-center gap-2 text-base">
                        <MapPin className="h-4 w-4 text-purple-400 shrink-0" />
                        <span className="truncate">{match.job.location}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "shrink-0 font-semibold",
                      getMatchBadgeColor(match.match_score)
                    )}
                  >
                    {match.match_score}%
                  </Badge>
                </div>

                {/* Match Reasons */}
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Why this matches:
                  </p>
                  <ul className="space-y-2">
                    {match.match_reasons
                      .slice(0, viewMode === "grid" ? 2 : 3)
                      .map((reason, ridx) => (
                        <li
                          key={ridx}
                          className="text-sm flex items-start gap-2 text-muted-foreground"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                          <span className="line-clamp-2">{reason}</span>
                        </li>
                      ))}
                    {match.match_reasons.length >
                      (viewMode === "grid" ? 2 : 3) && (
                      <li className="text-sm text-blue-400 font-medium">
                        +
                        {match.match_reasons.length -
                          (viewMode === "grid" ? 2 : 3)}{" "}
                        more reasons
                      </li>
                    )}
                  </ul>
                </div>

                {viewMode === "list" && (
                  <p className="text-base text-muted-foreground line-clamp-2 mt-3">
                    {match.job.description}
                  </p>
                )}
              </CardHeader>

              <CardFooter
                className={cn(
                  "gap-2",
                  viewMode === "grid" ? "flex-col" : "flex-row"
                )}
              >
                {(() => {
                  const url = match.job.url;
                  const isValid =
                    typeof url === "string" && /^https?:\/\//.test(url);

                  if (isValid) {
                    return (
                      <Button
                        variant="outline"
                        className={cn(
                          "gap-2 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30",
                          viewMode === "grid" ? "w-full" : "flex-1"
                        )}
                        asChild
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View details for ${match.job.title} at ${match.job.company}`}
                        >
                          View Details
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    );
                  }

                  return (
                    <Button
                      variant="outline"
                      className={cn(
                        "gap-2",
                        viewMode === "grid" ? "w-full" : "flex-1"
                      )}
                      onClick={() => {
                        toast.show({
                          title: "Invalid link",
                          description:
                            "This job listing link is invalid or missing.",
                          variant: "error",
                        });
                      }}
                    >
                      View Details
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  );
                })()}
                <Button
                  className={cn(
                    "gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                    viewMode === "grid" ? "w-full" : "flex-1"
                  )}
                  onClick={() => handleApply(match.job)}
                >
                  Apply with AI
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
