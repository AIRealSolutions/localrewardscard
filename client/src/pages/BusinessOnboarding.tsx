import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { Star, ArrowRight, Building2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Restaurant", "Retail", "Health & Beauty", "Fitness", "Services", "Entertainment", "Food & Beverage", "Professional Services", "Home & Garden", "Other"];

export default function BusinessOnboarding() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: "", description: "", category: "", address: "", city: "", state: "", zip: "", phone: "", email: "", website: "" });
  const createMutation = trpc.business.create.useMutation({
    onSuccess: () => { toast.success("Business registered! Pending approval."); navigate("/business"); },
    onError: (e) => toast.error(e.message),
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"><Star className="w-5 h-5 text-primary-foreground fill-current" /></div>
          <span className="font-serif text-2xl font-semibold text-foreground">Local Rewards</span>
        </div>
        <div className="bg-card rounded-3xl border border-border p-8 shadow-card">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 className="w-6 h-6 text-primary" /></div>
            <div><h2 className="font-serif text-2xl font-semibold text-foreground">Register Your Business</h2><p className="text-sm text-muted-foreground">Your listing will be reviewed and approved within 24 hours.</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="md:col-span-2"><Label className="mb-2 block text-sm font-medium">Business Name *</Label><Input placeholder="e.g. The Corner Café" value={form.name} onChange={set("name")} className="h-11 rounded-xl" /></div>
            <div className="md:col-span-2"><Label className="mb-2 block text-sm font-medium">Description</Label><Textarea placeholder="Tell customers what makes your business special..." value={form.description} onChange={set("description")} className="rounded-xl resize-none" rows={3} /></div>
            <div><Label className="mb-2 block text-sm font-medium">Category</Label><select value={form.category} onChange={set("category")} className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><Label className="mb-2 block text-sm font-medium">Phone</Label><Input placeholder="+1 (555) 000-0000" value={form.phone} onChange={set("phone")} className="h-11 rounded-xl" /></div>
            <div><Label className="mb-2 block text-sm font-medium">Email</Label><Input type="email" placeholder="hello@yourbusiness.com" value={form.email} onChange={set("email")} className="h-11 rounded-xl" /></div>
            <div><Label className="mb-2 block text-sm font-medium">Website</Label><Input placeholder="https://yourbusiness.com" value={form.website} onChange={set("website")} className="h-11 rounded-xl" /></div>
            <div className="md:col-span-2"><Label className="mb-2 block text-sm font-medium">Address</Label><Input placeholder="123 Main Street" value={form.address} onChange={set("address")} className="h-11 rounded-xl" /></div>
            <div><Label className="mb-2 block text-sm font-medium">City</Label><Input placeholder="Springfield" value={form.city} onChange={set("city")} className="h-11 rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label className="mb-2 block text-sm font-medium">State</Label><Input placeholder="IL" value={form.state} onChange={set("state")} className="h-11 rounded-xl" /></div><div><Label className="mb-2 block text-sm font-medium">ZIP</Label><Input placeholder="62701" value={form.zip} onChange={set("zip")} className="h-11 rounded-xl" /></div></div>
          </div>
          <Button className="w-full rounded-full h-12 text-base" disabled={!form.name.trim() || createMutation.isPending} onClick={() => createMutation.mutate({ name: form.name, description: form.description || undefined, category: form.category || undefined, address: form.address || undefined, city: form.city || undefined, state: form.state || undefined, zip: form.zip || undefined, phone: form.phone || undefined, email: form.email || undefined, website: form.website || undefined })}>
            {createMutation.isPending ? "Registering..." : "Submit for Approval"} <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
