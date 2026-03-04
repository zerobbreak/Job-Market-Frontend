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
        const response = await apiClient("/profiles/me/structured");

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

  const navGroups = [
    {
      title: "Workspace",
      items: [
        {
          name: "Job Feed",
          href: "/dashboard",
          icon: Briefcase,
          dashboardTab: "job-feed" as const,
        },
        {
          name: "Smart CV Editor",
          href: "/dashboard?tab=cv-editor",
          icon: FileEdit,
          dashboardTab: "cv-editor" as const,
        },
        { name: "Agent Activity", href: "/applications", icon: BarChart3 },
      ],
    },
    {
      title: "Discover",
      items: [
        { name: "Top Matches", href: "/job-matches", icon: ShieldCheck },
        { name: "Market Insights", href: "/market-insights", icon: TrendingUp },
      ],
    },
    {
      title: "Account",
      items: [{ name: "Settings", href: "/profile", icon: Settings }],
    },
  ];

  const renderNavItems = (onClick?: () => void) => (
    <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto w-full">
      {navGroups.map((group) => (
        <div key={group.title}>
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {group.title}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isDashboard = "dashboardTab" in item;
              const active =
                isDashboard && location.pathname === "/dashboard"
                  ? (item.dashboardTab === "job-feed" &&
                      (!tab || tab === "job-feed")) ||
                    (item.dashboardTab === "cv-editor" &&
                      (tab === "cv-editor" || tab === "cv-analysis"))
                  : null;
              const isDashboardActive = active === true;

              const linkContent = (
                <>
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </>
              );

              const className = cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              );

              if (isDashboard) {
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClick}
                    className={cn(
                      className,
                      isDashboardActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground",
                    )}
                  >
                    {linkContent}
                  </Link>
                );
              }
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClick}
                  className={({ isActive }) =>
                    cn(
                      className,
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground",
                    )
                  }
                >
                  {linkContent}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="dark min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar - Cockpit AI style */}
      <aside className="hidden md:flex w-72 flex-col bg-sidebar border-r border-border shrink-0">
        <div className="p-6 flex items-center gap-3 h-20">
          <div className="p-2 rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Gem className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-tight">Cockpit AI</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Agent Active
              </p>
            </div>
          </div>
        </div>

        {renderNavItems()}

        <div className="p-6 border-t border-border mt-auto">
          <div className="rounded-2xl bg-card border border-border p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Pro Plan
            </p>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 font-medium">
              Upgrade Account
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-4 h-10 px-4"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar - Drawer Style */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar Panel */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-border transform transition-transform duration-300 ease-in-out flex flex-col",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="p-6 flex items-center gap-3 h-20 border-b border-border/50">
            <div className="p-2 rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Gem className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-tight">Cockpit AI</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Agent Active
                </p>
              </div>
            </div>
          </div>

          {renderNavItems(() => setIsMobileMenuOpen(false))}

          <div className="p-6 border-t border-border mt-auto">
            <div className="rounded-2xl bg-card border border-border p-5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Pro Plan
              </p>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 font-medium">
                Upgrade Account
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-4 h-10 px-4"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <header className="md:hidden h-16 border-b border-border bg-sidebar/95 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary">
              <Gem className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Cockpit AI</span>
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
