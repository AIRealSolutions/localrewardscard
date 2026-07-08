import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, MapPin } from "lucide-react";

export default function AdminMerchants() {
  const { data: merchants, isLoading } = trpc.admin.getAllMerchants.useQuery({ limit: 100, offset: 0 });

  return (
    <AppLayout title="Merchants">
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Merchants</h2>
        <p className="text-muted-foreground">
          Merchants are managed on MagicFishbowl — this is a read-only view of live merchants in the network.
        </p>
      </div>
      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : merchants && merchants.length > 0 ? (
        <div className="space-y-3">
          {merchants.map(m => (
            <div key={m.id} className="bg-card rounded-2xl border border-border p-5 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-serif text-xl font-bold flex-shrink-0">
                {m.businessName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-foreground">{m.businessName}</h3>
                  <Badge variant="secondary" className="text-xs capitalize">{m.subscriptionTier}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">{m.category}</div>
                {m.address && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3" />{m.address}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-2xl border border-border text-muted-foreground">
          <Store className="w-8 h-8 mx-auto mb-2" />No live merchants yet.
        </div>
      )}
    </AppLayout>
  );
}
