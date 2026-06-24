import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  Star, LayoutDashboard, Store, Users, Gift, MessageSquare, Settings,
  LogOut, ChevronRight, Menu, X, Shield, BarChart3, CreditCard, Compass, Award
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const consumerNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Discover", href: "/discover", icon: <Compass className="w-4 h-4" /> },
  { label: "Transactions", href: "/transactions", icon: <CreditCard className="w-4 h-4" /> },
  { label: "My Redemptions", href: "/redemptions", icon: <Award className="w-4 h-4" /> },
];

const businessNav: NavItem[] = [
  { label: "Dashboard", href: "/business", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Customers", href: "/business/customers", icon: <Users className="w-4 h-4" /> },
  { label: "Offers & Rewards", href: "/business/offers", icon: <Gift className="w-4 h-4" /> },
  { label: "Issue Points", href: "/business/rewards", icon: <CreditCard className="w-4 h-4" /> },
  { label: "Milestones", href: "/business/milestones", icon: <Award className="w-4 h-4" /> },
  { label: "Campaigns", href: "/business/campaigns", icon: <MessageSquare className="w-4 h-4" /> },
  { label: "Settings", href: "/business/settings", icon: <Settings className="w-4 h-4" /> },
];

const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: <BarChart3 className="w-4 h-4" /> },
  { label: "Businesses", href: "/admin/businesses", icon: <Store className="w-4 h-4" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="w-4 h-4" /> },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation({ onSuccess: () => { logout(); navigate("/"); } });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground mb-4">Please sign in to continue.</p>
          <Button asChild className="rounded-full">
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const navItems =
    user.role === "admin" ? adminNav :
    user.role === "business_owner" ? businessNav :
    consumerNav;

  const roleLabel =
    user.role === "admin" ? "Admin" :
    user.role === "business_owner" ? "Business" :
    "Member";

  const initials = (user.name ?? user.email ?? "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background flex">
      {/* ─── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Star className="w-4 h-4 text-primary-foreground fill-current" />
          </div>
          <div>
            <div className="font-serif text-base font-semibold text-foreground leading-tight">Local Rewards</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{roleLabel} Portal</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const active = location === item.href || (item.href !== "/dashboard" && item.href !== "/business" && item.href !== "/admin" && location.startsWith(item.href));
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                      active
                        ? "bg-primary text-primary-foreground font-medium shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{user.name ?? "User"}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
                <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {user.role === "business_owner" && (
                <DropdownMenuItem onClick={() => navigate("/business/settings")}>
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </DropdownMenuItem>
              )}
              {user.role === "admin" && (
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  <Shield className="w-4 h-4 mr-2" /> Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ─── Main Content ──────────────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 bg-card/80 backdrop-blur border-b border-border flex items-center px-6 gap-4">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          {title && (
            <h1 className="font-serif text-xl font-semibold text-foreground">{title}</h1>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
