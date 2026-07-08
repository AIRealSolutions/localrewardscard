import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, Users, TrendingUp, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { data: stats, isLoading } = trpc.admin.getStats.useQuery();

  return (
    <AppLayout title="Admin Overview">
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Platform Overview</h2>
        <p className="text-muted-foreground">Monitor the health and growth of the Local Rewards network.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Live Merchants", value: stats?.liveMerchants ?? 0, icon: <Store className="w-5 h-5" />, color: "text-primary", href: "/admin/businesses" },
            { label: "Total Merchants", value: stats?.totalMerchants ?? 0, icon: <Gift className="w-5 h-5" />, color: "text-amber-500", href: "/admin/businesses" },
            { label: "Members", value: stats?.totalMembers ?? 0, icon: <Users className="w-5 h-5" />, color: "text-emerald-500", href: "/admin/businesses" },
            { label: "Points Issued", value: (stats?.totalPointsIssued ?? 0).toLocaleString(), icon: <TrendingUp className="w-5 h-5" />, color: "text-violet-500", href: "/admin/businesses" },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-5 shadow-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(s.href)}>
              <div className={cn("mb-3", s.color)}>{s.icon}</div>
              <div className="text-2xl font-semibold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-5 shadow-card max-w-sm">
        <div className="text-rose-500 mb-3"><TrendingUp className="w-5 h-5" /></div>
        <div className="text-2xl font-semibold text-foreground">{(stats?.totalRedemptions ?? 0).toLocaleString()}</div>
        <div className="text-sm text-muted-foreground mt-0.5">Confirmed Redemptions</div>
      </div>
    </AppLayout>
  );
}
