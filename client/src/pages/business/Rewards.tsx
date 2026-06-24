import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function BusinessRewards() {
  const { data: customers, isLoading } = trpc.business.getCustomers.useQuery();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [points, setPoints] = useState(10);
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const issueMutation = trpc.business.issuePoints.useMutation({
    onSuccess: () => { toast.success("Points issued!"); setSelectedId(null); setPoints(10); setAmount(""); setDesc(""); },
    onError: e => toast.error(e.message),
  });
  const filtered = customers?.filter(c =>
    !search ||
    (c.user?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.user?.email ?? "").toLowerCase().includes(search.toLowerCase())
  ) ?? [];
  const selected = customers?.find(c => c.user.id === selectedId);

  return (
    <AppLayout title="Issue Points">
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Issue Points</h2>
        <p className="text-muted-foreground">Manually award points to customers.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-foreground mb-4">Select Customer</h3>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10 rounded-xl" />
          </div>
          {isLoading ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-hidden max-h-80 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">No customers found.</div>
              ) : filtered.map(c => (
                <button
                  key={c.user.id}
                  onClick={() => setSelectedId(c.user.id)}
                  className={"w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border last:border-0 hover:bg-secondary/30 transition-colors " + (selectedId === c.user.id ? "bg-primary/5 border-l-2 border-l-primary" : "")}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
                    {(c.user?.name ?? c.user?.email ?? "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-foreground">{c.user?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.user?.email ?? "—"} · {(c.card?.pointsBalance ?? 0).toLocaleString()} pts
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-4">Issue Points</h3>
          <div className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-5">
            {selected ? (
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                  {(selected.user?.name ?? "?")[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-sm text-foreground">{selected.user?.name}</div>
                  <div className="text-xs text-muted-foreground">{(selected.card?.pointsBalance ?? 0).toLocaleString()} current pts</div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-secondary rounded-xl text-sm text-muted-foreground text-center">Select a customer from the list</div>
            )}
            <div>
              <Label className="mb-1.5 block text-sm">Points to Issue *</Label>
              <Input type="number" min={1} value={points} onChange={e => setPoints(Number(e.target.value))} className="rounded-xl" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Purchase Amount ($)</Label>
              <Input type="number" min={0} step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Description</Label>
              <Textarea placeholder="e.g. Purchase on 6/24/2026" value={desc} onChange={e => setDesc(e.target.value)} className="rounded-xl resize-none" rows={2} />
            </div>
            <Button
              className="w-full rounded-full gap-2"
              disabled={!selectedId || points < 1 || issueMutation.isPending}
              onClick={() => issueMutation.mutate({ consumerId: selectedId!, points, amountSpent: amount ? Number(amount) : undefined, description: desc || undefined })}
            >
              <Send className="w-4 h-4" />
              {issueMutation.isPending ? "Issuing..." : "Issue Points"}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
