import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { supabase } from "@/lib/supabase";
import { Star, ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Mode = "sign-in" | "sign-up";

export default function Login() {
  useDocumentTitle("Sign In | Local Rewards");
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handlePasswordAuth = async () => {
    if (!email.trim() || !password) return;
    setSubmitting(true);
    try {
      const { error } =
        mode === "sign-in"
          ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
          : await supabase.auth.signUp({ email: email.trim(), password });

      if (error) throw error;
      window.location.href = "/";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setMagicLinkSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Star className="w-5 h-5 text-primary-foreground fill-current" />
          </div>
          <span className="font-serif text-2xl font-semibold text-foreground">Local Rewards</span>
        </div>

        {magicLinkSent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">Check your email</h2>
            <p className="text-muted-foreground text-sm">
              We sent a sign-in link to <span className="text-foreground font-medium">{email}</span>.
            </p>
            <Button variant="ghost" className="mt-6 rounded-full" onClick={() => setMagicLinkSent(false)}>
              ← Back
            </Button>
          </div>
        ) : (
          <>
            <h2 className="font-serif text-3xl font-semibold text-foreground text-center mb-2">
              {mode === "sign-in" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-muted-foreground text-center mb-10">
              {mode === "sign-in" ? "Sign in to access your rewards card." : "Join free and start earning rewards."}
            </p>

            <div className="space-y-5 mb-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium mb-2 block">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-sm font-medium mb-2 block">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl"
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordAuth()}
                />
              </div>
            </div>

            <Button
              className="w-full rounded-full h-12 text-base font-semibold mb-3"
              disabled={!email.trim() || !password || submitting}
              onClick={handlePasswordAuth}
            >
              {submitting ? "Please wait..." : mode === "sign-in" ? "Sign In" : "Create Account"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full rounded-full h-11"
              disabled={!email.trim() || submitting}
              onClick={handleMagicLink}
            >
              <Mail className="mr-2 w-4 h-4" /> Email me a magic link
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-8">
              {mode === "sign-in" ? "New to Local Rewards?" : "Already have an account?"}{" "}
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
              >
                {mode === "sign-in" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
