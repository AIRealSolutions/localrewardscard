import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Store, Users, TrendingUp, Gift, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { data: stats, isLoading } = trpc.admin.getStats.useQuery();
  const { data: pending } = trpc.admin.getPendingBusinesses.useQuery();

  return (
    <AppLayout title="Admin Overview">
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Platform Overview</h2>
        <p className="text-muted-foreground">Monitor the health and growth of the Local Rewards network.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Businesses", value: stats?.totalBusinesses ?? 0, icon: <Store className="w-5 h-5" />, color: "text-primary", href: "/admin/businesses" },
            { label: "Pending Approval", value: pending?.length ?? 0, icon: <AlertCircle className="w-5 h-5" />, color: "text-amber-500", href: "/admin/businesses" },
            { label: "Total Users", value: stats?.totalUsers ?? 0, icon: <Users className="w-5 h-5" />, color: "text-emerald-500", href: "/admin/users" },
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

      {/* Additional stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
          <div className="text-violet-500 mb-3"><Gift className="w-5 h-5" /></div>
          <div className="text-2xl font-semibold text-foreground">{(stats?.totalCards ?? 0).toLocaleString()}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Loyalty Cards Issued</div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
          <div className="text-rose-500 mb-3"><TrendingUp className="w-5 h-5" /></div>
          <div className="text-2xl font-semibold text-foreground">{(stats?.totalRedemptions ?? 0).toLocaleString()}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Total Redemptions</div>
        </div>
      </div>

      {/* Pending approvals quick action */}
      {pending && pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-900">{pending.length} Business{pending.length > 1 ? "es" : ""} Awaiting Approval</h3>
            </div>
            <Button size="sm" className="rounded-full gap-1.5 bg-amber-600 hover:bg-amber-700" onClick={() => navigate("/admin/businesses")}>
              Review <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-2">
            {pending.slice(0, 3).map(biz => (
              <div key={biz.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-amber-100">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-serif font-bold text-sm flex-shrink-0">{biz.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900">{biz.name}</div>
                  <div className="text-xs text-gray-500">{biz.category ?? "Business"} · {[biz.city, biz.state].filter(Boolean).join(", ")}</div>
                </div>
              </div>
            ))}
            {pending.length > 3 && <p className="text-xs text-amber-700 pl-1">+{pending.length - 3} more awaiting review</p>}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
