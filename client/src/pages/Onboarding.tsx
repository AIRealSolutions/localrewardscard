import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Star, User, Store, ArrowRight, ExternalLink, Gift, TrendingUp, MapPin } from "lucide-react";
import { toast } from "sonner";

const MAGICFISHBOWL_ENROLL_URL = "https://magicfishbowl.com/enroll";

export default function Onboarding() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [view, setView] = useState<"choice" | "consumer-profile" | "business-redirect">("choice");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  const completeMutation = trpc.auth.completeOnboarding.useMutation({
    onSuccess: () => navigate("/dashboard"),
    onError: (e) => toast.error(e.message),
  });

  useEffect(() => {
    if (!loading && user?.onboardingComplete) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "business_owner") navigate("/business");
      else navigate("/dashboard");
    }
  }, [loading, user, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Star className="w-5 h-5 text-primary-foreground fill-current" />
          </div>
          <span className="font-serif text-2xl font-semibold text-foreground">Local Rewards</span>
        </div>

        {/* ── Step 1: Choice ─────────────────────────────────────────────────── */}
        {view === "choice" && (
          <div>
            <h2 className="font-serif text-3xl font-semibold text-foreground text-center mb-2">Welcome!</h2>
            <p className="text-muted-foreground text-center mb-10">What brings you to Local Rewards?</p>

            <div className="grid grid-cols-1 gap-4 mb-8">
              {/* Consumer card */}
              <button
                onClick={() => setView("consumer-profile")}
                className="p-6 rounded-2xl border-2 border-primary bg-primary/5 text-left transition-all duration-200 hover:shadow-md group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground mb-1 flex items-center gap-2">
                      I'm a Customer
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">Earn points and rewards at local businesses.</div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Gift className="w-3 h-3 text-primary" /> Earn points everywhere</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-primary" /> Unlock tier rewards</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" /> Discover local businesses</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Business card — redirects to MagicFishbowl */}
              <button
                onClick={() => setView("business-redirect")}
                className="p-6 rounded-2xl border-2 border-border bg-card text-left transition-all duration-200 hover:border-primary/40 hover:shadow-md group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary text-muted-foreground flex items-center justify-center flex-shrink-0">
                    <Store className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground mb-1 flex items-center gap-2">
                      I'm a Business Owner
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Build customer loyalty and manage your rewards program.
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2a: Consumer Profile ───────────────────────────────────────── */}
        {view === "consumer-profile" && (
          <div>
            <h2 className="font-serif text-3xl font-semibold text-foreground text-center mb-2">Your Profile</h2>
            <p className="text-muted-foreground text-center mb-10">Just a few details to get your rewards card ready.</p>
            <div className="space-y-5 mb-8">
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-2 block">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
                  Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-full h-12" onClick={() => setView("choice")}>
                Back
              </Button>
              <Button
                className="flex-1 rounded-full h-12 text-base"
                disabled={!name.trim() || completeMutation.isPending}
                onClick={() => completeMutation.mutate({ name: name.trim(), phone: phone || undefined, role: "consumer" })}
              >
                {completeMutation.isPending ? "Setting up..." : "Get My Card"} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2b: Business Redirect ─────────────────────────────────────── */}
        {view === "business-redirect" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
              <Store className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-3">
              Business Enrollment
            </h2>
            <p className="text-muted-foreground mb-2 leading-relaxed">
              Business registration for the Local Rewards network is handled through our partner platform,{" "}
              <span className="font-medium text-foreground">MagicFishbowl</span>.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Create your business profile there to join the network and unlock your back-office portal.
            </p>

            <div className="bg-secondary/40 rounded-2xl p-6 mb-8 text-left space-y-3">
              <div className="text-sm font-semibold text-foreground mb-3">What you'll get after enrolling:</div>
              {[
                "Customer list management tools",
                "Custom rewards & offer creator",
                "Email, SMS & social campaigns",
                "Patronage milestone tracking",
                "Dashboard analytics",
                "Listed on MagicFishbowl discovery",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="rounded-full h-12 text-base font-semibold w-full">
                <a href={MAGICFISHBOWL_ENROLL_URL} target="_blank" rel="noopener noreferrer">
                  Enroll on MagicFishbowl <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" className="rounded-full h-10 text-sm" onClick={() => setView("choice")}>
                ← Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
