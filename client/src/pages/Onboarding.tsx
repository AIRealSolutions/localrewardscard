import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Star, User, Store, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Onboarding() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"role" | "profile">("role");
  const [role, setRole] = useState<"consumer" | "business_owner">("consumer");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  const completeMutation = trpc.auth.completeOnboarding.useMutation({
    onSuccess: () => {
      if (role === "business_owner") {
        navigate("/onboarding/business");
      } else {
        navigate("/dashboard");
      }
    },
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

        {step === "role" && (
          <div>
            <h2 className="font-serif text-3xl font-semibold text-foreground text-center mb-2">Welcome!</h2>
            <p className="text-muted-foreground text-center mb-10">How will you be using Local Rewards?</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setRole("consumer")}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left transition-all duration-200",
                  role === "consumer"
                    ? "border-primary bg-primary/5 shadow-glow"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", role === "consumer" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                  <User className="w-6 h-6" />
                </div>
                <div className="font-semibold text-foreground mb-1">I'm a Customer</div>
                <div className="text-sm text-muted-foreground">Earn points and rewards at local businesses.</div>
              </button>
              <button
                onClick={() => setRole("business_owner")}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left transition-all duration-200",
                  role === "business_owner"
                    ? "border-primary bg-primary/5 shadow-glow"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", role === "business_owner" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                  <Store className="w-6 h-6" />
                </div>
                <div className="font-semibold text-foreground mb-1">I'm a Business</div>
                <div className="text-sm text-muted-foreground">Manage loyalty programs for your customers.</div>
              </button>
            </div>
            <Button className="w-full rounded-full h-12 text-base" onClick={() => setStep("profile")}>
              Continue <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {step === "profile" && (
          <div>
            <h2 className="font-serif text-3xl font-semibold text-foreground text-center mb-2">Your Profile</h2>
            <p className="text-muted-foreground text-center mb-10">Tell us a bit about yourself.</p>
            <div className="space-y-5 mb-8">
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-2 block">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium mb-2 block">Phone Number <span className="text-muted-foreground font-normal">(optional)</span></Label>
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
              <Button variant="outline" className="flex-1 rounded-full h-12" onClick={() => setStep("role")}>
                Back
              </Button>
              <Button
                className="flex-1 rounded-full h-12 text-base"
                disabled={!name.trim() || completeMutation.isPending}
                onClick={() => completeMutation.mutate({ name: name.trim(), phone: phone || undefined, role })}
              >
                {completeMutation.isPending ? "Saving..." : "Get Started"} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
