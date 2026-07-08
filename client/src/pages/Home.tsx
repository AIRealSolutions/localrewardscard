import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLocation } from "wouter";
import {
  ArrowRight, Star, Gift, TrendingUp, MapPin, CheckCircle,
  CreditCard, Sparkles, ShieldCheck, ExternalLink, ChevronRight
} from "lucide-react";
import { useEffect } from "react";

const MAGICFISHBOWL_URL = "https://magicfishbowl.com";
const MAGICFISHBOWL_ENROLL_URL = "https://magicfishbowl.com/biz";

export default function Home() {
  useDocumentTitle("Local Rewards — Free Loyalty Card for Local Businesses");
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "consumer") {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    }
  }, [loading, isAuthenticated, user, navigate]);

  const howItWorks = [
    {
      step: "01",
      icon: <CreditCard className="w-6 h-6" />,
      title: "Get Your Free Card",
      desc: "Sign up in seconds. Your universal Local Rewards card is instantly available — no plastic, no wallet clutter.",
    },
    {
      step: "02",
      icon: <MapPin className="w-6 h-6" />,
      title: "Shop Local",
      desc: "Visit any participating business in the network. Every dollar you spend earns points toward real rewards.",
    },
    {
      step: "03",
      icon: <Gift className="w-6 h-6" />,
      title: "Earn & Redeem",
      desc: "Accumulate points across every business. Redeem for discounts, free services, and exclusive member perks.",
    },
    {
      step: "04",
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Unlock Higher Tiers",
      desc: "The more you support local, the more you're rewarded. Rise through Bronze, Silver, Gold, and Platinum.",
    },
  ];

  const tiers = [
    { name: "Bronze", color: "card-bronze", points: "0+", perks: "1 pt per $1 spent", badge: "Start Here" },
    { name: "Silver", color: "card-silver", points: "500+", perks: "1.25× point multiplier", badge: "Popular" },
    { name: "Gold", color: "card-gold", points: "1,500+", perks: "1.5× bonus + exclusive offers", badge: "Most Rewarding" },
    { name: "Platinum", color: "card-platinum", points: "5,000+", perks: "2× bonus + VIP access", badge: "Elite" },
  ];

  const consumerBenefits = [
    "One card works at every participating local business",
    "Points never expire as long as you stay active",
    "Milestone bonuses celebrate your loyalty automatically",
    "Discover new local businesses through MagicFishbowl",
    "Exclusive member-only offers and early access",
    "Free to join — always",
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
              Find Businesses
            </a>
            <a href="/for-businesses" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              For Businesses
            </a>
            {!loading && (
              <Button asChild size="sm" className="rounded-full px-5">
                <a href={getLoginUrl()}>Get Your Card</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero — Consumer First ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/10 pointer-events-none" />
        {/* Decorative cards — background */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden xl:block pointer-events-none select-none">
          <div className="w-80 h-48 card-gold rounded-2xl shadow-2xl rotate-6 opacity-70" />
          <div className="w-80 h-48 card-platinum rounded-2xl shadow-2xl -rotate-3 -mt-40 -ml-6 opacity-85" />
          <div className="w-80 h-48 card-silver rounded-2xl shadow-xl rotate-12 -mt-36 ml-8 opacity-50" />
        </div>

        <div className="container py-28 md:py-36 relative">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1.5 text-xs font-medium tracking-widest uppercase">
              Free · Universal · Local
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold text-foreground mb-6 leading-[1.1]">
              Your Loyalty.<br />
              <span className="text-primary">Your Rewards.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-lg leading-relaxed">
              One free digital card that earns you points at every participating local business.
              Shop local, build loyalty, and unlock real rewards — automatically.
            </p>
            <p className="text-sm text-muted-foreground mb-10 max-w-md">
              No fees. No plastic. No expiring points. Just genuine rewards for supporting your community.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-8 h-13 text-base font-semibold shadow-lg">
                <a href={getLoginUrl()}>
                  Get Your Free Card <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-13 text-base">
                <a href="/directory">Find Local Businesses</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social Proof Bar ─────────────────────────────────────────────────── */}
      <div className="border-y border-border bg-secondary/20 py-5">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /><span>Always free for consumers</span></div>
            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /><span>Earn across every local business</span></div>
            <div className="flex items-center gap-2"><Gift className="w-4 h-4 text-primary" /><span>Real discounts, real rewards</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /><span>Powered by MagicFishbowl discovery</span></div>
          </div>
        </div>
      </div>

      {/* ─── How It Works ─────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full text-xs uppercase tracking-widest">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
              Start Earning in Minutes
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Getting your Local Rewards card is instant and completely free. Here's how it works.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative bg-card rounded-2xl p-7 shadow-card border border-border/60 hover:shadow-md transition-shadow">
                <div className="text-5xl font-serif font-bold text-primary/10 mb-4 leading-none">{step.step}</div>
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                {i < howItWorks.length - 1 && (
                  <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-border hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Consumer Benefits ────────────────────────────────────────────────── */}
      <section className="py-24 bg-secondary/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4 rounded-full text-xs uppercase tracking-widest">Member Benefits</Badge>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-6">
                Everything You Get<br />as a Member
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Your Local Rewards card is the single most valuable thing you can carry when shopping in your community.
                It works silently in the background, accumulating points and unlocking rewards without any effort on your part.
              </p>
              <ul className="space-y-3">
                {consumerBenefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="rounded-full px-8 mt-8 h-12 text-base">
                <a href={getLoginUrl()}>Join Free Today <ArrowRight className="ml-2 w-4 h-4" /></a>
              </Button>
            </div>
            {/* Visual: stacked loyalty cards */}
            <div className="relative flex justify-center items-center h-72">
              <div className="absolute w-72 h-44 card-bronze rounded-2xl shadow-xl -rotate-6 translate-y-4" />
              <div className="absolute w-72 h-44 card-silver rounded-2xl shadow-xl -rotate-2 translate-y-2" />
              <div className="absolute w-72 h-44 card-gold rounded-2xl shadow-xl rotate-2" />
              <div className="absolute w-72 h-44 card-platinum rounded-2xl shadow-2xl rotate-6 -translate-y-2" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                Four tiers of loyalty
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tier System ──────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full text-xs uppercase tracking-widest">Loyalty Tiers</Badge>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
              The More You Shop Local,<br />The More You Earn
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Progress through four tiers as you accumulate lifetime points. Each tier unlocks greater multipliers and exclusive perks.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {tiers.map((tier) => (
              <div key={tier.name} className="text-center group">
                <div className={`${tier.color} rounded-2xl aspect-[3/2] flex flex-col items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow`}>
                  <span className="text-white font-serif text-2xl font-semibold drop-shadow">{tier.name}</span>
                  <span className="text-white/70 text-xs mt-1">{tier.points} pts</span>
                </div>
                <Badge variant="secondary" className="text-xs mb-2">{tier.badge}</Badge>
                <div className="text-xs text-muted-foreground">{tier.perks}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MagicFishbowl Discovery ──────────────────────────────────────────── */}
      <section className="py-20 bg-secondary/20">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <Badge variant="outline" className="mb-4 rounded-full text-xs uppercase tracking-widest">Discovery Partner</Badge>
              <h2 className="text-3xl font-serif font-semibold text-foreground mb-4">
                Find New Businesses on MagicFishbowl
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Every business in the Local Rewards network is also listed on{" "}
                <a href={MAGICFISHBOWL_URL} target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline underline-offset-2">
                  magicfishbowl.com
                </a>
                {" "}— our sister discovery platform. Browse by neighborhood, category, or interest to find new places to earn rewards.
              </p>
              <Button asChild variant="outline" className="rounded-full gap-2">
                <a href={MAGICFISHBOWL_URL} target="_blank" rel="noopener noreferrer">
                  <MapPin className="w-4 h-4" /> Explore on MagicFishbowl <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </Button>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-primary/15 to-accent/20 flex flex-col items-center justify-center shadow-lg gap-3">
                <MapPin className="w-16 h-16 text-primary/50" />
                <span className="font-serif text-lg font-semibold text-primary/60">MagicFishbowl</span>
                <span className="text-xs text-muted-foreground">Local Business Discovery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Business Teaser (soft CTA → magicfishbowl) ───────────────────────── */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
              Are You a Local Business?
            </h2>
            <p className="text-primary-foreground/80 mb-8 text-base leading-relaxed">
              Join the Local Rewards network through our partner platform, MagicFishbowl.
              Get powerful tools to build customer loyalty, run campaigns, and grow your community presence.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="rounded-full px-8 h-12 text-base font-semibold">
                <a href="/for-businesses">
                  Learn More <ChevronRight className="ml-1 w-4 h-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <a href={MAGICFISHBOWL_ENROLL_URL} target="_blank" rel="noopener noreferrer">
                  Enroll on MagicFishbowl <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final Consumer CTA ───────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-5 opacity-70" />
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of community members already earning rewards at local businesses near you.
              It's free, instant, and yours to keep.
            </p>
            <Button asChild size="lg" className="rounded-full px-10 h-13 text-base font-semibold shadow-lg">
              <a href={getLoginUrl()}>
                Get Your Free Rewards Card <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-10 bg-secondary/10">
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
            <a href="/directory" className="hover:text-foreground transition-colors">Find Businesses</a>
            <a href="/for-businesses" className="hover:text-foreground transition-colors">For Businesses</a>
            <a href={MAGICFISHBOWL_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">MagicFishbowl</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
