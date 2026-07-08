import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import { getLoginUrl } from "./const";
import { useEffect } from "react";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import BusinessDirectory from "./pages/BusinessDirectory";

// Onboarding
import Onboarding from "./pages/Onboarding";
import ForBusinesses from "./pages/ForBusinesses";

// Consumer pages
import ConsumerDashboard from "./pages/consumer/Dashboard";
import ConsumerCard from "./pages/consumer/LoyaltyCard";
import ConsumerDiscover from "./pages/consumer/Discover";
import ConsumerRedemptions from "./pages/consumer/Redemptions";
import ConsumerTransactions from "./pages/consumer/Transactions";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMerchants from "./pages/admin/Businesses";

// ─── Route Guards ─────────────────────────────────────────────────────────────
type AllowedRole = "consumer" | "admin";

function ProtectedRoute({
  component: Component,
  allowedRoles,
}: {
  component: React.ComponentType;
  allowedRoles: AllowedRole[];
}) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    if (user.role === "unregistered" || user.role === "business_owner") {
      navigate("/onboarding");
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [loading, user, navigate]);

  if (loading) return null;
  if (!user || !allowedRoles.includes(user.role as AllowedRole)) return null;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/directory" component={BusinessDirectory} />

      {/* Onboarding — role detection + MagicFishbowl redirect for business owners */}
      <Route path="/onboarding" component={Onboarding} />

      {/* Public business info page */}
      <Route path="/for-businesses" component={ForBusinesses} />

      {/* Consumer — only accessible to consumers */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={ConsumerDashboard} allowedRoles={["consumer"]} />}
      </Route>
      <Route path="/card/:merchantId">
        {() => <ProtectedRoute component={ConsumerCard} allowedRoles={["consumer"]} />}
      </Route>
      <Route path="/discover">
        {() => <ProtectedRoute component={ConsumerDiscover} allowedRoles={["consumer"]} />}
      </Route>
      <Route path="/redemptions">
        {() => <ProtectedRoute component={ConsumerRedemptions} allowedRoles={["consumer"]} />}
      </Route>
      <Route path="/transactions">
        {() => <ProtectedRoute component={ConsumerTransactions} allowedRoles={["consumer"]} />}
      </Route>

      {/* Admin — only accessible to admin */}
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/businesses">
        {() => <ProtectedRoute component={AdminMerchants} allowedRoles={["admin"]} />}
      </Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
