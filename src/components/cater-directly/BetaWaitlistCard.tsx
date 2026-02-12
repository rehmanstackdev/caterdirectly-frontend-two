import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCreateWaitlistEntry } from "@/hooks/use-backend-waitlist";
import { AI_PLANNER_BETA_TITLE, AI_PLANNER_BETA_SUBTITLE, AI_PLANNER_BETA_DESCRIPTION } from "@/content/siteMeta";

const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;

const BetaWaitlistCard = () => {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const createWaitlistEntry = useCreateWaitlistEntry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address to join the waitlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createWaitlistEntry.mutateAsync({
        email,
        reason: reason || undefined,
        // cardBetaType: "hero_beta_card"
      });
      
      toast({ title: "Thank you!", description: "You've been added to the AI Planner beta waitlist." });
      setEmail("");
      setReason("");
    } catch (err: any) {
      console.error("Waitlist error", err);
      if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
        toast({ title: "You're already on the list!", description: "We'll notify you as soon as early access opens." });
      } else {
        toast({ title: "Something went wrong", description: err?.message || "Please try again.", variant: "destructive" });
      }
    }
  };

  return (
    <section className="font-inter bg-card/80 supports-[backdrop-filter]:bg-card/70 backdrop-blur border border-border rounded-2xl md:rounded-3xl p-5 md:p-10 lg:p-12 shadow-xl transition-shadow duration-300 hover:shadow-2xl w-full max-w-[1500px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center rounded-full bg-brand/10 text-brand px-2.5 py-1 text-[10px] md:text-xs font-medium tracking-wide">{AI_PLANNER_BETA_SUBTITLE}</span>
          <h2 className="font-manrope text-3xl md:text-3xl lg:text-5xl font-extrabold tracking-tight leading-[1.22] pb-2 bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">{AI_PLANNER_BETA_TITLE}</h2>
          <p className="text-muted-foreground text-base md:text-base lg:text-lg leading-relaxed">
            {AI_PLANNER_BETA_DESCRIPTION}
          </p>
        </div>
        <div className="w-full">
          <form onSubmit={handleSubmit} className="grid gap-4 md:gap-5">
            <div className="grid gap-2">
              <label htmlFor="beta-email" className="text-sm font-medium text-foreground">Email</label>
              <Input
                id="beta-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-12 md:h-11"
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="beta-reason" className="text-sm font-medium text-foreground">Why are you a good fit?</label>
              <Textarea
                id="beta-reason"
                placeholder="Tell us about your upcoming events, your role, and what you'd like this to do for you."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[140px] md:min-h-[120px]"
              />
            </div>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <Button type="submit" disabled={createWaitlistEntry.isPending} className="w-full md:w-auto px-6 bg-gradient-to-tr from-brand to-brand/80 text-brand-foreground shadow-md hover:shadow-lg transition-shadow">
                {createWaitlistEntry.isPending ? "Joining…" : "Request early access"}
              </Button>
              <span className="text-xs text-muted-foreground text-center md:text-left">We'll only use your email for this beta.</span>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BetaWaitlistCard;