import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Gift, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const TIER_COLORS: Record<string, string> = {
  bronze: "card-bronze", silver: "card-silver", gold: "card-gold", platinum: "card-platinum",
};

export default function ConsumerCard() {
  const params = useParams<{ merchantId: string }>();
  const merchantId = params.merchantId ?? "";
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data, isLoading } = trpc.consumer.getAvailableOffers.useQuery({ merchantId }, { enabled: !!merchantId });
  const { data: accounts } = trpc.consumer.getMyCards.useQuery({ enabled: !!user?.member });
  const accountData = accounts?.find(a => a.merchant?.id === merchantId);
  const merchant = accountData?.merchant;

  if (isLoading) return <AppLayout title="Loyalty Card"><Skeleton className="h-64 rounded-2xl" /></AppLayout>;
  if (!merchant && data?.offers) {
    return (
      <AppLayout title="Business Offers">
        <div className="max-w-md mx-auto">
          <Button variant="ghost" size="sm" className="mb-6 -ml-2" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <div className="bg-card rounded-2xl border border-border p-6 mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">Available Offers</h2>
            <p className="text-muted-foreground text-sm">Create an account to redeem these exclusive offers.</p>
          </div>
          <div>
            {data.offers && data.offers.length > 0 ? (
              <div className="space-y-3 mb-8">
                {data.offers.map(offer => (
                  <div key={offer.id} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Gift className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground">{offer.title}</div>
                      <div className="text-sm text-muted-foreground">{offer.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-card rounded-2xl border border-border text-muted-foreground mb-8">No active offers right now.</div>
            )}
            <Button asChild className="w-full rounded-full gap-2">
              <a href="https://magicfishbowl.com/join" target="_blank" rel="noopener noreferrer">
                Accept Offer & Register <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  if (!merchant) return <AppLayout title="Loyalty Card"><div className="text-center py-20 text-muted-foreground">Card not found.</div></AppLayout>;

  const { ...account } = accountData;
  const tierColor = TIER_COLORS[account.tier] ?? "card-bronze";

  return (
    <AppLayout title={merchant.businessName}>
      <Button variant="ghost" size="sm" className="mb-6 -ml-2" onClick={() => navigate("/dashboard")}>
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
      </Button>
      <div className="max-w-md mx-auto">
        <div className={cn("relative rounded-3xl p-8 shadow-xl overflow-hidden mb-8", tierColor)}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent pointer-events-none" />
          <div className="text-white/70 text-xs uppercase tracking-widest mb-1">Local Rewards</div>
          <div className="text-white font-serif text-2xl font-semibold mb-6">{merchant.businessName}</div>
          <div className="flex items-end justify-between mb-6">
            <div><div className="text-white/70 text-xs uppercase tracking-widest mb-1">Points Balance</div><div className="text-white text-4xl font-semibold">{account.pointsBalance.toLocaleString()}</div></div>
            <div className="text-right"><div className="text-white/70 text-xs uppercase tracking-widest mb-1">Tier</div><Badge className="bg-white/20 text-white border-0 capitalize text-sm">{account.tier}</Badge></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            {[{ label: "Lifetime Pts", val: account.lifetimePoints.toLocaleString() }, { label: "Visits", val: account.visitCount }].map(s => (
              <div key={s.label}><div className="text-white/60 text-xs uppercase tracking-widest">{s.label}</div><div className="text-white font-semibold mt-0.5">{s.val}</div></div>
            ))}
          </div>
        </div>

        {user?.member && (
          <div className="bg-card rounded-2xl border border-border p-5 mb-8 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Your Member Code</div>
            <div className="font-mono text-sm text-foreground select-all break-all">{user.member.qrToken}</div>
            <p className="text-xs text-muted-foreground mt-2">Show this in-store, or use your MagicFishbowl card's QR code, to redeem offers.</p>
          </div>
        )}

        <div>
          <h3 className="font-serif text-xl font-semibold text-foreground mb-4">Offers at {merchant.businessName}</h3>
          {data?.offers && data.offers.length > 0 ? (
            <div className="space-y-3">
              {data.offers.map(offer => (
                <div key={offer.id} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">{offer.title}</div>
                    <div className="text-sm text-muted-foreground">{offer.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-card rounded-2xl border border-border text-muted-foreground">No active offers right now.</div>
          )}
          <Button asChild variant="outline" className="w-full rounded-full mt-4 gap-2">
            <a href="https://magicfishbowl.com" target="_blank" rel="noopener noreferrer">
              Redeem on MagicFishbowl <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
