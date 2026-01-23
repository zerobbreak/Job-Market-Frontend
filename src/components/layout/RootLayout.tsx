import { useState, useEffect } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import {
  LogOut,
  Menu,
  Gem,
  Briefcase,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  Settings,
  FileEdit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/utils/api";
import { cn } from "@/lib/utils";

export interface Profile {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  skills: string[];
  experience_level: string;
  education: string;
  strengths: string[];
  career_goals: string;
  notification_enabled?: boolean;
  notification_threshold?: number;
}

export type OutletContextType = {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
};

export default function RootLayout() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const tab = new URLSearchParams(location.search).get("tab");

  // Load profile data when user is authenticated
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }

      try {
        // Backend route is registered as /api/structured (no /profile prefix)
        const response = await apiClient("/structured");
        
        // Response status check is handled inside apiClient (throws on 401)
        
        const data = await response.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, [user]);

  const navigation = [
    { name: "Job Feed", href: "/dashboard", icon: Briefcase, dashboardTab: "job-feed" as const },
    { name: "Smart CV Editor", href: "/dashboard?tab=cv-editor", icon: FileEdit, dashboardTab: "cv-editor" as const },
    { name: "Agent Activity", href: "/applications", icon: BarChart3 },
    { name: "Top Matches", href: "/job-matches", icon: ShieldCheck },
    { name: "Market Insights", href: "/search", icon: TrendingUp },
    { name: "Settings", href: "/profile", icon: Settings },
  ];

  return (
    <div className="dark min-h-screen bg-[#1A1A2E] text-foreground flex">
      {/* Desktop Sidebar - Cockpit AI style */}
      <aside className="hidden md:flex w-72 flex-col bg-[#16162a] border-r border-white/10 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <Gem className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Cockpit AI</h1>
            <p className="text-xs text-zinc-400">AGENT ACTIVE</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isDashboard = "dashboardTab" in item;
            const active = isDashboard && location.pathname === "/dashboard"
              ? (item.dashboardTab === "job-feed" && (!tab || tab === "job-feed")) ||
                (item.dashboardTab === "cv-editor" && (tab === "cv-editor" || tab === "cv-analysis"))
              : null;
            const isDashboardActive = active === true;
            if (isDashboard) {
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    isDashboardActive ? "bg-[#3b82f6] text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              );
            }
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive ? "bg-[#3b82f6] text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="rounded-xl bg-[#1e1e36] border border-white/10 p-4">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Pro Plan Status</p>
            <Button className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl h-11">
              Upgrade Account
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar - Drawer Style */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar Panel */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 bg-[#16162a] border-r border-white/10 transform transition-transform duration-300 ease-in-out flex flex-col",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-6 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <Gem className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Cockpit AI</h1>
              <p className="text-xs text-zinc-400">AGENT ACTIVE</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isDashboard = "dashboardTab" in item;
              const active = isDashboard && location.pathname === "/dashboard"
                ? (item.dashboardTab === "job-feed" && (!tab || tab === "job-feed")) ||
                  (item.dashboardTab === "cv-editor" && (tab === "cv-editor" || tab === "cv-analysis"))
                : null;
              const isDashboardActive = active === true;
              if (isDashboard) {
                return (
                  <Link
                    key={`mobile-${item.name}`}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                      isDashboardActive ? "bg-[#3b82f6] text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </Link>
                );
              }
              return (
                <NavLink
                  key={`mobile-${item.name}`}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                      isActive ? "bg-[#3b82f6] text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="rounded-xl bg-[#1e1e36] border border-white/10 p-4">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Pro Plan Status</p>
              <Button className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl h-11">
                Upgrade Account
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1A1A2E]">
        <header className="md:hidden h-16 border-b border-white/10 bg-[#16162a]/95 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-[#3b82f6]">
              <Gem className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-white">Cockpit AI</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-300"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet context={{ profile, setProfile }} />
          </div>
        </main>
      </div>
    </div>
  );
}
