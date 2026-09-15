import { useState } from "react";
import { Outlet, Link } from "@tanstack/react-router";
import {
  Briefcase,
  ClipboardList,
  FileText,
  LogOut,
  Menu,
  Sparkles,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    title: "Your search",
    items: [
      { name: "Job feed", href: "/dashboard", icon: Briefcase },
      { name: "Top matches", href: "/job-matches", icon: Sparkles },
      { name: "Applications", href: "/applications", icon: ClipboardList },
    ],
  },
  {
    title: "Your CV",
    items: [
      { name: "CV editor", href: "/cv-editor", icon: FileText },
      { name: "Profile", href: "/profile", icon: UserRound },
    ],
  },
  {
    title: "Explore",
    items: [
      { name: "Market insights", href: "/market-insights", icon: TrendingUp },
    ],
  },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const initials = (user?.name || user?.email || "?")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="font-semibold text-lg tracking-tight text-neutral-900"
        >
          JobAgent
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 px-3 text-xs font-medium text-neutral-400">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={onNavigate}
                      className="flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors"
                      activeProps={{
                        className:
                          "border-neutral-200 bg-white font-medium text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
                      }}
                      inactiveProps={{
                        className:
                          "border-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                      }}
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-neutral-200/70 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-900">
              {user?.name || "Your account"}
            </p>
            {user?.email && (
              <p className="truncate text-xs text-neutral-500">{user.email}</p>
            )}
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Log out"
            title="Log out"
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RootLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-neutral-900 selection:bg-neutral-200 md:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-neutral-200/70 md:block">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200/70 bg-white/80 px-4 backdrop-blur-md md:hidden">
        <Link to="/dashboard" className="font-semibold tracking-tight">
          JobAgent
        </Link>
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!isMenuOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-neutral-900/20 backdrop-blur-sm transition-opacity duration-300",
            isMenuOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setIsMenuOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-neutral-200 bg-[#FAFAF9] shadow-xl transition-transform duration-300 ease-out",
            isMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
            className="absolute right-3 top-3.5 rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent onNavigate={() => setIsMenuOpen(false)} />
        </aside>
      </div>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 animate-in fade-in duration-500 sm:px-6 md:px-10 md:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
