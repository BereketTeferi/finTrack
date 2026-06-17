"use client";

import { useApp, type View } from "@/lib/store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Command, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from "@/components/ui/command";
import {
  LayoutDashboard, ArrowLeftRight, Wallet, PieChart, Target,
  Repeat, Settings, Bell, Tags, SlidersHorizontal, Plus, Download,
} from "lucide-react";

const NAV_ITEMS: { id: View; label: string; icon: any; group: string; shortcut?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Navigate", shortcut: "G D" },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight, group: "Navigate", shortcut: "G T" },
  { id: "accounts", label: "Accounts", icon: Wallet, group: "Navigate", shortcut: "G A" },
  { id: "budgets", label: "Budgets", icon: Target, group: "Navigate", shortcut: "G B" },
  { id: "analytics", label: "Analytics", icon: PieChart, group: "Navigate", shortcut: "G N" },
  { id: "categories", label: "Categories", icon: Tags, group: "Navigate", shortcut: "G C" },
  { id: "recurring", label: "Recurring", icon: Repeat, group: "Navigate" },
  { id: "custom-fields", label: "Custom Fields", icon: SlidersHorizontal, group: "Navigate" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "Navigate" },
  { id: "settings", label: "Settings", icon: Settings, group: "Navigate" },
];

export function CommandPalette() {
  const { commandOpen, setCommandOpen, setActiveView, setAddTransactionOpen } = useApp();

  const run = (fn: () => void) => {
    fn();
    setCommandOpen(false);
  };

  return (
    <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogContent className="p-0 overflow-hidden max-w-2xl gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <Command className="rounded-lg">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Actions">
              <CommandItem
                onSelect={() => run(() => setAddTransactionOpen(true))}
                className="cursor-pointer"
              >
                <Plus size={15} className="mr-2" />
                Add Transaction
                <CommandShortcut>N</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() => run(() => window.open("/api/export/transactions?format=csv", "_blank"))}
                className="cursor-pointer"
              >
                <Download size={15} className="mr-2" />
                Export Transactions (CSV)
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Navigate">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    onSelect={() => run(() => setActiveView(item.id))}
                    className="cursor-pointer"
                  >
                    <Icon size={15} className="mr-2" />
                    {item.label}
                    {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
