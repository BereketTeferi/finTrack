"use client";

import { useApp } from "@/lib/store";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Bell, Plus, Menu, Command as CmdIcon, LogOut, User, Settings as SettingsIcon,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Sparkles } from "lucide-react";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Your financial overview at a glance" },
  transactions: { title: "Transactions", subtitle: "Track every income and expense" },
  accounts: { title: "Accounts", subtitle: "Manage your cash, bank, and card accounts" },
  budgets: { title: "Budgets", subtitle: "Plan and stay on top of your spending" },
  analytics: { title: "Analytics", subtitle: "Deep insights into your financial behavior" },
  categories: { title: "Categories", subtitle: "Organize your income and expenses" },
  recurring: { title: "Recurring Transactions", subtitle: "Automate your regular income and bills" },
  "custom-fields": { title: "Custom Fields", subtitle: "Extend transactions with your own fields" },
  notifications: { title: "Notifications", subtitle: "Stay informed about your finances" },
  settings: { title: "Settings", subtitle: "Manage your profile and preferences" },
};

export function Topbar() {
  const { activeView, setCommandOpen, setAddTransactionOpen, setMobileSidebarOpen } = useApp();
  const { data: session } = useSession();
  const qc = useQueryClient();
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

  const meta = TITLES[activeView] || TITLES.dashboard;
  const name = session?.user?.name || "User";
  const email = session?.user?.email || "";
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const unread = notifData?.unread || 0;

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandOpen]);

  return (
    <header className="sticky top-0 z-30 h-16 px-4 lg:px-6 flex items-center gap-3 border-b border-border bg-background/70 backdrop-blur-xl">
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="lg:hidden p-2 rounded-md hover:bg-accent"
      >
        <Menu size={20} />
      </button>

      <div className="hidden md:block min-w-0">
        <h1 className="text-base lg:text-lg font-semibold tracking-tight leading-none truncate">
          {meta.title}
        </h1>
        <p className="text-xs text-muted-foreground mt-1 truncate">{meta.subtitle}</p>
      </div>

      <div className="flex-1" />

      {/* Command palette trigger */}
      <button
        onClick={() => setCommandOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg border border-border bg-card hover:bg-accent text-sm text-muted-foreground transition min-w-[200px] lg:min-w-[260px]"
      >
        <Search size={15} />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded border border-border bg-muted">
          <CmdIcon size={10} />K
        </kbd>
      </button>

      <Button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        variant="ghost"
        size="icon"
        className="rounded-lg"
        title="Toggle theme"
      >
        {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </Button>

      <Button
        onClick={() => useApp.setState({ addTransactionOpen: true })}
        size="sm"
        className="rounded-lg gradient-fintech text-white border-0 shadow-glow hidden sm:inline-flex"
      >
        <Plus size={16} className="mr-1" />
        Add
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative p-1 rounded-lg hover:bg-accent transition" title="Notifications">
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-expense ring-2 ring-background" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm font-semibold">Notifications</span>
            {unread > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-expense/10 text-expense font-medium">
                {unread} new
              </span>
            )}
          </div>
          <DropdownMenuSeparator />
          {notifData?.items?.slice(0, 5).map((n: any) => (
            <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5 py-2">
              <div className="flex items-center gap-2 w-full">
                <span className={`size-1.5 rounded-full ${n.read ? "bg-muted-foreground/40" : "bg-expense"}`} />
                <span className="text-xs font-medium truncate flex-1">{n.title}</span>
              </div>
              <span className="text-[11px] text-muted-foreground line-clamp-2 pl-3.5">{n.message}</span>
            </DropdownMenuItem>
          )) || (
            <div className="py-6 text-center text-sm text-muted-foreground">No notifications yet</div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-accent transition">
            <Avatar className="size-7 rounded-md gradient-fintech">
              <AvatarFallback className="rounded-md text-white text-[11px] font-semibold bg-transparent">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left leading-tight">
              <div className="text-[12px] font-medium">{name}</div>
              <div className="text-[10px] text-muted-foreground truncate max-w-[140px]">{email}</div>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{name}</p>
              <p className="text-xs leading-none text-muted-foreground">{email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => useApp.setState({ activeView: "settings" })}>
            <User size={14} className="mr-2" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => useApp.setState({ activeView: "settings" })}>
            <SettingsIcon size={14} className="mr-2" /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-destructive focus:text-destructive"
          >
            <LogOut size={14} className="mr-2" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
