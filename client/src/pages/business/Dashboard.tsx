import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { Users, Gift, TrendingUp, MessageSquare, ArrowRight, AlertCircle } from "lucide-react";

export default function BusinessDashboard() {
  const [, navigate] = useLocation();
  const { data: biz, isLoading: bizLoading } = trpc.business.getMyBusiness.useQuery();
  const { data: stats } = trpc.business.getStats.useQuery();
  if (bizLoading) return <AppLayout title="Dashboard"><Skeleton className="h-40 rounded-2xl" /></AppLayout>;
  if (!biz) return (
    <AppLayout title="Dashboard">
      <div className="text-center py-20 bg-card rounded-2xl border border-border">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">No Business Profile</h3>
        <p className="text-muted-foreground mb-6">Register your business to get started.</p>
        <Button className="rounded-full" onClick={() => navigate("/onboarding/business")}>Register Business</Button>
      </div>
    </AppLayout>
  );
  if (biz.status === "pending") return (
    <AppLayout title="Dashboard">
      <div className="text-center py-20 bg-card rounded-2xl border border-amber-200">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Pending Approval</h3>
        <p className="text-muted-foreground">Your business registration is under review.</p>
      </div>
    </AppLayout>
  );
  return (
    <AppLayout title="Dashboard">
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div><h2 className="font-serif text-2xl font-semibold text-foreground mb-1">{biz.name}</h2><p className="text-muted-foreground">{biz.category ?? "Local Business"} · {[biz.city, biz.state].filter(Boolean).join(", ")}</p></div>
          <Badge variant="secondary" className="capitalize">{biz.status}</Badge>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Customers", value: stats?.customerCount ?? 0, icon: <Users className="w-5 h-5" />, color: "text-primary", href: "/business/customers" },
          { label: "Active Offers", value: stats?.activeOffers ?? 0, icon: <Gift className="w-5 h-5" />, color: "text-emerald-500", href: "/business/offers" },
          { label: "Points Issued", value: (stats?.pointsIssued ?? 0).toLocaleString(), icon: <TrendingUp className="w-5 h-5" />, color: "text-amber-500", href: "/business/rewards" },
          { label: "Campaigns", value: stats?.redemptionCount ?? 0, icon: <MessageSquare className="w-5 h-5" />, color: "text-violet-500", href: "/business/campaigns" },
        ].map(s => (
          <div key={s.label} className={"bg-card rounded-2xl border border-border p-5 shadow-card cursor-pointer hover:shadow-md transition-shadow"} onClick={() => navigate(s.href)}>
            <div className={s.color + " mb-3"}>{s.icon}</div>
            <div className="text-2xl font-semibold text-foreground">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "Manage Customers", desc: "View your customer list, patronage history, and contact details.", href: "/business/customers", icon: <Users className="w-6 h-6" /> },
          { title: "Create Offers", desc: "Design rewards and discounts to incentivize repeat visits.", href: "/business/offers", icon: <Gift className="w-6 h-6" /> },
          { title: "Issue Points", desc: "Manually award points to customers for purchases and visits.", href: "/business/rewards", icon: <TrendingUp className="w-6 h-6" /> },
          { title: "Run Campaigns", desc: "Send email, SMS, and social media campaigns to your customers.", href: "/business/campaigns", icon: <MessageSquare className="w-6 h-6" /> },
        ].map(card => (
          <div key={card.title} className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate(card.href)}>
            <div className="flex items-center gap-4 mb-3"><div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{card.icon}</div><h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{card.title}</h3></div>
            <p className="text-sm text-muted-foreground mb-4">{card.desc}</p>
            <div className="flex items-center gap-1 text-sm text-primary font-medium">Go <ArrowRight className="w-3 h-3" /></div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
