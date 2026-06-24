import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { Star, TrendingUp, Gift, Compass, ArrowRight, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const TIER_COLORS: Record<string, string> = {
  bronze: "card-bronze", silver: "card-silver", gold: "card-gold", platinum: "card-platinum",
};
const TIER_NEXT: Record<string, { next: string; needed: number }> = {
  bronze: { next: "Silver", needed: 500 }, silver: { next: "Gold", needed: 1500 },
  gold: { next: "Platinum", needed: 5000 }, platinum: { next: "Platinum", needed: 5000 },
};

export default function ConsumerDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: cards, isLoading } = trpc.consumer.getMyCards.useQuery();
  const totalPoints = cards?.reduce((sum, { card }) => sum + card.pointsBalance, 0) ?? 0;

  return (
    <AppLayout title="My Rewards">
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Welcome back, {user?.name?.split(" ")[0] ?? "there"} 👋</h2>
        <p className="text-muted-foreground">Here's your loyalty card portfolio.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total Points", value: totalPoints.toLocaleString(), icon: <Star className="w-5 h-5" />, color: "text-amber-500" },
          { label: "Active Cards", value: cards?.length ?? 0, icon: <Gift className="w-5 h-5" />, color: "text-primary" },
          { label: "Businesses", value: cards?.length ?? 0, icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-5 shadow-card">
            <div className={cn("mb-3", stat.color)}>{stat.icon}</div>
            <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-serif text-xl font-semibold text-foreground">Your Loyalty Cards</h3>
        <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/discover")}>
          <Compass className="w-4 h-4 mr-1.5" /> Discover More
        </Button>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{[1,2].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
      ) : cards && cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map(({ card, business }) => {
            if (!business) return null;
            const tierColor = TIER_COLORS[card.tier] ?? "card-bronze";
            const nextTier = TIER_NEXT[card.tier] ?? { next: "Platinum", needed: 5000 };
            const progress = card.tier === "platinum" ? 100 : Math.min(100, (card.lifetimePoints / nextTier.needed) * 100);
            return (
              <div key={card.id} className="group cursor-pointer" onClick={() => navigate(`/card/${business.id}`)}>
                <div className={cn("relative rounded-2xl p-6 shadow-lg overflow-hidden transition-transform duration-200 group-hover:scale-[1.02]", tierColor)}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                  <div className="flex items-start justify-between mb-8">
                    <div><div className="text-white/70 text-xs uppercase tracking-widest mb-1">Local Rewards</div><div className="text-white font-serif text-xl font-semibold">{business.name}</div></div>
                    <Badge className="bg-white/20 text-white border-0 text-xs capitalize">{card.tier}</Badge>
                  </div>
                  <div className="flex items-end justify-between">
                    <div><div className="text-white/70 text-xs uppercase tracking-widest mb-1">Points Balance</div><div className="text-white text-3xl font-semibold">{card.pointsBalance.toLocaleString()}</div></div>
                    <div className="text-right"><div className="text-white/70 text-xs uppercase tracking-widest mb-1">Visits</div><div className="text-white text-xl font-semibold">{card.visitCount}</div></div>
                  </div>
                  <div className="mt-4">
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white/70 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
                    {card.tier !== "platinum" && <div className="text-white/60 text-xs mt-1.5">{(nextTier.needed - card.lifetimePoints).toLocaleString()} pts to {nextTier.next}</div>}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between px-1">
                  <div className="text-sm text-muted-foreground">{business.category ?? "Local Business"}</div>
                  <div className="flex items-center gap-1 text-sm text-primary font-medium">View <ArrowRight className="w-3 h-3" /></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><Award className="w-8 h-8 text-primary" /></div>
          <h3 className="font-serif text-xl font-semibold text-foreground mb-2">No Cards Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-xs mx-auto">Discover local businesses and start earning rewards on every visit.</p>
          <Button className="rounded-full" onClick={() => navigate("/discover")}><Compass className="w-4 h-4 mr-2" /> Explore Businesses</Button>
        </div>
      )}
    </AppLayout>
  );
}
