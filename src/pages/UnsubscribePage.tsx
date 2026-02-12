import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [preferences, setPreferences] = useState({
    marketing_emails: true,
    event_reminders: true,
    order_updates: true,
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setError("Invalid unsubscribe link. Please use the link from your email.");
      setLoading(false);
      return;
    }

    loadPreferences();
  }, [token]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("unsubscribe-email", {
        body: { token, action: "get" },
      });

      if (error) throw error;

      if (data.success) {
        setEmail(data.email);
        setPreferences({
          marketing_emails: data.preferences.marketing_emails ?? true,
          event_reminders: data.preferences.event_reminders ?? true,
          order_updates: data.preferences.order_updates ?? true,
        });
      } else {
        setError(data.error || "Unable to load email preferences.");
      }
    } catch (err: any) {
      console.error("Error loading preferences:", err);
      setError(err.message || "Failed to load preferences.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("unsubscribe-email", {
        body: { token, preferences },
      });

      if (error) throw error;

      if (data.success) {
        setSuccess(true);
        toast.success("Preferences updated successfully");
      } else {
        throw new Error(data.error || "Failed to update preferences");
      }
    } catch (err: any) {
      console.error("Error saving preferences:", err);
      toast.error(err.message || "Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("unsubscribe-email", {
        body: {
          token,
          preferences: {
            marketing_emails: false,
            event_reminders: false,
            order_updates: false,
          },
        },
      });

      if (error) throw error;

      if (data.success) {
        setPreferences({
          marketing_emails: false,
          event_reminders: false,
          order_updates: false,
        });
        setSuccess(true);
        toast.success("You've been unsubscribed from all marketing emails");
      } else {
        throw new Error(data.error || "Failed to unsubscribe");
      }
    } catch (err: any) {
      console.error("Error unsubscribing:", err);
      toast.error(err.message || "Failed to unsubscribe");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your preferences...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.href = "/"} variant="outline">
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Preferences Updated!</h1>
          <p className="text-muted-foreground mb-6">
            Your email preferences have been successfully updated.
          </p>
          <p className="text-sm text-muted-foreground">
            You can close this page or{" "}
            <a href="/" className="text-primary hover:underline">
              return to home
            </a>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Email Preferences</h1>
          <p className="text-sm text-muted-foreground">
            Manage your email preferences for <strong>{email}</strong>
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <Checkbox
              id="marketing"
              checked={preferences.marketing_emails}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, marketing_emails: checked as boolean })
              }
            />
            <label
              htmlFor="marketing"
              className="flex-1 text-sm cursor-pointer"
            >
              <div className="font-medium">Marketing Emails</div>
              <div className="text-muted-foreground">
                Promotions, new features, and special offers
              </div>
            </label>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <Checkbox
              id="events"
              checked={preferences.event_reminders}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, event_reminders: checked as boolean })
              }
            />
            <label
              htmlFor="events"
              className="flex-1 text-sm cursor-pointer"
            >
              <div className="font-medium">Event Reminders</div>
              <div className="text-muted-foreground">
                Reminders about your upcoming events
              </div>
            </label>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <Checkbox
              id="orders"
              checked={preferences.order_updates}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, order_updates: checked as boolean })
              }
            />
            <label
              htmlFor="orders"
              className="flex-1 text-sm cursor-pointer"
            >
              <div className="font-medium">Order Updates</div>
              <div className="text-muted-foreground">
                Status updates about your orders
              </div>
            </label>
          </div>

          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-start space-x-3">
              <Checkbox checked disabled />
              <div className="flex-1 text-sm">
                <div className="font-medium text-muted-foreground">Transactional Emails</div>
                <div className="text-muted-foreground">
                  Critical account and order notifications (always enabled)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleSave}
            className="w-full"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
          <Button
            onClick={handleUnsubscribeAll}
            variant="outline"
            className="w-full"
            disabled={saving}
          >
            Unsubscribe from All Marketing
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Need help?{" "}
          <a href="mailto:info@caterdirectly.com" className="text-primary hover:underline">
            Contact support
          </a>
        </p>
      </Card>
    </div>
  );
};

export default UnsubscribePage;