import { useEffect, useMemo, useState } from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  User,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import PersonalInfoForm from "@/components/profile/PersonalInfoForm";
import { useProfile } from "@/hooks/use-profile";
import HostService from "@/services/api/host/host.Service";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";

interface StripeConnectAccount {
  id: string;
  type: "express" | "standard";
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
}

const EventhostAccountinfo = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profileData, isLoading } = useProfile();

  const [stripeAccount, setStripeAccount] = useState<StripeConnectAccount | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [creatingStripeAccount, setCreatingStripeAccount] = useState(false);
  const [creatingAccountLink, setCreatingAccountLink] = useState(false);
  const [creatingLoginLink, setCreatingLoginLink] = useState(false);

  const hostId = user?.id;

  const hostBusinessName = useMemo(() => {
    const firstName = profileData?.personal?.firstName || "";
    const lastName = profileData?.personal?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || "Host";
  }, [profileData?.personal?.firstName, profileData?.personal?.lastName]);

  const mapStripeAccount = (accountData: any): StripeConnectAccount | null => {
    if (!accountData?.id) return null;
    return {
      id: accountData.id,
      type: accountData.type || "express",
      charges_enabled: Boolean(accountData.charges_enabled),
      payouts_enabled: Boolean(accountData.payouts_enabled),
      details_submitted: Boolean(accountData.details_submitted),
    };
  };

  const fetchStripeAccount = async () => {
    if (!hostId) {
      setStripeAccount(null);
      return;
    }

    setStripeLoading(true);
    try {
      const response = await HostService.getStripeConnectAccount(hostId);
      const accountData =
        response?.data?.account ||
        response?.data?.stripeAccount ||
        response?.account ||
        response?.stripeAccount;
      setStripeAccount(mapStripeAccount(accountData));
    } catch (error: any) {
      setStripeAccount(null);
      if (error?.response?.status !== 404 && error?.response?.status !== 400) {
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to fetch Stripe Connect account",
          variant: "destructive",
        });
      }
    } finally {
      setStripeLoading(false);
    }
  };

  const createOnboardingLink = async (): Promise<string | null> => {
    if (!hostId) return null;

    setCreatingAccountLink(true);
    try {
      const baseUrl = `${window.location.origin}${window.location.pathname}`;
      const returnUrl = `${baseUrl}?tab=banking&onboarding=complete`;
      const refreshUrl = `${baseUrl}?tab=banking&onboarding=refresh`;

      const response = await HostService.createStripeAccountLink(hostId, returnUrl, refreshUrl);
      return response?.data?.url || response?.url || null;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create onboarding link",
        variant: "destructive",
      });
      return null;
    } finally {
      setCreatingAccountLink(false);
    }
  };

  const openOnboarding = async () => {
    const url = await createOnboardingLink();
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const openStripeDashboard = async () => {
    if (!hostId) return;

    setCreatingLoginLink(true);
    try {
      const response = await HostService.createStripeLoginLink(hostId);
      const url = response?.data?.url || response?.url;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || "";
      const onboardingIncomplete = backendMessage
        .toLowerCase()
        .includes("has not completed onboarding");

      if (onboardingIncomplete) {
        toast({
          title: "Complete Stripe Onboarding",
          description: "Please complete onboarding first, then open Stripe Dashboard.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Error",
        description: backendMessage || "Failed to create login link",
        variant: "destructive",
      });
    } finally {
      setCreatingLoginLink(false);
    }
  };

  const createStripeAccount = async () => {
    if (!hostId) return;

    setCreatingStripeAccount(true);
    try {
      const email = profileData?.personal?.email || user?.email || "";
      await HostService.createStripeConnectAccount(hostId, {
        email,
        businessName: hostBusinessName,
        country: "US",
        type: "express",
      });

      await fetchStripeAccount();

      toast({
        title: "Success",
        description: "Stripe Connect account created successfully",
      });
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || "";
      const alreadyExists = backendMessage.toLowerCase().includes("already has a stripe connect account");

      if (alreadyExists) {
        toast({
          title: "Stripe Already Connected",
          description: "Your host account is already connected to Stripe.",
        });
        return;
      }

      toast({
        title: "Error Creating Account",
        description: backendMessage || "Failed to create Stripe Connect account",
        variant: "destructive",
      });
    } finally {
      setCreatingStripeAccount(false);
    }
  };

  useEffect(() => {
    fetchStripeAccount();
  }, [hostId]);

  return (
    <Dashboard activeTab="settings" userRole="event-host">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500">Manage your host account settings</p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account Info
            </TabsTrigger>
            <TabsTrigger value="banking" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Banking & Payouts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#F07712]" />
                  </div>
                ) : (
                  <PersonalInfoForm initialData={profileData?.personal} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banking">
            <Card>
              <CardHeader>
                <CardTitle>Banking & Payout Information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Secure banking details for receiving payments from orders
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-purple-900 mb-1 flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Stripe Connect Account
                      </h4>
                      <p className="text-sm text-purple-800">
                        Connect your Stripe account to receive payments directly.
                        Required for receiving payouts.
                      </p>
                    </div>
                    {stripeAccount ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Connected
                      </Badge>
                    )}
                  </div>

                  {stripeLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                      <span className="ml-2 text-sm text-purple-700">Loading account status...</span>
                    </div>
                  ) : stripeAccount ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-purple-700 font-medium">Account ID:</span>
                          <p className="text-purple-900 font-mono text-xs">{stripeAccount.id}</p>
                        </div>
                        <div>
                          <span className="text-purple-700 font-medium">Account Type:</span>
                          <p className="text-purple-900 capitalize">{stripeAccount.type}</p>
                        </div>
                        <div>
                          <span className="text-purple-700 font-medium">Charges Enabled:</span>
                          <p className={stripeAccount.charges_enabled ? "text-green-600" : "text-red-600"}>
                            {stripeAccount.charges_enabled ? "Yes" : "No"}
                          </p>
                        </div>
                        <div>
                          <span className="text-purple-700 font-medium">Payouts Enabled:</span>
                          <p className={stripeAccount.payouts_enabled ? "text-green-600" : "text-red-600"}>
                            {stripeAccount.payouts_enabled ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>

                      {!stripeAccount.details_submitted && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800 mb-2">
                            Your Stripe account needs to complete onboarding to receive payouts.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={openOnboarding}
                            disabled={creatingAccountLink}
                            className="w-full"
                          >
                            {creatingAccountLink ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating Link...
                              </>
                            ) : (
                              <>
                                Complete Onboarding
                                <ExternalLink className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={openStripeDashboard}
                          disabled={creatingLoginLink}
                          className="flex-1"
                        >
                          {creatingLoginLink ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Opening...
                            </>
                          ) : (
                            <>
                              Open Stripe Dashboard
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="outline" onClick={fetchStripeAccount} disabled={stripeLoading}>
                          {stripeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh Status"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-purple-700">
                        You need to create a Stripe Connect account to receive payments.
                        This will allow you to receive payouts directly to your bank account.
                      </p>
                      <Button
                        onClick={createStripeAccount}
                        disabled={creatingStripeAccount || !hostId}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {creatingStripeAccount ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            Create Stripe Connect Account
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Dashboard>
  );
};

export default EventhostAccountinfo;
