import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Mail, Phone, Share2, Plus, Send, Copy, CheckCheck, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CForm = { type: "email" | "sms" | "social"; subject: string; body: string; socialPlatform: string };
const emptyForm: CForm = { type: "email", subject: "", body: "", socialPlatform: "facebook" };

const TYPE_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  sms: <Phone className="w-4 h-4" />,
  social: <Share2 className="w-4 h-4" />,
};

const STATUS_COLORS: Record<string, string> = {
  draft: "border-secondary text-muted-foreground bg-secondary/30",
  scheduled: "border-amber-200 text-amber-700 bg-amber-50",
  sent: "border-emerald-200 text-emerald-700 bg-emerald-50",
  failed: "border-red-200 text-red-700 bg-red-50",
};

const SOCIAL_URLS: Record<string, string> = {
  facebook: "https://www.facebook.com/sharer/sharer.php?u=",
  twitter: "https://twitter.com/intent/tweet?text=",
  instagram: "https://www.instagram.com/",
  nextdoor: "https://nextdoor.com/",
};

export default function BusinessCampaigns() {
  const utils = trpc.useUtils();
  const { data: campaigns, isLoading } = trpc.campaigns.list.useQuery();
  const createMutation = trpc.campaigns.create.useMutation({
    onSuccess: () => { utils.campaigns.list.invalidate(); setOpen(false); toast.success("Campaign created!"); },
    onError: e => toast.error(e.message),
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CForm>(emptyForm);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof CForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCopy = () => {
    navigator.clipboard.writeText(form.body).then(() => {
      setCopied(true);
      toast.success("Post copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareSocial = () => {
    const baseUrl = SOCIAL_URLS[form.socialPlatform] ?? SOCIAL_URLS.facebook;
    const url = baseUrl + encodeURIComponent(form.body);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AppLayout title="Campaigns">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Customer Campaigns</h2>
          <p className="text-muted-foreground">Engage your customers with targeted messaging.</p>
        </div>
        <Button className="rounded-full gap-2" onClick={() => { setForm(emptyForm); setOpen(true); }}>
          <Plus className="w-4 h-4" /> New Campaign
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : campaigns && campaigns.length > 0 ? (
        <div className="space-y-3">
          {campaigns.map(c => (
            <div key={c.id} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                {TYPE_ICONS[c.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-foreground text-sm">{c.subject ?? `${c.type.toUpperCase()} Campaign`}</span>
                  <Badge variant="outline" className={cn("text-xs capitalize border", STATUS_COLORS[c.status] ?? "")}>{c.status}</Badge>
                  {c.type === "social" && c.socialPlatform && (
                    <Badge variant="secondary" className="text-xs capitalize">{c.socialPlatform}</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-1">{c.body}</div>
              </div>
              <div className="text-right flex-shrink-0 text-xs text-muted-foreground">
                <div>{c.recipientCount} recipients</div>
                {c.sentAt && <div>{new Date(c.sentAt).toLocaleDateString()}</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No campaigns yet.</p>
          <Button className="rounded-full" onClick={() => { setForm(emptyForm); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Create Campaign
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">New Campaign</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            {/* Type selector */}
            <div>
              <Label className="mb-2 block text-sm">Campaign Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["email", "sms", "social"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all",
                      form.type === t ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {TYPE_ICONS[t]}{t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Email subject */}
            {form.type === "email" && (
              <div>
                <Label className="mb-1.5 block text-sm">Subject Line</Label>
                <Input placeholder="e.g. Exclusive offer just for you!" value={form.subject} onChange={set("subject")} className="rounded-xl" />
              </div>
            )}

            {/* Social platform selector */}
            {form.type === "social" && (
              <div>
                <Label className="mb-1.5 block text-sm">Platform</Label>
                <select
                  value={form.socialPlatform}
                  onChange={set("socialPlatform")}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="nextdoor">Nextdoor</option>
                </select>
              </div>
            )}

            {/* Message body */}
            <div>
              <Label className="mb-1.5 block text-sm">Message *</Label>
              <Textarea
                placeholder={
                  form.type === "email" ? "Write your email body..." :
                  form.type === "sms" ? "Write your SMS message (160 chars)..." :
                  "Write your social post..."
                }
                value={form.body}
                onChange={set("body")}
                className="rounded-xl resize-none"
                rows={5}
                maxLength={form.type === "sms" ? 160 : undefined}
              />
              {form.type === "sms" && (
                <div className="text-xs text-muted-foreground text-right mt-1">{form.body.length}/160</div>
              )}
            </div>

            {/* Social post preview + copy */}
            {form.type === "social" && form.body && (
              <>
                <Separator />
                <div>
                  <Label className="mb-2 block text-sm text-muted-foreground">Post Preview</Label>
                  <div className="bg-secondary/40 rounded-xl p-4 text-sm text-foreground whitespace-pre-wrap border border-border">
                    {form.body}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full gap-1.5 flex-1"
                      onClick={handleCopy}
                    >
                      {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy to Clipboard"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full gap-1.5 flex-1"
                      onClick={handleShareSocial}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open {form.socialPlatform.charAt(0).toUpperCase() + form.socialPlatform.slice(1)}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              className="rounded-full gap-2"
              disabled={!form.body || createMutation.isPending}
              onClick={() => createMutation.mutate({
                type: form.type,
                subject: form.subject || undefined,
                body: form.body,
                socialPlatform: form.socialPlatform || undefined,
              })}
            >
              <Send className="w-4 h-4" />
              {createMutation.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
