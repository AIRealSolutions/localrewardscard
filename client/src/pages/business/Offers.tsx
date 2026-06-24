import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Plus, Trash2, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
type OfferForm = { title: string; description: string; pointsRequired: number; discountType: string; discountValue: number; maxRedemptions: number; validUntil: string };
const emptyForm: OfferForm = { title: "", description: "", pointsRequired: 100, discountType: "percent", discountValue: 10, maxRedemptions: 0, validUntil: "" };
export default function BusinessOffers() {
  const utils = trpc.useUtils();
  const { data: offers, isLoading } = trpc.offers.list.useQuery();
  const createMutation = trpc.offers.create.useMutation({ onSuccess: () => { utils.offers.list.invalidate(); setOpen(false); toast.success("Offer created!"); }, onError: e => toast.error(e.message) });
  const deleteMutation = trpc.offers.delete.useMutation({ onSuccess: () => { utils.offers.list.invalidate(); toast.success("Offer deleted."); }, onError: e => toast.error(e.message) });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<OfferForm>(emptyForm);
  const set = (k: keyof OfferForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value }));
  return (
    <AppLayout title="Offers & Rewards">
      <div className="mb-8 flex items-center justify-between"><div><h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Offers & Rewards</h2><p className="text-muted-foreground">Create redeemable rewards for your customers.</p></div><Button className="rounded-full gap-2" onClick={() => { setForm(emptyForm); setOpen(true); }}><Plus className="w-4 h-4" /> New Offer</Button></div>
      {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div> : offers && offers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{offers.map(offer => (
          <div key={offer.id} className="bg-card rounded-2xl border border-border p-6 shadow-card">
            <div className="flex items-start justify-between mb-3"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Gift className="w-5 h-5" /></div><Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" onClick={() => deleteMutation.mutate({ id: offer.id })}><Trash2 className="w-4 h-4 text-destructive" /></Button></div>
            <h3 className="font-semibold text-foreground mb-1">{offer.title}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{offer.description}</p>
            <div className="flex items-center gap-3"><div className="flex items-center gap-1 text-xs text-amber-600 font-medium"><Star className="w-3 h-3 fill-current" />{offer.pointsRequired.toLocaleString()} pts</div>{offer.discountValue && <Badge variant="secondary" className="text-xs">{offer.discountType === "percent" ? `${offer.discountValue}% off` : `$${offer.discountValue} off`}</Badge>}<Badge variant="outline" className={cn("text-xs", offer.isActive ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-700")}>{offer.isActive ? "Active" : "Inactive"}</Badge></div>
          </div>
        ))}</div>
      ) : <div className="text-center py-20 bg-card rounded-2xl border border-border"><Gift className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground mb-4">No offers yet.</p><Button className="rounded-full" onClick={() => { setForm(emptyForm); setOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Create Offer</Button></div>}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="font-serif text-xl">New Offer</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="mb-1.5 block text-sm">Title *</Label><Input placeholder="e.g. 10% Off Your Next Visit" value={form.title} onChange={set("title")} className="rounded-xl" /></div>
            <div><Label className="mb-1.5 block text-sm">Description</Label><Textarea placeholder="Describe the offer..." value={form.description} onChange={set("description")} className="rounded-xl resize-none" rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="mb-1.5 block text-sm">Points Required</Label><Input type="number" min={1} value={form.pointsRequired} onChange={set("pointsRequired")} className="rounded-xl" /></div>
              <div><Label className="mb-1.5 block text-sm">Discount Type</Label><select value={form.discountType} onChange={set("discountType")} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"><option value="percent">Percentage</option><option value="fixed">Fixed Amount</option><option value="freebie">Free Item</option><option value="service">Service</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="mb-1.5 block text-sm">Discount Value</Label><Input type="number" min={0} value={form.discountValue} onChange={set("discountValue")} className="rounded-xl" /></div>
              <div><Label className="mb-1.5 block text-sm">Max Redemptions</Label><Input type="number" min={0} value={form.maxRedemptions} onChange={set("maxRedemptions")} className="rounded-xl" /></div>
            </div>
            <div><Label className="mb-1.5 block text-sm">Valid Until</Label><Input type="date" value={form.validUntil} onChange={set("validUntil")} className="rounded-xl" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="rounded-full" disabled={!form.title || createMutation.isPending} onClick={() => createMutation.mutate({ title: form.title, description: form.description || undefined, pointsRequired: form.pointsRequired, discountType: form.discountType as "percent"|"fixed"|"freebie"|"service", discountValue: form.discountValue || undefined, maxRedemptions: form.maxRedemptions || undefined, validUntil: form.validUntil ? new Date(form.validUntil) : undefined })}>{createMutation.isPending ? "Creating..." : "Create Offer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
