import { useState } from "react";
import {
  TrendingUp,
  Briefcase,
  Users,
  MapPin,
  Building2,
  Sparkles,
  BrainCircuit,
  Laptop,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
// Data sources
const jobVolumeData = [
  { name: "Jan", tech: 400, design: 240, product: 240 },
  { name: "Feb", tech: 300, design: 139, product: 221 },
  { name: "Mar", tech: 200, design: 980, product: 229 },
  { name: "Apr", tech: 278, design: 390, product: 200 },
  { name: "May", tech: 189, design: 480, product: 218 },
  { name: "Jun", tech: 239, design: 380, product: 250 },
  { name: "Jul", tech: 349, design: 430, product: 210 },
];

const marketPositionData = [
  { subject: "Cloud Tech", A: 120, B: 110, fullMark: 150 },
  { subject: "Frontend", A: 98, B: 130, fullMark: 150 },
  { subject: "Backend", A: 86, B: 130, fullMark: 150 },
  { subject: "System Design", A: 99, B: 100, fullMark: 150 },
  { subject: "Algorithms", A: 85, B: 90, fullMark: 150 },
  { subject: "Communication", A: 65, B: 85, fullMark: 150 },
];

const inDemandSkills = [
  { skill: "React / Next.js", value: 95, color: "bg-blue-500" },
  { skill: "TypeScript", value: 88, color: "bg-blue-400" },
  { skill: "Node.js", value: 82, color: "bg-emerald-500" },
  { skill: "AWS / Cloud", value: 75, color: "bg-orange-500" },
  { skill: "Python", value: 65, color: "bg-purple-500" },
];

const topCompanies = [
  {
    name: "Stripe",
    role: "Software Engineer",
    openRoles: 142,
    icon: Briefcase,
  },
  { name: "Vercel", role: "Frontend Developer", openRoles: 89, icon: Laptop },
  { name: "OpenAI", role: "AI Engineer", openRoles: 56, icon: BrainCircuit },
  { name: "Monzo", role: "Backend Engineer", openRoles: 43, icon: Building2 },
];

export default function MarketInsights() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="min-h-screen text-slate-100 p-6 md:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-400" />
            Market Insights & Trends
          </h1>
          <p className="text-slate-400 mt-2">
            Real-time analysis of the current tech job market
          </p>
        </div>
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          {["all", "engineering", "design", "product"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? "bg-blue-600/20 text-blue-400 shadow-sm border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +12%
            </span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">14,233</h3>
          <p className="text-sm text-slate-400">Active Job Listings</p>
        </div>

        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="h-3 w-3 rotate-180" /> -2%
            </span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">2.4m</h3>
          <p className="text-sm text-slate-400">Active Candidates</p>
        </div>

        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +8%
            </span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">42%</h3>
          <p className="text-sm text-slate-400">Remote Opportunities</p>
        </div>

        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400 border border-orange-500/20">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">£78k</h3>
          <p className="text-sm text-slate-400">Average Salary (Tech)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Volume Chart */}
          <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Job Volume Trends
                </h3>
                <p className="text-sm text-slate-400">
                  Monthly breakdown by sector
                </p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={jobVolumeData}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "#334155",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "#f8fafc" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tech"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="design"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#a855f7", strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="product"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Hiring Companies */}
            <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-6">
                Top Hiring Companies
              </h3>
              <div className="space-y-4">
                {topCompanies.map((company, i) => {
                  const Icon = company.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-700/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-200 text-sm">
                            {company.name}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {company.role}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-blue-400">
                          {company.openRoles}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">
                          Open
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* In-Demand Skills */}
            <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-6">
                In-Demand Skills
              </h3>
              <div className="space-y-6">
                {inDemandSkills.map((skill, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-300">
                        {skill.skill}
                      </span>
                      <span className="text-slate-400">
                        {skill.value}% match rate
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${skill.color} relative`}
                        style={{ width: `${skill.value}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
          {/* Your Market Position */}
          <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-2">
              Your Market Position
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Compared to average placed candidates
            </p>
            <div className="h-[250px] w-full mt-4 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  data={marketPositionData}
                >
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 150]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    name="You"
                    dataKey="A"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Market Avg"
                    dataKey="B"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.1}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "#334155",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "#f8fafc" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 border-t border-slate-700/50 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-slate-300">Your Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                <span className="text-xs text-slate-300">Market Avg</span>
              </div>
            </div>
          </div>

          {/* AI Talent Analysis Widget */}
          <div className="rounded-2xl p-px bg-linear-to-b from-blue-500/50 to-purple-600/50">
            <div className="bg-slate-900/90 backdrop-blur-xl h-full w-full rounded-[15px] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24" />
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  AI Talent Analysis
                </h3>
              </div>

              <div className="space-y-4 relative z-10">
                <p className="text-sm text-slate-300 leading-relaxed">
                  Your profile ranks in the{" "}
                  <span className="font-bold text-blue-400">top 15%</span> for
                  Frontend roles. Your strong React and TypeScript scores
                  compensate for slightly lower System Design marks.
                </p>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
                  <div className="text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">
                    Recommended Salary Range
                  </div>
                  <div className="text-2xl font-bold bg-linear-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                    £65k - £85k
                  </div>
                  <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +15% above your current
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="text-xs font-medium text-slate-400">
                    Actionable Advice:
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                      Focus next upskilling on <strong>System Design</strong> to
                      unlock Senior roles.
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></div>
                      Add quantifiable impact to your "Monzo" experience block.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
