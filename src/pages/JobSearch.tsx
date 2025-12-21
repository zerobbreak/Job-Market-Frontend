import { useState } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  Loader2,
  ExternalLink,
  Building2,
  Clock,
  DollarSign,
} from "lucide-react";
import { apiClient } from "@/utils/api";
import { useToast } from "@/components/ui/toast";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  posted?: string;
  salary?: string;
}

export default function JobSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("South Africa");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) {
      toast.show({
        title: "Add keywords",
        description: "Enter a job title or keywords to search.",
        variant: "default",
      });
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient("/search-jobs", {
        method: "POST",
        body: JSON.stringify({ query: searchQuery, location }),
      });
      const data = await response.json();
      const results = data.jobs || [];
      setJobs(results);
      if (Array.isArray(results) && results.length === 0) {
        try {
          const matchResp = await apiClient("/match-jobs", {
            method: "POST",
            body: JSON.stringify({ location, max_results: 10 }),
          });
          const matchData = await matchResp.json();
          if (
            matchData.success &&
            Array.isArray(matchData.matches) &&
            matchData.matches.length > 0
          ) {
            const mapped = matchData.matches.map((m: any) => ({
              id: String(
                m.job?.id || m.job?.url || m.job?.title || Math.random()
              ),
              title: m.job?.title || "Unknown Position",
              company: m.job?.company || "Unknown Company",
              location: m.job?.location || location,
              description: m.job?.description || "",
              url: m.job?.url || "",
            }));
            setJobs(mapped);
            toast.show({
              title: "Showing AI matches",
              description:
                "No direct listings found; showing top matches instead.",
              variant: "default",
            });
          }
        } catch {}
      }
    } catch (error) {
      console.error("Error searching jobs:", error);
      setJobs([]);
      toast.show({
        title: "Search failed",
        description: "Unable to fetch jobs. Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      {/* Background Effects */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Find Your Dream Job
          </h1>
          <p className="text-gray-400 text-lg">
            Enter keywords and location to find jobs
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-8 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Job Title/Keywords Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-400" />
                Job Title or Keywords
              </label>
              <div className="relative group">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-white/20"
                />
              </div>
            </div>

            {/* Location Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-400" />
                Location
              </label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. South Africa"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-white/20"
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleManualSearch}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-semibold shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
            {loading ? "Searching..." : "Search Jobs"}
          </button>
        </div>

        {/* Results */}
        {jobs.length > 0 && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Found {jobs.length} Jobs
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, index) => (
                <div
                  key={job.id}
                  className="group relative bg-transparent border border-white/10 hover:border-blue-500/50 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)] animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-linear-to-br from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Content */}
                  <div className="relative">
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                        <Building2 className="h-4 w-4 text-blue-400" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="h-4 w-4 text-purple-400" />
                        <span>{job.location}</span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    {(job.posted || job.salary) && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.posted && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            {job.posted}
                          </div>
                        )}
                        {job.salary && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400">
                            <DollarSign className="h-3 w-3" />
                            {job.salary}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                      {job.description}
                    </p>

                    {/* View Details Button */}
                    {(() => {
                      const url = job.url;
                      const isValid =
                        typeof url === "string" && /^https?:\/\//.test(url);

                      if (isValid) {
                        return (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-500/50 rounded-lg text-sm font-medium text-blue-200 hover:text-white transition-all"
                          >
                            View Details
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        );
                      }

                      return (
                        <button
                          onClick={() => {
                            toast.show({
                              title: "Invalid link",
                              description:
                                "This job listing link is invalid or missing.",
                              variant: "error",
                            });
                          }}
                          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-sm font-medium text-red-200 hover:text-white transition-all"
                        >
                          View Details
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {jobs.length === 0 && !loading && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Search className="h-10 w-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Start Your Job Search
            </h3>
            <p className="text-gray-400">
              Enter keywords and location to find your perfect job
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
