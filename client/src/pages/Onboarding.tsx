import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Star, Store, ExternalLink, User } from "lucide-react";

// New users (no merchants row) go to /biz which shows signup form by default
const MAGICFISHBOWL_SIGNUP_URL = "https://magicfishbowl.com/biz";
// Existing business owners (have merchants row) go to login
const MAGICFISHBOWL_BIZ_LOGIN_URL = "https://magicfishbowl.com/biz?login=1";

export default function Onboarding() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "admin") navigate("/admin");
    else if (user.role === "consumer") navigate("/dashboard");
  }, [loading, user, navigate]);

  if (loading || !user) return null;

  const isBusinessOwner = user.role === "business_owner";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Star className="w-5 h-5 text-primary-foreground fill-current" />
          </div>
          <span className="font-serif text-2xl font-semibold text-foreground">Local Rewards</span>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
          {isBusinessOwner ? <Store className="w-8 h-8" /> : <User className="w-8 h-8" />}
        </div>

        {isBusinessOwner ? (
          <>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-3">Manage your business on MagicFishbowl</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Local Rewards Card is where your customers track their points. Your business dashboard — offers,
              staff, campaigns, billing — lives on MagicFishbowl.
            </p>
            <Button asChild size="lg" className="rounded-full h-12 text-base font-semibold">
              <a href={MAGICFISHBOWL_BIZ_LOGIN_URL} target="_blank" rel="noopener noreferrer">
                Go to MagicFishbowl <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </>
        ) : (
          <>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-3">Finish setting up on MagicFishbowl</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              We couldn't find a Local Rewards membership for your account yet. Join on MagicFishbowl — it takes a
              minute — and you'll be able to sign in here right away.
            </p>
            <Button asChild size="lg" className="rounded-full h-12 text-base font-semibold">
              <a href={MAGICFISHBOWL_SIGNUP_URL} target="_blank" rel="noopener noreferrer">
                Join on MagicFishbowl <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
