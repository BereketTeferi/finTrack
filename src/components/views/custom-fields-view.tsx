"use client";

import { useState } from "react";
import {
  useCustomFields, useSaveCustomField, useDeleteCustomField, useAccounts,
} from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, SlidersHorizontal, Pencil, Trash2, Type, Hash, Calendar, ListChecks, ToggleLeft, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FIELD_TYPES = [
  { value: "TEXT", label: "Text", icon: Type, desc: "Single-line text" },
  { value: "NUMBER", label: "Number", icon: Hash, desc: "Numeric value" },
  { value: "DATE", label: "Date", icon: Calendar, desc: "Date picker" },
  { value: "DROPDOWN", label: "Dropdown", icon: ListChecks, desc: "Select from options" },
  { value: "CHECKBOX", label: "Checkbox", icon: ToggleLeft, desc: "Yes / No" },
];

export function CustomFieldsView() {
  const { data, isLoading } = useCustomFields();
  const { data: accData } = useAccounts();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMut = useDeleteCustomField();

  const fields = data?.items || [];
  const accounts = accData?.items || [];

  return (
    <div className="space-y-4">
      <Card className="p-5 bg-muted/30 border-dashed">
        <div className="flex gap-3">
          <div className="size-9 rounded-lg bg-primary/10 grid place-items-center text-primary shrink-0">
            <SlidersHorizontal size={16} />
          </div>
          <div className="text-sm">
            <div className="font-medium mb-0.5">Dynamic Custom Fields</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Extend transactions with your own fields — perfect for trading journals (Trade Pair, Risk %, Setup Type),
              business tracking (Client, Invoice #), or personal notes (Location, Vendor). Fields can be scoped
              to specific accounts or apply globally.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          size="sm"
          className="gradient-fintech text-white border-0 shadow-glow"
          onClick={() => { setEditing(null); setOpen(true); }}
        >
          <Plus size={14} className="mr-1.5" /> New Field
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>
      ) : fields.length === 0 ? (
        <Card className="p-12 text-center">
          <SlidersHorizontal size={32} className="mx-auto text-muted-foreground mb-3" />
          <div className="text-sm text-muted-foreground mb-3">No custom fields yet</div>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }} className="gradient-fintech text-white border-0">
            <Plus size={14} className="mr-1" /> Create your first custom field
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {fields.map((f: any) => {
            const typeMeta = FIELD_TYPES.find(t => t.value === f.type) || FIELD_TYPES[0];
            const Icon = typeMeta.icon;
            const options = f.options ? JSON.parse(f.options) : [];
            return (
              <Card key={f.id} className="p-4 group hover:shadow-soft transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="size-9 rounded-lg bg-primary/10 grid place-items-center text-primary">
                    <Icon size={15} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => { setEditing(f); setOpen(true); }}>
                      <Pencil size={12} />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => setDeleteId(f.id)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
                <div className="text-sm font-semibold">{f.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{typeMeta.label} · {typeMeta.desc}</div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <Badge variant="outline" className="text-[10px]">
                    {f.accountId ? accounts.find((a: any) => a.id === f.accountId)?.name || "Account" : "Global"}
                  </Badge>
                  {f.required && <Badge variant="outline" className="text-[10px] text-destructive">Required</Badge>}
                </div>
                {f.type === "DROPDOWN" && options.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-border">
                    <div className="text-[10px] text-muted-foreground mb-1">Options</div>
                    <div className="flex flex-wrap gap-1">
                      {options.slice(0, 4).map((o: string) => (
                        <span key={o} className="px-1.5 py-0.5 text-[10px] rounded bg-muted">{o}</span>
                      ))}
                      {options.length > 4 && <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground">+{options.length - 4}</span>}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <CustomFieldFormDialog open={open} onOpenChange={setOpen} editing={editing} accounts={accounts} />
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete custom field?</AlertDialogTitle>
            <AlertDialogDescription>
              Existing values stored on transactions will also be removed. This cannot be undone.
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

function CustomFieldFormDialog({ open, onOpenChange, editing, accounts }: { open: boolean; onOpenChange: (b: boolean) => void; editing: any | null; accounts: any[] }) {
  const saveMut = useSaveCustomField();
  const formKey = editing?.id || "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={formKey}>
        <DialogHeader>
          <DialogTitle>{editing?.id ? "Edit Custom Field" : "New Custom Field"}</DialogTitle>
        </DialogHeader>
        <CustomFieldFormBody
          key={formKey}
          editing={editing}
          accounts={accounts}
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

function CustomFieldFormBody({ editing, accounts, onSubmit, onCancel, saving }: any) {
  const [form, setForm] = useState({
    name: editing?.name || "",
    type: editing?.type || "TEXT",
    accountId: editing?.accountId || "",
    required: editing?.required ?? false,
    options: editing?.options ? JSON.parse(editing.options) : [],
  });
  const [newOption, setNewOption] = useState("");

  const typeMeta = FIELD_TYPES.find(t => t.value === form.type) || FIELD_TYPES[0];
  const Icon = typeMeta.icon;

  const addOption = () => {
    const v = newOption.trim();
    if (v && !form.options.includes(v)) {
      setForm({ ...form, options: [...form.options, v] });
      setNewOption("");
    }
  };

  return (
    <>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label>Field Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Trade Pair, Client Name, Vendor"
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Field Type</Label>
          <div className="grid grid-cols-5 gap-1.5">
            {FIELD_TYPES.map(t => {
              const TIcon = t.icon;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={cn(
                    "p-2 rounded-lg border transition flex flex-col items-center gap-1",
                    form.type === t.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <TIcon size={14} />
                  <span className="text-[10px]">{t.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{typeMeta.desc}</p>
        </div>

        {form.type === "DROPDOWN" && (
          <div className="space-y-1.5">
            <Label>Options</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.options.map((o: string) => (
                <span key={o} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs">
                  {o}
                  <button
                    onClick={() => setForm({ ...form, options: form.options.filter((x: string) => x !== o) })}
                    className="hover:text-destructive"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addOption(); }
                }}
                placeholder="Add option and press Enter"
                className="h-10"
              />
              <Button type="button" variant="outline" size="icon" onClick={addOption}>
                <Plus size={16} />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Scope</Label>
          <Select value={form.accountId} onValueChange={(v) => setForm({ ...form, accountId: v === "global" ? "" : v })}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="global">All accounts (global)</SelectItem>
              {accounts.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground mt-1">
            Fields scoped to an account only appear when that account is selected.
          </p>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border">
          <div>
            <div className="text-sm font-medium">Required</div>
            <div className="text-[11px] text-muted-foreground">Force users to fill this field</div>
          </div>
          <Switch checked={form.required} onCheckedChange={(c) => setForm({ ...form, required: c })} />
        </div>

        {/* Preview */}
        <div className="p-3 rounded-lg border border-dashed border-border bg-muted/30">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Preview</div>
          <div className="flex items-center gap-2 mb-1">
            <Icon size={13} className="text-primary" />
            <span className="text-xs font-medium">{form.name || "Field name"}</span>
            {form.required && <span className="text-destructive text-xs">*</span>}
          </div>
          <div className="h-8 px-2 grid place-items-start text-[11px] text-muted-foreground/70 italic">
            {form.type === "DROPDOWN" ? (form.options[0] || "Select...") :
             form.type === "CHECKBOX" ? "Toggle" :
             form.type === "DATE" ? "mm/dd/yyyy" :
             form.type === "NUMBER" ? "0" : "Sample text"}
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
