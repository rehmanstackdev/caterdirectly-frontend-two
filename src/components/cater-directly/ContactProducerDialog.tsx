import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { EVENT_CATEGORIES } from "@/content/eventsShowcase";
import { toast } from "sonner";

interface ContactProducerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactProducerDialog = ({ open, onOpenChange }: ContactProducerDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const categories = useMemo(() => EVENT_CATEGORIES, []);

  const toggle = (key: string) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || selected.length === 0) {
      toast("Please provide your name, email, and at least one event type.");
      return;
    }
    try {
      setSubmitting(true);
      const { error } = await supabase.from('leads' as any).insert({
        name,
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        message: message?.trim() || null,
        event_types: selected,
        source_page: typeof window !== 'undefined' ? window.location.pathname : '/'
      });
      if (error) throw error;
      toast("Thanks! An event producer will reach out shortly.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setSelected([]);
      onOpenChange(false);
    } catch (err: any) {
      toast("Something went wrong. Please try again.");
      console.error("Lead submit error", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Talk to an event producer</DialogTitle>
          <DialogDescription>
            Tell us a bit about your event and we’ll curate the right vendors, venues, and logistics for you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground">Name</label>
              <input
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground">Email</label>
              <input
                type="email"
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm text-muted-foreground">Phone (optional)</label>
              <input
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Event type(s)</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {categories.map((c) => (
                <label key={c.key} className="inline-flex items-center gap-2 rounded-md border border-border bg-card/70 px-3 py-2">
                  <input
                    type="checkbox"
                    className="accent-[hsl(var(--primary))]"
                    checked={selected.includes(c.key)}
                    onChange={() => toggle(c.key)}
                  />
                  <span className="text-sm">{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted-foreground">What are you planning? (optional)</label>
            <textarea
              className="min-h-[96px] rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share details like date, guest count, budget, or anything else."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit inquiry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactProducerDialog;
