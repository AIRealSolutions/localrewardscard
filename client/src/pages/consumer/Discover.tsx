import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { Search, MapPin, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function ConsumerDiscover() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const { data: merchants, isLoading } = trpc.merchants.getLive.useQuery({ limit: 50, offset: 0 });

  const filtered = merchants?.filter(m =>
    !search || m.businessName.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <AppLayout title="Discover Businesses">
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">Local Business Directory</h2>
        <p className="text-muted-foreground">Discover participating businesses and start earning rewards.</p>
      </div>
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search businesses or categories..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl" />
        </div>
        <Button variant="outline" className="rounded-xl h-11 gap-2" asChild>
          <a href="https://magicfishbowl.com" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" /> MagicFishbowl
          </a>
        </Button>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(merchant => (
            <div key={merchant.id} className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate(`/card/${merchant.id}`)}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-serif text-xl font-bold">{merchant.businessName[0]}</div>
                <Badge variant="secondary" className="text-xs">{merchant.category}</Badge>
              </div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{merchant.businessName}</h3>
              {merchant.address && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />{merchant.address}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No businesses found{search ? ` for "${search}"` : ""}.</p>
        </div>
      )}
    </AppLayout>
  );
}
