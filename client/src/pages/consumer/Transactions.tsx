import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpCircle, ArrowDownCircle, Gift, Star, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

const TX_ICONS: Record<string, React.ReactNode> = {
  earn: <ArrowUpCircle className="w-5 h-5 text-emerald-500" />,
  redeem: <Gift className="w-5 h-5 text-primary" />,
  bonus: <Star className="w-5 h-5 text-amber-500" />,
  expire: <Clock className="w-5 h-5 text-muted-foreground" />,
  adjust: <ArrowDownCircle className="w-5 h-5 text-orange-400" />,
};

const TX_COLORS: Record<string, string> = {
  earn: "text-emerald-600",
  bonus: "text-amber-600",
  redeem: "text-primary",
  expire: "text-muted-foreground",
  adjust: "text-orange-500",
};

export default function ConsumerTransactions() {
  const { data: cards, isLoading: cardsLoading } = trpc.consumer.getMyCards.useQuery();
  const [selectedCardId, setSelectedCardId] = useState<string>("all");

  const cardOptions = useMemo(() => cards?.map(({ card, business }) => ({
    id: card.id,
    label: business?.name ?? `Card #${card.id}`,
  })) ?? [], [cards]);

  // Aggregate transactions across all cards or a specific one
  const firstCardId = cards?.[0]?.card.id;
  const resolvedCardId = selectedCardId !== "all" ? parseInt(selectedCardId) : firstCardId;
  const { data: txData, isLoading: txLoading } = trpc.consumer.getTransactions.useQuery(
    { cardId: resolvedCardId ?? 0 },
    { enabled: !cardsLoading && !!resolvedCardId }
  );

  const isLoading = cardsLoading || txLoading;

  return (
    <AppLayout title="Transaction History">
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Transaction History</h2>
        <p className="text-muted-foreground">A full record of your points earned and redeemed.</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-6">
        <Select value={selectedCardId} onValueChange={setSelectedCardId}>
          <SelectTrigger className="w-56 rounded-xl h-10">
            <SelectValue placeholder="All businesses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Businesses</SelectItem>
            {cardOptions.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
      ) : txData && txData.length > 0 ? (
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          {txData.map((tx, idx) => (
            <div
              key={tx.id}
              className={cn(
                "flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors",
                idx > 0 && "border-t border-border"
              )}
            >
              <div className="flex-shrink-0">{TX_ICONS[tx.type] ?? TX_ICONS.earn}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">{tx.description ?? tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {tx.businessId && <span className="mr-2">Business #{tx.businessId}</span>}
                  {new Date(tx.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
              {tx.amountSpent && (
                <div className="text-xs text-muted-foreground flex-shrink-0">${Number(tx.amountSpent).toFixed(2)}</div>
              )}
              <div className={cn("font-semibold text-sm flex-shrink-0 min-w-[60px] text-right", TX_COLORS[tx.type] ?? "text-foreground")}>
                {tx.points > 0 ? "+" : ""}{tx.points.toLocaleString()} pts
              </div>
              <Badge variant="outline" className="text-xs capitalize flex-shrink-0">{tx.type}</Badge>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No transactions yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Visit a participating business to start earning points.</p>
        </div>
      )}
    </AppLayout>
  );
}
