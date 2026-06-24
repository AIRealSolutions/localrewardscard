import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Gift, Clock, CheckCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TIER_COLORS: Record<string, string> = {
  bronze: "card-bronze", silver: "card-silver", gold: "card-gold", platinum: "card-platinum",
};

export default function ConsumerCard() {
  const params = useParams<{ businessId: string }>();
  const businessId = parseInt(params.businessId ?? "0");
  const [, navigate] = useLocation();
  const { data, isLoading } = trpc.consumer.getAvailableOffers.useQuery({ businessId });
  const { data: cards } = trpc.consumer.getMyCards.useQuery();
  const cardData = cards?.find(c => c.business?.id === businessId);
  const redeemMutation = trpc.consumer.redeemOffer.useMutation({
    onSuccess: (res) => toast.success(`Redeemed! Code: ${res.confirmationCode}`),
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <AppLayout title="Loyalty Card"><Skeleton className="h-64 rounded-2xl" /></AppLayout>;
  if (!cardData) return <AppLayout title="Loyalty Card"><div className="text-center py-20 text-muted-foreground">Card not found.</div></AppLayout>;

  const { card, business } = cardData;
  const tierColor = TIER_COLORS[card.tier] ?? "card-bronze";

  return (
    <AppLayout title={business?.name ?? "Loyalty Card"}>
      <Button variant="ghost" size="sm" className="mb-6 -ml-2" onClick={() => navigate("/dashboard")}>
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
      </Button>
      <div className="max-w-md mx-auto">
        <div className={cn("relative rounded-3xl p-8 shadow-xl overflow-hidden mb-8", tierColor)}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent pointer-events-none" />
          <div className="text-white/70 text-xs uppercase tracking-widest mb-1">Local Rewards</div>
          <div className="text-white font-serif text-2xl font-semibold mb-6">{business?.name}</div>
          <div className="flex items-end justify-between mb-6">
            <div><div className="text-white/70 text-xs uppercase tracking-widest mb-1">Points Balance</div><div className="text-white text-4xl font-semibold">{card.pointsBalance.toLocaleString()}</div></div>
            <div className="text-right"><div className="text-white/70 text-xs uppercase tracking-widest mb-1">Tier</div><Badge className="bg-white/20 text-white border-0 capitalize text-sm">{card.tier}</Badge></div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[{label:"Lifetime Pts", val: card.lifetimePoints.toLocaleString()},{label:"Visits", val: card.visitCount},{label:"Card #", val: card.cardNumber?.slice(-6) ?? "—"}].map(s => (
              <div key={s.label}><div className="text-white/60 text-xs uppercase tracking-widest">{s.label}</div><div className="text-white font-semibold mt-0.5">{s.val}</div></div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-serif text-xl font-semibold text-foreground mb-4">Available Rewards</h3>
          {data?.offers && data.offers.length > 0 ? (
            <div className="space-y-3">
              {data.offers.map(offer => {
                const canRedeem = card.pointsBalance >= offer.pointsRequired;
                return (
                  <div key={offer.id} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", canRedeem ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground")}>
                      <Gift className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground">{offer.title}</div>
                      <div className="text-sm text-muted-foreground">{offer.description}</div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 font-medium"><Star className="w-3 h-3 fill-current" />{offer.pointsRequired.toLocaleString()} pts</div>
                    </div>
                    <Button size="sm" variant={canRedeem ? "default" : "outline"} disabled={!canRedeem || redeemMutation.isPending} className="rounded-full flex-shrink-0" onClick={() => redeemMutation.mutate({ offerId: offer.id, businessId })}>
                      {canRedeem ? "Redeem" : "Need more pts"}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-card rounded-2xl border border-border text-muted-foreground">No rewards available yet.</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
