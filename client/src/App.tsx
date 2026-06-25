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

// Business pages
import BusinessDashboard from "./pages/business/Dashboard";
import BusinessCustomers from "./pages/business/Customers";
import BusinessOffers from "./pages/business/Offers";
import BusinessMilestones from "./pages/business/Milestones";
import BusinessCampaigns from "./pages/business/Campaigns";
import BusinessSettings from "./pages/business/Settings";
import BusinessRewards from "./pages/business/Rewards";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminBusinesses from "./pages/admin/Businesses";
import AdminUsers from "./pages/admin/Users";

// ─── Route Guards ─────────────────────────────────────────────────────────────
type AllowedRole = "consumer" | "business_owner" | "admin";

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
    if (!user.onboardingComplete) {
      navigate("/onboarding");
      return;
    }
    if (!allowedRoles.includes(user.role as AllowedRole)) {
      // Redirect to the correct home for their role
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "business_owner") navigate("/business");
      else navigate("/dashboard");
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
      <Route path="/directory" component={BusinessDirectory} />

      {/* Onboarding — consumer path only; business owners are redirected to magicfishbowl.com */}
      <Route path="/onboarding" component={Onboarding} />

      {/* Public business info page */}
      <Route path="/for-businesses" component={ForBusinesses} />

      {/* Consumer — only accessible to consumers */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={ConsumerDashboard} allowedRoles={["consumer"]} />}
      </Route>
      <Route path="/card/:businessId">
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

      {/* Business — only accessible to business_owner */}
      <Route path="/business">
        {() => <ProtectedRoute component={BusinessDashboard} allowedRoles={["business_owner"]} />}
      </Route>
      <Route path="/business/customers">
        {() => <ProtectedRoute component={BusinessCustomers} allowedRoles={["business_owner"]} />}
      </Route>
      <Route path="/business/offers">
        {() => <ProtectedRoute component={BusinessOffers} allowedRoles={["business_owner"]} />}
      </Route>
      <Route path="/business/rewards">
        {() => <ProtectedRoute component={BusinessRewards} allowedRoles={["business_owner"]} />}
      </Route>
      <Route path="/business/milestones">
        {() => <ProtectedRoute component={BusinessMilestones} allowedRoles={["business_owner"]} />}
      </Route>
      <Route path="/business/campaigns">
        {() => <ProtectedRoute component={BusinessCampaigns} allowedRoles={["business_owner"]} />}
      </Route>
      <Route path="/business/settings">
        {() => <ProtectedRoute component={BusinessSettings} allowedRoles={["business_owner"]} />}
      </Route>

      {/* Admin — only accessible to admin */}
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/businesses">
        {() => <ProtectedRoute component={AdminBusinesses} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/users">
        {() => <ProtectedRoute component={AdminUsers} allowedRoles={["admin"]} />}
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
