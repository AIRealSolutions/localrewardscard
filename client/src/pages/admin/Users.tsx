import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Users, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
const ROLE_COLORS: Record<string, string> = { user: "border-secondary text-muted-foreground", business_owner: "border-primary/30 text-primary bg-primary/5", admin: "border-violet-200 text-violet-700 bg-violet-50" };
export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = trpc.admin.getAllUsers.useQuery({ limit: 100, offset: 0 });
  const filtered = users?.filter(u => !search || (u.name ?? "").toLowerCase().includes(search.toLowerCase()) || (u.email ?? "").toLowerCase().includes(search.toLowerCase())) ?? [];
  return (
    <AppLayout title="Users">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div><h2 className="font-serif text-2xl font-semibold text-foreground mb-1">User Management</h2><p className="text-muted-foreground">{users?.length ?? 0} registered users</p></div>
        <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10 rounded-xl" /></div>
      </div>
      {isLoading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div> : filtered.length > 0 ? (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-secondary/30"><th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th><th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Role</th><th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Joined</th></tr></thead>
            <tbody>{filtered.map((u, i) => (
              <tr key={u.id} className={cn("border-b border-border last:border-0 hover:bg-secondary/20 transition-colors", i % 2 === 0 ? "" : "bg-secondary/5")}>
                <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">{(u.name ?? u.email ?? "?")[0].toUpperCase()}</div><div><div className="font-medium text-foreground text-sm">{u.name ?? "—"}</div><div className="text-xs text-muted-foreground">{u.email ?? "—"}</div></div></div></td>
                <td className="px-5 py-4 hidden md:table-cell"><Badge variant="outline" className={cn("text-xs capitalize", ROLE_COLORS[u.role] ?? "")}>{u.role?.replace("_", " ")}</Badge></td>
                <td className="px-5 py-4 text-sm text-muted-foreground hidden lg:table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <div className="text-center py-20 bg-card rounded-2xl border border-border"><Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No users found.</p></div>}
    </AppLayout>
  );
}
