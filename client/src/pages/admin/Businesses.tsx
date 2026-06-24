import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Store, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
const STATUS_COLORS: Record<string, string> = { pending: "border-amber-200 text-amber-700 bg-amber-50", approved: "border-emerald-200 text-emerald-700 bg-emerald-50", rejected: "border-red-200 text-red-700 bg-red-50", suspended: "border-gray-200 text-gray-700 bg-gray-50" };
export default function AdminBusinesses() {
  const utils = trpc.useUtils();
  const { data: businesses, isLoading } = trpc.admin.getAllBusinesses.useQuery({ limit: 100, offset: 0 });
  const approveMutation = trpc.admin.approveBusiness.useMutation({ onSuccess: () => { utils.admin.getAllBusinesses.invalidate(); toast.success("Business approved!"); }, onError: e => toast.error(e.message) });
  const rejectMutation = trpc.admin.rejectBusiness.useMutation({ onSuccess: () => { utils.admin.getAllBusinesses.invalidate(); toast.success("Business rejected."); }, onError: e => toast.error(e.message) });
  const pending = businesses?.filter(b => b.status === "pending") ?? [];
  const approved = businesses?.filter(b => b.status === "approved") ?? [];
  const other = businesses?.filter(b => b.status !== "pending" && b.status !== "approved") ?? [];
  type Biz = NonNullable<typeof businesses>[number];
  const BusinessCard = ({ biz }: { biz: Biz }) => (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-card flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-serif text-xl font-bold flex-shrink-0">{biz.name[0]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5"><h3 className="font-semibold text-foreground">{biz.name}</h3><Badge className={cn("text-xs capitalize border", STATUS_COLORS[biz.status] ?? "")}>{biz.status}</Badge></div>
        <div className="text-sm text-muted-foreground">{biz.category ?? "Business"}</div>
        {(biz.city || biz.state) && <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"><MapPin className="w-3 h-3" />{[biz.city, biz.state].filter(Boolean).join(", ")}</div>}
      </div>
      {biz.status === "pending" && (
        <div className="flex gap-2 flex-shrink-0">
          <Button size="sm" className="rounded-full gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => approveMutation.mutate({ id: biz.id })}><CheckCircle className="w-3.5 h-3.5" />Approve</Button>
          <Button size="sm" variant="outline" className="rounded-full gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => rejectMutation.mutate({ id: biz.id })}><XCircle className="w-3.5 h-3.5" />Reject</Button>
        </div>
      )}
    </div>
  );
  return (
    <AppLayout title="Businesses">
      <div className="mb-8"><h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Business Management</h2><p className="text-muted-foreground">Review, approve, and manage enrolled businesses.</p></div>
      {isLoading ? <Skeleton className="h-40 rounded-2xl" /> : (
        <Tabs defaultValue="pending">
          <TabsList className="mb-6 rounded-xl">
            <TabsTrigger value="pending" className="rounded-lg">Pending {pending.length > 0 && <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">{pending.length}</span>}</TabsTrigger>
            <TabsTrigger value="approved" className="rounded-lg">Approved</TabsTrigger>
            <TabsTrigger value="other" className="rounded-lg">Other</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">{pending.length > 0 ? <div className="space-y-3">{pending.map(b => <BusinessCard key={b.id} biz={b} />)}</div> : <div className="text-center py-16 bg-card rounded-2xl border border-border text-muted-foreground"><CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />No pending approvals.</div>}</TabsContent>
          <TabsContent value="approved">{approved.length > 0 ? <div className="space-y-3">{approved.map(b => <BusinessCard key={b.id} biz={b} />)}</div> : <div className="text-center py-16 bg-card rounded-2xl border border-border text-muted-foreground"><Store className="w-8 h-8 mx-auto mb-2" />No approved businesses yet.</div>}</TabsContent>
          <TabsContent value="other">{other.length > 0 ? <div className="space-y-3">{other.map(b => <BusinessCard key={b.id} biz={b} />)}</div> : <div className="text-center py-16 bg-card rounded-2xl border border-border text-muted-foreground">No other businesses.</div>}</TabsContent>
        </Tabs>
      )}
    </AppLayout>
  );
}
