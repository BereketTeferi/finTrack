"use client";

import { useApp, type View } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard, ArrowLeftRight, Wallet, PieChart, Target,
  Repeat, Settings, Bell, Tags, SlidersHorizontal, Sparkles,
  ChevronsLeft, ChevronsRight, X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface NavItem {
  id: View;
  label: string;
  icon: any;
  group?: string;
}

const NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight, group: "Overview" },
  { id: "accounts", label: "Accounts", icon: Wallet, group: "Manage" },
  { id: "budgets", label: "Budgets", icon: Target, group: "Manage" },
  { id: "categories", label: "Categories", icon: Tags, group: "Manage" },
  { id: "recurring", label: "Recurring", icon: Repeat, group: "Manage" },
  { id: "custom-fields", label: "Custom Fields", icon: SlidersHorizontal, group: "Manage" },
  { id: "analytics", label: "Analytics", icon: PieChart, group: "Insights" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "Insights" },
  { id: "settings", label: "Settings", icon: Settings, group: "System" },
];

export function Sidebar() {
  const {
    activeView, setActiveView, sidebarCollapsed, toggleSidebar,
    mobileSidebarOpen, setMobileSidebarOpen,
  } = useApp();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const r = await fetch("/api/notifications");
      if (!r.ok) return { items: [], unread: 0 };
      return r.json();
    },
    staleTime: 60_000,
  });
  const unread = notifData?.unread || 0;

  const groups = Array.from(new Set(NAV.map((n) => n.group)));

  const handleNav = (v: View) => {
    setActiveView(v);
    setMobileSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-out",
          "fixed lg:sticky top-0 h-screen",
          sidebarCollapsed ? "w-[72px]" : "w-[248px]",
          mobileSidebarOpen ? "left-0" : "-left-[280px] lg:left-0"
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
          <div className="size-9 rounded-xl gradient-fintech grid place-items-center text-white shrink-0 shadow-glow">
            <Sparkles size={18} />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-semibold tracking-tight text-[15px] leading-none">FinTrack</div>
              <div className="text-[11px] text-muted-foreground mt-1">Smart Money OS</div>
            </div>
          )}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md hover:bg-sidebar-accent"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-5">
          {groups.map((group) => (
            <div key={group}>
              {!sidebarCollapsed && (
                <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {group}
                </div>
              )}
              <div className="space-y-1">
                {NAV.filter((n) => n.group === group).map((item) => {
                  const Icon = item.icon;
                  const active = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={cn(
                        "relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                        active
                          ? "text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                        sidebarCollapsed && "justify-center px-0"
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-lg bg-sidebar-primary shadow-glow"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        />
                      )}
                      <Icon size={18} className="relative z-10 shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="relative z-10 flex-1 text-left truncate">{item.label}</span>
                      )}
                      {!sidebarCollapsed && item.id === "notifications" && unread > 0 && (
                        <span className="relative z-10 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-expense text-white">
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3 space-y-1 shrink-0">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition",
              sidebarCollapsed && "justify-center px-0"
            )}
            title="Toggle theme"
          >
            {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {!sidebarCollapsed && <span>Theme</span>}
          </button>
          <button
            onClick={toggleSidebar}
            className={cn(
              "hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition",
              sidebarCollapsed && "justify-center px-0"
            )}
          >
            {sidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
