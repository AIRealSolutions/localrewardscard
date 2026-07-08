import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Clock, AlertTriangle, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending_pin: <Clock className="w-4 h-4 text-amber-500" />,
  confirmed: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  flagged: <AlertTriangle className="w-4 h-4 text-destructive" />,
};

const STATUS_LABELS: Record<string, string> = {
  pending_pin: "Pending",
  confirmed: "Confirmed",
  flagged: "Flagged",
};

export default function ConsumerRedemptions() {
  const { data: redemptions, isLoading } = trpc.consumer.getRedemptions.useQuery();

  return (
    <AppLayout title="My Redemptions">
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Redemption History</h2>
        <p className="text-muted-foreground">Offers you've redeemed at participating businesses.</p>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : redemptions && redemptions.length > 0 ? (
        <div className="space-y-3">
          {redemptions.map(r => (
            <div key={r.id} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground">{r.offerTitle ?? "Offer"}</div>
                <div className="text-sm text-muted-foreground">{r.merchantName ?? "Business"}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{new Date(r.scannedAt).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {STATUS_ICONS[r.status]}
                <Badge variant="outline" className={cn("text-xs capitalize", r.status === "confirmed" ? "border-emerald-200 text-emerald-700" : r.status === "flagged" ? "border-red-200 text-red-700" : "border-amber-200 text-amber-700")}>
                  {STATUS_LABELS[r.status] ?? r.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No redemptions yet. Start earning and redeeming rewards!</p>
        </div>
      )}
    </AppLayout>
  );
}
