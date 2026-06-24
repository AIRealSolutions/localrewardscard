import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Plus, Trash2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
type MForm = { title: string; description: string; requiredPoints: number; requiredVisits: number; bonusPoints: number; rewardDescription: string };
const emptyForm: MForm = { title: "", description: "", requiredPoints: 0, requiredVisits: 0, bonusPoints: 50, rewardDescription: "" };
export default function BusinessMilestones() {
  const utils = trpc.useUtils();
  const { data: milestones, isLoading } = trpc.milestones.list.useQuery();
  const createMutation = trpc.milestones.create.useMutation({ onSuccess: () => { utils.milestones.list.invalidate(); setOpen(false); toast.success("Milestone created!"); }, onError: e => toast.error(e.message) });
  const deleteMutation = trpc.milestones.delete.useMutation({ onSuccess: () => { utils.milestones.list.invalidate(); toast.success("Milestone deleted."); }, onError: e => toast.error(e.message) });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MForm>(emptyForm);
  const set = (k: keyof MForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value }));
  return (
    <AppLayout title="Milestones">
      <div className="mb-8 flex items-center justify-between"><div><h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Patronage Milestones</h2><p className="text-muted-foreground">Celebrate customer loyalty with milestone rewards.</p></div><Button className="rounded-full gap-2" onClick={() => { setForm(emptyForm); setOpen(true); }}><Plus className="w-4 h-4" /> New Milestone</Button></div>
      {isLoading ? <Skeleton className="h-40 rounded-2xl" /> : milestones && milestones.length > 0 ? (
        <div className="space-y-4">{milestones.map(m => (
          <div key={m.id} className="bg-card rounded-2xl border border-border p-6 shadow-card flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0"><Award className="w-7 h-7 text-amber-500" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-foreground">{m.title}</h3>{m.isActive && <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Active</Badge>}</div>
              <p className="text-sm text-muted-foreground mb-2">{m.rewardDescription}</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {m.visitCount > 0 && <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-primary" />{m.visitCount} visits required</span>}
                {}
                {m.bonusPoints > 0 && <span className="flex items-center gap-1 text-amber-600 font-medium">+{m.bonusPoints} bonus pts</span>}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg flex-shrink-0" onClick={() => deleteMutation.mutate({ id: m.id })}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}</div>
      ) : <div className="text-center py-20 bg-card rounded-2xl border border-border"><Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground mb-4">No milestones yet.</p><Button className="rounded-full" onClick={() => { setForm(emptyForm); setOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Create Milestone</Button></div>}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="font-serif text-xl">New Milestone</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="mb-1.5 block text-sm">Title *</Label><Input placeholder="e.g. Loyal Regular" value={form.title} onChange={set("title")} className="rounded-xl" /></div>
            <div><Label className="mb-1.5 block text-sm">Description</Label><Textarea placeholder="Describe what this milestone means..." value={form.description} onChange={set("description")} className="rounded-xl resize-none" rows={2} /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label className="mb-1.5 block text-sm">Required Points</Label><Input type="number" min={0} value={form.requiredPoints} onChange={set("requiredPoints")} className="rounded-xl" /></div><div><Label className="mb-1.5 block text-sm">Required Visits</Label><Input type="number" min={0} value={form.requiredVisits} onChange={set("requiredVisits")} className="rounded-xl" /></div></div>
            <div><Label className="mb-1.5 block text-sm">Bonus Points Awarded</Label><Input type="number" min={0} value={form.bonusPoints} onChange={set("bonusPoints")} className="rounded-xl" /></div>
            <div><Label className="mb-1.5 block text-sm">Reward Description</Label><Input placeholder="e.g. Free coffee on your next visit" value={form.rewardDescription} onChange={set("rewardDescription")} className="rounded-xl" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="rounded-full" disabled={!form.title || createMutation.isPending} onClick={() => createMutation.mutate({ title: form.title, visitCount: form.requiredVisits || 1, bonusPoints: form.bonusPoints, rewardDescription: form.rewardDescription || undefined })}>{createMutation.isPending ? "Creating..." : "Create Milestone"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
