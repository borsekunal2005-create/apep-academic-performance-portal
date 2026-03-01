import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  GraduationCap,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useCallerProfile } from "../../hooks/useQueries";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tab: string;
}

interface DashboardLayoutProps {
  title: string;
  roleColor: string;
  roleBadge: string;
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export default function DashboardLayout({
  title,
  roleColor,
  roleBadge,
  navItems,
  activeTab,
  onTabChange,
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { clear, identity } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const router = useRouter();

  const handleLogout = () => {
    clear();
    void router.navigate({ to: "/" });
  };

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : "—";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar-gradient
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          shadow-sidebar
        `}
        style={{
          background:
            "linear-gradient(180deg, oklch(0.20 0.08 265) 0%, oklch(0.16 0.06 270) 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gold/10">
            <img
              src="/assets/generated/apep-logo-transparent.dim_200x200.png"
              alt="APEP Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <p className="text-sidebar-foreground font-display font-bold text-sm leading-none">
              APEP
            </p>
            <p className="text-sidebar-foreground/50 text-xs mt-0.5">
              Academic Portal
            </p>
          </div>
          <button
            type="button"
            className="ml-auto lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback
                className="text-xs font-bold text-white"
                style={{ background: roleColor }}
              >
                {(profile?.name || "U").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sidebar-foreground font-semibold text-sm truncate">
                {profile?.name || "Loading..."}
              </p>
              <p className="text-sidebar-foreground/50 text-xs truncate">
                {shortPrincipal}
              </p>
            </div>
          </div>
          <Badge
            className="mt-2 text-xs font-semibold px-2"
            style={{
              background: `${roleColor}20`,
              color: roleColor,
              border: `1px solid ${roleColor}40`,
            }}
          >
            {roleBadge}
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                type="button"
                key={item.tab}
                onClick={() => {
                  onTabChange(item.tab);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                  ${
                    isActive
                      ? "bg-gold/15 text-gold font-semibold"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }
                `}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-gold" : ""}`}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight size={14} className="text-gold" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 md:px-6 h-14 flex items-center gap-4">
          <button
            type="button"
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg text-foreground">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={18} />
            </Button>
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
              >
                <GraduationCap size={16} />
                <span className="hidden sm:inline text-xs">Home</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
