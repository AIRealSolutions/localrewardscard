import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  ArrowRight, Star, Users, Mail, Phone, Share2,
  BarChart3, Gift, TrendingUp, CheckCircle, ExternalLink, MapPin
} from "lucide-react";
import { useLocation } from "wouter";

const MAGICFISHBOWL_URL = "https://magicfishbowl.com";
const MAGICFISHBOWL_ENROLL_URL = "https://magicfishbowl.com/enroll";

const features = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Build Your Customer List",
    desc: "Every consumer who earns points at your business is automatically added to your customer list. No manual data entry.",
  },
  {
    icon: <Gift className="w-6 h-6" />,
    title: "Create Custom Rewards & Offers",
    desc: "Design your own offers — percentage discounts, free services, or exclusive perks — redeemable with points.",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Patronage Milestones",
    desc: "Automatically reward customers who hit visit milestones. Celebrate loyalty with bonus points and surprise perks.",
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email Campaigns",
    desc: "Compose and send targeted email campaigns to your customer list directly from your back-office portal.",
  },
  {
    icon: <Phone className="w-6 h-6" />,
    title: "SMS Messaging",
    desc: "Reach customers instantly with SMS messages. Perfect for flash offers, event reminders, and re-engagement.",
  },
  {
    icon: <Share2 className="w-6 h-6" />,
    title: "Social Media Posts",
    desc: "Build and preview social posts for Facebook, Instagram, Twitter/X, and Nextdoor — then share in one click.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Dashboard Analytics",
    desc: "Track points issued, redemptions, customer growth, and campaign performance from one clean dashboard.",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "MagicFishbowl Discovery",
    desc: "Your business is automatically listed on magicfishbowl.com, surfacing you to local consumers before they even visit.",
  },
];

const steps = [
  { step: "01", title: "Enroll on MagicFishbowl", desc: "Create your business profile on magicfishbowl.com. It's the gateway to the entire Local Rewards network." },
  { step: "02", title: "Get Approved", desc: "Our team reviews your listing to ensure quality. Most businesses are approved within 24 hours." },
  { step: "03", title: "Access Your Portal", desc: "Log in to your Local Rewards back-office. Your customer tools, campaign composer, and analytics are ready to go." },
  { step: "04", title: "Start Rewarding", desc: "Issue points at the point of sale, create offers, and watch your loyal customer base grow." },
];

export default function ForBusinesses() {
  useDocumentTitle("For Businesses — Build Customer Loyalty | Local Rewards");
  const [, navigate] = useLocation();

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
            <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              For Consumers
            </button>
            <Button asChild size="sm" className="rounded-full px-5">
              <a href={MAGICFISHBOWL_ENROLL_URL} target="_blank" rel="noopener noreferrer">
                Enroll Your Business
              </a>
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-accent/8 pointer-events-none" />
        <div className="container py-24 md:py-32">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1.5 text-xs font-medium tracking-widest uppercase">
              For Local Businesses
            </Badge>
            <h1 className="text-5xl md:text-6xl font-serif font-semibold text-foreground mb-6 leading-[1.1]">
              Turn Every Visit<br />
              <span className="text-primary">Into a Loyal Customer</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
              Join the Local Rewards network and get a complete back-office toolkit — customer management,
              custom rewards, campaigns, and analytics — all powered through MagicFishbowl.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-8 h-12 text-base font-semibold shadow-lg">
                <a href={MAGICFISHBOWL_ENROLL_URL} target="_blank" rel="noopener noreferrer">
                  Enroll on MagicFishbowl <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12 text-base">
                <a href={MAGICFISHBOWL_URL} target="_blank" rel="noopener noreferrer">
                  Learn About MagicFishbowl
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why Local Rewards ────────────────────────────────────────────────── */}
      <section className="py-6 border-y border-border bg-secondary/20">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
            {["No per-transaction fees", "Automatic customer list building", "Email, SMS & social tools included", "Listed on MagicFishbowl discovery"].map(item => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full text-xs uppercase tracking-widest">Back-Office Tools</Badge>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
              Everything You Need to<br />Build Customer Loyalty
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your Local Rewards back-office portal gives you professional-grade tools without the enterprise price tag.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 shadow-card border border-border/60 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How to Join ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full text-xs uppercase tracking-widest">Getting Started</Badge>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
              How to Join the Network
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Business enrollment is handled through MagicFishbowl — our partner discovery platform.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="bg-card rounded-2xl p-7 shadow-card border border-border/60">
                <div className="text-5xl font-serif font-bold text-primary/10 mb-4 leading-none">{s.step}</div>
                <h3 className="text-base font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MagicFishbowl Callout ────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="bg-primary rounded-3xl p-10 md:p-14 text-primary-foreground text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
              Enrollment is Through MagicFishbowl
            </h2>
            <p className="text-primary-foreground/80 mb-8 text-base leading-relaxed max-w-xl mx-auto">
              MagicFishbowl is our sister platform for local business discovery and onboarding.
              Create your profile there to join the Local Rewards network and unlock your back-office portal.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="rounded-full px-8 h-12 text-base font-semibold">
                <a href={MAGICFISHBOWL_ENROLL_URL} target="_blank" rel="noopener noreferrer">
                  Start Enrollment on MagicFishbowl <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <a href={MAGICFISHBOWL_URL} target="_blank" rel="noopener noreferrer">
                  Visit MagicFishbowl.com <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </div>
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
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Local Rewards. Supporting local commerce, one visit at a time.
          </p>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">For Consumers</button>
            <a href="/directory" className="hover:text-foreground transition-colors">Find Businesses</a>
            <a href={MAGICFISHBOWL_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">MagicFishbowl</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
