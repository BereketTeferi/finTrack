"use client";

import { useState } from "react";
import {
  useCategories, useSaveCategory, useDeleteCategory,
} from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Tags as TagsIcon } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { colorClasses } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const COLORS = ["violet", "blue", "emerald", "amber", "rose", "cyan", "orange", "pink", "indigo", "teal", "lime", "fuchsia", "sky", "red", "green", "gray"];
const ICON_OPTIONS = ["utensils", "car", "shopping-bag", "film", "receipt", "graduation-cap", "heart-pulse", "home", "plane", "briefcase", "laptop", "trending-up", "gift", "wallet", "banknote", "landmark", "piggy-bank", "credit-card", "smartphone", "tag"];

export function CategoriesView() {
  const { data: incomeData } = useCategories("INCOME");
  const { data: expenseData } = useCategories("EXPENSE");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMut = useDeleteCategory();

  const incomeCats = incomeData?.items || [];
  const expenseCats = expenseData?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {incomeCats.length + expenseCats.length} categories total
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Income categories */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Income Categories</h3>
              <p className="text-[11px] text-muted-foreground">Sources of income</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setEditing({ type: "INCOME" }); setOpen(true); }}
            >
              <Plus size={14} className="mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-1">
            {incomeCats.map((c: any) => (
              <CategoryRow
                key={c.id}
                cat={c}
                onEdit={() => { setEditing(c); setOpen(true); }}
                onDelete={() => setDeleteId(c.id)}
              />
            ))}
            {incomeCats.length === 0 && (
              <div className="text-sm text-muted-foreground py-6 text-center">No income categories</div>
            )}
          </div>
        </Card>

        {/* Expense categories */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Expense Categories</h3>
              <p className="text-[11px] text-muted-foreground">Where your money goes</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setEditing({ type: "EXPENSE" }); setOpen(true); }}
            >
              <Plus size={14} className="mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-1">
            {expenseCats.map((c: any) => (
              <CategoryRow
                key={c.id}
                cat={c}
                onEdit={() => { setEditing(c); setOpen(true); }}
                onDelete={() => setDeleteId(c.id)}
              />
            ))}
            {expenseCats.length === 0 && (
              <div className="text-sm text-muted-foreground py-6 text-center">No expense categories</div>
            )}
          </div>
        </Card>
      </div>

      <CategoryFormDialog open={open} onOpenChange={setOpen} editing={editing} />
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              Transactions in this category will be marked as "Uncategorized". This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteId) await deleteMut.mutateAsync(deleteId);
                setDeleteId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CategoryRow({ cat, onEdit, onDelete }: { cat: any; onEdit: () => void; onDelete: () => void }) {
  const c = colorClasses(cat.color);
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/40 group">
      <div className={cn("size-8 rounded-lg grid place-items-center", c.soft)}>
        <CategoryIcon name={cat.icon} size={14} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{cat.name}</div>
        {cat.isDefault && <span className="text-[10px] text-muted-foreground">Default</span>}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <Button variant="ghost" size="icon" className="size-7" onClick={onEdit}>
          <Pencil size={12} />
        </Button>
        <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={onDelete}>
          <Trash2 size={12} />
        </Button>
      </div>
    </div>
  );
}

function CategoryFormDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (b: boolean) => void; editing: any | null }) {
  const saveMut = useSaveCategory();
  const formKey = editing?.id || (editing?.type ? `new-${editing.type}` : "new");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={formKey}>
        <DialogHeader>
          <DialogTitle>{editing?.id ? "Edit Category" : `New ${editing?.type === "INCOME" ? "Income" : "Expense"} Category`}</DialogTitle>
        </DialogHeader>
        <CategoryFormBody
          key={formKey}
          editing={editing}
          onSubmit={async (data) => {
            await saveMut.mutateAsync({ id: editing?.id, ...data });
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
          saving={saveMut.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

function CategoryFormBody({ editing, onSubmit, onCancel, saving }: any) {
  const [form, setForm] = useState({
    name: editing?.name || "",
    type: editing?.type || "EXPENSE",
    color: editing?.color || "blue",
    icon: editing?.icon || "tag",
  });

  return (
    <>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-11"
            placeholder="e.g. Dining Out"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Icon</Label>
          <div className="grid grid-cols-10 gap-1.5 max-h-32 overflow-y-auto p-2 rounded-lg border border-border">
            {ICON_OPTIONS.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => setForm({ ...form, icon })}
                className={cn(
                  "size-8 rounded-md grid place-items-center transition",
                  form.icon === icon ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                )}
              >
                <CategoryIcon name={icon} size={14} />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setForm({ ...form, color })}
                className={cn(
                  "size-7 rounded-full transition ring-offset-2 ring-offset-background",
                  colorClasses(color).bg,
                  form.color === color && "ring-2 ring-ring scale-110"
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
          <div className={cn("size-10 rounded-lg grid place-items-center", colorClasses(form.color).soft)}>
            <CategoryIcon name={form.icon} size={18} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Preview</div>
            <div className="text-sm font-medium">{form.name || "Category name"}</div>
          </div>
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => onSubmit(form)}
          disabled={saving || !form.name}
          className="gradient-fintech text-white border-0"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </>
  );
}
