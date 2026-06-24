import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { ArrowRight, Star, Store, Users, Gift, TrendingUp, CheckCircle, MapPin } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (!user.onboardingComplete) {
        navigate("/onboarding");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "business_owner") {
        navigate("/business");
      } else {
        navigate("/dashboard");
      }
    }
  }, [loading, isAuthenticated, user, navigate]);

  const features = [
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Universal Rewards Card",
      desc: "One digital card that works across all participating local businesses. Earn points everywhere, redeem anywhere.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Long-Term Patronage Rewards",
      desc: "The more you visit, the more you earn. Milestone bonuses celebrate your loyalty with exclusive perks.",
    },
    {
      icon: <Store className="w-6 h-6" />,
      title: "Business Back-Office",
      desc: "Powerful tools for businesses to manage customers, create offers, and run targeted campaigns.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community-First Discovery",
      desc: "Discover local businesses through our partner network at magicfishbowl.com.",
    },
  ];

  const tiers = [
    { name: "Bronze", color: "card-bronze", points: "0+", perks: "1 pt per $1 spent" },
    { name: "Silver", color: "card-silver", points: "500+", perks: "1.25× bonus multiplier" },
    { name: "Gold", color: "card-gold", points: "1,500+", perks: "1.5× bonus + exclusive offers" },
    { name: "Platinum", color: "card-platinum", points: "5,000+", perks: "2× bonus + VIP access" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 glass border-b border-border/60">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Star className="w-4 h-4 text-primary-foreground fill-current" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">Local Rewards</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/directory" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Explore Businesses
            </a>
            {!loading && (
              <Button asChild size="sm" className="rounded-full px-5">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 pointer-events-none" />
        <div className="container py-24 md:py-32">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide uppercase">
              Community Loyalty Platform
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold text-foreground mb-6 leading-tight">
              Reward Every<br />
              <span className="text-primary">Local Visit</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
              A universal rewards card that celebrates long-term patronage with local businesses.
              Earn points, unlock milestones, and build real community connections.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-8 h-12 text-base">
                <a href={getLoginUrl()}>
                  Get Your Card <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12 text-base">
                <a href="/directory">Explore Businesses</a>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative loyalty card */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-8 hidden lg:block">
          <div className="w-80 h-48 card-gold rounded-2xl shadow-xl rotate-6 opacity-80" />
          <div className="w-80 h-48 card-platinum rounded-2xl shadow-xl -rotate-3 -mt-40 -ml-4 opacity-90" />
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
              Built for Communities
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to reward loyalty, grow your customer base, and strengthen local commerce.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-card rounded-2xl p-8 shadow-card border border-border/60 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tier System ──────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
              Four Tiers of Loyalty
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Progress through tiers as you accumulate lifetime points. Each tier unlocks greater rewards and multipliers.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <div key={tier.name} className="text-center">
                <div className={`${tier.color} rounded-2xl aspect-[3/2] flex items-center justify-center mb-4 shadow-md`}>
                  <span className="text-white font-serif text-2xl font-semibold drop-shadow">{tier.name}</span>
                </div>
                <div className="text-sm font-semibold text-foreground">{tier.points} pts</div>
                <div className="text-xs text-muted-foreground mt-1">{tier.perks}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Business CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-5">
              Grow Your Business with Loyalty
            </h2>
            <p className="text-primary-foreground/80 mb-8 text-lg leading-relaxed">
              Join the Local Rewards network and get powerful tools to retain customers,
              run campaigns, and track patronage — all in one back-office portal.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {["Customer list management", "Email & SMS campaigns", "Custom rewards & offers", "Patronage milestones"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-primary-foreground/90">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  {item}
                </div>
              ))}
            </div>
            <Button asChild size="lg" variant="secondary" className="rounded-full px-8 h-12 text-base">
              <a href={getLoginUrl()}>Register Your Business <ArrowRight className="ml-2 w-4 h-4" /></a>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── MagicFishbowl Integration ────────────────────────────────────────── */}
      <section className="py-20 bg-secondary/20">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <Badge variant="outline" className="mb-4 rounded-full text-xs uppercase tracking-wide">
                Powered by
              </Badge>
              <h2 className="text-3xl font-serif font-semibold text-foreground mb-4">
                Discover on MagicFishbowl
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                New businesses joining Local Rewards are automatically surfaced on{" "}
                <a href="https://magicfishbowl.com" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                  magicfishbowl.com
                </a>
                , our partner discovery platform — connecting you with the community before they even walk through your door.
              </p>
              <Button asChild variant="outline" className="rounded-full">
                <a href="https://magicfishbowl.com" target="_blank" rel="noopener noreferrer">
                  <MapPin className="w-4 h-4 mr-2" /> Explore on MagicFishbowl
                </a>
              </Button>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg">
                <MapPin className="w-24 h-24 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Star className="w-3 h-3 text-primary-foreground fill-current" />
            </div>
            <span className="font-serif text-sm font-medium text-foreground">Local Rewards</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Local Rewards. Supporting local commerce, one visit at a time.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="/directory" className="hover:text-foreground transition-colors">Directory</a>
            <a href="https://magicfishbowl.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">MagicFishbowl</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
