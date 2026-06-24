import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
const TIER_CLASSES: Record<string, string> = { bronze: "tier-bronze", silver: "tier-silver", gold: "tier-gold", platinum: "tier-platinum" };
export default function BusinessCustomers() {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = trpc.business.getCustomers.useQuery();
  const filtered = customers?.filter(c => !search || (c.user?.name ?? "").toLowerCase().includes(search.toLowerCase()) || (c.user?.email ?? "").toLowerCase().includes(search.toLowerCase())) ?? [];
  return (
    <AppLayout title="Customers">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div><h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Customer List</h2><p className="text-muted-foreground">{customers?.length ?? 0} enrolled customers</p></div>
        <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10 rounded-xl" /></div>
      </div>
      {isLoading ? <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div> : filtered.length > 0 ? (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Customer</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Tier</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Points</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Visits</th>
            </tr></thead>
            <tbody>{filtered.map((c, i) => (
              <tr key={c.user.id} className={cn("border-b border-border last:border-0 hover:bg-secondary/20 transition-colors", i % 2 === 0 ? "" : "bg-secondary/5")}>
                <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">{(c.user?.name ?? c.user?.email ?? "?")[0].toUpperCase()}</div><div><div className="font-medium text-foreground text-sm">{c.user?.name ?? "—"}</div><div className="text-xs text-muted-foreground">{c.user?.email ?? "—"}</div></div></div></td>
                <td className="px-5 py-4 hidden md:table-cell"><Badge className={cn("text-xs capitalize", TIER_CLASSES[c.card?.tier ?? "bronze"] ?? "")}>{c.card?.tier ?? "bronze"}</Badge></td>
                <td className="px-5 py-4 text-right"><div className="flex items-center justify-end gap-1 text-sm font-semibold text-amber-600"><Star className="w-3 h-3 fill-current" />{(c.card?.pointsBalance ?? 0).toLocaleString()}</div></td>
                <td className="px-5 py-4 text-right text-sm text-muted-foreground hidden sm:table-cell">{c.card?.visitCount ?? 0}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <div className="text-center py-20 bg-card rounded-2xl border border-border"><Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">{search ? "No customers match your search." : "No customers yet."}</p></div>}
    </AppLayout>
  );
}
