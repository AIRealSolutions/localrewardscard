import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings, Sliders, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
export default function BusinessSettings() {
  const utils = trpc.useUtils();
  const { data: biz, isLoading } = trpc.business.getMyBusiness.useQuery();
  const { data: rule } = trpc.accrual.get.useQuery();
  const updateMutation = trpc.business.update.useMutation({ onSuccess: () => { utils.business.getMyBusiness.invalidate(); toast.success("Settings saved!"); }, onError: e => toast.error(e.message) });
  const ruleMutation = trpc.accrual.update.useMutation({ onSuccess: () => { utils.accrual.get.invalidate(); toast.success("Rewards rules saved!"); }, onError: e => toast.error(e.message) });
  const [form, setForm] = useState({ name: "", description: "", address: "", city: "", state: "", zip: "", phone: "", email: "", website: "" });
  const [ruleForm, setRuleForm] = useState({ pointsPerDollar: 1, pointsPerVisit: 0, bonusMultiplier: 1 });
  useEffect(() => { if (biz) setForm({ name: biz.name, description: biz.description ?? "", address: biz.address ?? "", city: biz.city ?? "", state: biz.state ?? "", zip: biz.zip ?? "", phone: biz.phone ?? "", email: biz.email ?? "", website: biz.website ?? "" }); }, [biz]);
  useEffect(() => { if (rule) setRuleForm({ pointsPerDollar: Number(rule.pointsPerDollar), pointsPerVisit: rule.pointsPerVisit, bonusMultiplier: Number(rule.bonusMultiplier) }); }, [rule]);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setRule = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setRuleForm(f => ({ ...f, [k]: Number(e.target.value) }));
  if (isLoading) return <AppLayout title="Settings"><Skeleton className="h-40 rounded-2xl" /></AppLayout>;
  return (
    <AppLayout title="Settings">
      <div className="mb-8"><h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Business Settings</h2><p className="text-muted-foreground">Manage your business profile and rewards configuration.</p></div>
      <Tabs defaultValue="profile">
        <TabsList className="mb-6 rounded-xl"><TabsTrigger value="profile" className="rounded-lg gap-2"><Settings className="w-4 h-4" />Profile</TabsTrigger><TabsTrigger value="rewards" className="rounded-lg gap-2"><Sliders className="w-4 h-4" />Rewards Rules</TabsTrigger></TabsList>
        <TabsContent value="profile">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-card max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div className="md:col-span-2"><Label className="mb-1.5 block text-sm">Business Name</Label><Input value={form.name} onChange={set("name")} className="rounded-xl" /></div>
              <div className="md:col-span-2"><Label className="mb-1.5 block text-sm">Description</Label><Textarea value={form.description} onChange={set("description")} className="rounded-xl resize-none" rows={3} /></div>
              <div><Label className="mb-1.5 block text-sm">Phone</Label><Input value={form.phone} onChange={set("phone")} className="rounded-xl" /></div>
              <div><Label className="mb-1.5 block text-sm">Email</Label><Input type="email" value={form.email} onChange={set("email")} className="rounded-xl" /></div>
              <div className="md:col-span-2"><Label className="mb-1.5 block text-sm">Website</Label><Input value={form.website} onChange={set("website")} className="rounded-xl" /></div>
              <div className="md:col-span-2"><Label className="mb-1.5 block text-sm">Address</Label><Input value={form.address} onChange={set("address")} className="rounded-xl" /></div>
              <div><Label className="mb-1.5 block text-sm">City</Label><Input value={form.city} onChange={set("city")} className="rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-3"><div><Label className="mb-1.5 block text-sm">State</Label><Input value={form.state} onChange={set("state")} className="rounded-xl" /></div><div><Label className="mb-1.5 block text-sm">ZIP</Label><Input value={form.zip} onChange={set("zip")} className="rounded-xl" /></div></div>
            </div>
            <Button className="rounded-full gap-2" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate({ name: form.name, description: form.description || undefined, address: form.address || undefined, city: form.city || undefined, state: form.state || undefined, zip: form.zip || undefined, phone: form.phone || undefined, email: form.email || undefined, website: form.website || undefined })}><Save className="w-4 h-4" />{updateMutation.isPending ? "Saving..." : "Save Changes"}</Button>
          </div>
        </TabsContent>
        <TabsContent value="rewards">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-card max-w-lg">
            <p className="text-sm text-muted-foreground mb-6">Configure how customers earn points at your business.</p>
            <div className="space-y-5 mb-6">
              <div><Label className="mb-1.5 block text-sm">Points per $1 Spent</Label><Input type="number" min={0} step="0.1" value={ruleForm.pointsPerDollar} onChange={setRule("pointsPerDollar")} className="rounded-xl" /><p className="text-xs text-muted-foreground mt-1">Customers earn this many points for every dollar they spend.</p></div>
              <div><Label className="mb-1.5 block text-sm">Bonus Points per Visit</Label><Input type="number" min={0} value={ruleForm.pointsPerVisit} onChange={setRule("pointsPerVisit")} className="rounded-xl" /><p className="text-xs text-muted-foreground mt-1">Additional points awarded just for visiting.</p></div>
              <div><Label className="mb-1.5 block text-sm">Bonus Multiplier</Label><Input type="number" min={1} step="0.1" value={ruleForm.bonusMultiplier} onChange={setRule("bonusMultiplier")} className="rounded-xl" /><p className="text-xs text-muted-foreground mt-1">Multiplies all points earned (e.g. 1.5 = 50% bonus).</p></div>
            </div>
            <Button className="rounded-full gap-2" disabled={ruleMutation.isPending} onClick={() => ruleMutation.mutate(ruleForm)}><Save className="w-4 h-4" />{ruleMutation.isPending ? "Saving..." : "Save Rules"}</Button>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
