import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getLoginUrl } from "@/const";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { trpc } from "@/lib/trpc";
import { ArrowRight, ExternalLink, MapPin, Search, Star } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function BusinessDirectory() {
  useDocumentTitle("Find Local Businesses | Local Rewards");
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const { data: businesses, isLoading } = trpc.business.getApproved.useQuery({ limit: 50, offset: 0 });

  const filtered = businesses?.filter(b =>
    !search || b.name.toLowerCase().includes(search.toLowerCase()) || (b.category ?? "").toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 glass border-b border-border/60">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Star className="w-4 h-4 text-primary-foreground fill-current" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">Local Rewards</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/for-businesses")} className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              For Businesses
            </button>
            <Button asChild size="sm" className="rounded-full px-5">
              <a href={getLoginUrl()}>Get Your Card</a>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-16">
        <div className="max-w-2xl mb-10">
          <h1 className="font-serif text-4xl font-semibold text-foreground mb-3">Find Local Businesses</h1>
          <p className="text-muted-foreground">
            Every business below is part of the Local Rewards network — earn points at each one with your free card.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[240px] max-w-md">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(biz => (
              <a
                key={biz.id}
                href={getLoginUrl()}
                className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-md transition-shadow group block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-serif text-xl font-bold">{biz.name[0]}</div>
                  <Badge variant="secondary" className="text-xs">{biz.category ?? "Business"}</Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{biz.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{biz.description ?? "A participating Local Rewards business."}</p>
                {(biz.city || biz.state) && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />{[biz.city, biz.state].filter(Boolean).join(", ")}
                  </div>
                )}
                <div className="mt-3 flex items-center gap-1 text-xs text-amber-600 font-medium">
                  <Star className="w-3 h-3 fill-current" />{Number(biz.pointsPerDollar).toFixed(0)} pt per $1 spent
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No businesses found{search ? ` for "${search}"` : ""}.</p>
          </div>
        )}

        <div className="mt-16 bg-secondary/30 rounded-2xl p-8 text-center">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">Don't see your favorite spot?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            New businesses join the network every week. Get your free card now so you're ready to earn the moment they do.
          </p>
          <Button asChild size="lg" className="rounded-full px-8 h-12 text-base font-semibold">
            <a href={getLoginUrl()}>Get Your Free Card <ArrowRight className="ml-2 w-4 h-4" /></a>
          </Button>
        </div>
      </div>

      {/* ─── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-10 bg-secondary/10 mt-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Star className="w-3 h-3 text-primary-foreground fill-current" />
            </div>
            <span className="font-serif text-sm font-medium text-foreground">Local Rewards</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Local Rewards. Supporting local commerce, one visit at a time.
          </p>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <button onClick={() => navigate("/for-businesses")} className="hover:text-foreground transition-colors">For Businesses</button>
            <a href="https://magicfishbowl.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">MagicFishbowl</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
