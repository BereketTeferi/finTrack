"use client";

import {
  useNotifications, useMarkNotifRead, useDeleteNotif,
} from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell, CheckCircle2, AlertTriangle, Info, XCircle, Trash2, Check,
  TrendingUp, Calendar, Wallet, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TYPE_META: Record<string, { icon: any; color: string; bg: string }> = {
  BUDGET_LIMIT:   { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  UPCOMING_BILL:  { icon: Calendar, color: "text-savings", bg: "bg-savings/10" },
  LOW_BALANCE:    { icon: Wallet, color: "text-expense", bg: "bg-expense/10" },
  RECURRING:      { icon: TrendingUp, color: "text-income", bg: "bg-income/10" },
  INSIGHT:        { icon: Sparkles, color: "text-investment", bg: "bg-investment/10" },
  GENERAL:        { icon: Info, color: "text-primary", bg: "bg-primary/10" },
};

export function NotificationsView() {
  const { data, isLoading } = useNotifications();
  const markMut = useMarkNotifRead();
  const deleteMut = useDeleteNotif();

  const items = data?.items || [];
  const unread = data?.unread || 0;

  return (
    <div className="space-y-4">
      <Card className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 grid place-items-center text-primary">
            <Bell size={16} />
          </div>
          <div>
            <div className="text-sm font-medium">
              {unread > 0 ? `${unread} unread notification${unread !== 1 ? "s" : ""}` : "All caught up"}
            </div>
            <div className="text-[11px] text-muted-foreground">{items.length} total</div>
          </div>
        </div>
        {unread > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await Promise.all(items.filter((n: any) => !n.read).map((n: any) => markMut.mutateAsync({ id: n.id, read: true })));
            }}
          >
            <Check size={14} className="mr-1" /> Mark all read
          </Button>
        )}
      </Card>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell size={32} className="mx-auto text-muted-foreground mb-3" />
          <div className="text-sm text-muted-foreground">
            No notifications yet. We'll alert you about budget limits, upcoming bills, and smart insights here.
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n: any, i: number) => {
            const meta = TYPE_META[n.type] || TYPE_META.GENERAL;
            const Icon = meta.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={cn("p-4 group hover:shadow-soft transition", !n.read && "border-primary/30")}>
                  <div className="flex items-start gap-3">
                    <div className={cn("size-9 rounded-lg grid place-items-center shrink-0", meta.bg)}>
                      <Icon size={15} className={meta.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium">{n.title}</div>
                        <div className="text-[11px] text-muted-foreground shrink-0">
                          {new Date(n.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition">
                        {!n.read && (
                          <Button
                            variant="ghost" size="sm" className="h-7 text-xs"
                            onClick={() => markMut.mutateAsync({ id: n.id, read: true })}
                          >
                            <Check size={11} className="mr-1" /> Mark read
                          </Button>
                        )}
                        <Button
                          variant="ghost" size="sm" className="h-7 text-xs text-destructive"
                          onClick={() => deleteMut.mutateAsync(n.id)}
                        >
                          <Trash2 size={11} className="mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                    {!n.read && <span className="size-2 rounded-full bg-primary shrink-0 mt-2" />}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
