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

const EventhostAccountinfo = () => {
  const { profileData, isLoading } = useProfile();

  const stripeAccount = null;
  const stripeLoading = false;
  const creatingStripeAccount = false;
  const creatingAccountLink = false;
  const creatingLoginLink = false;

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
                      <span className="ml-2 text-sm text-purple-700">
                        Loading account status...
                      </span>
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
                            ?? Your Stripe account needs to complete onboarding to receive payouts.
                          </p>
                          <Button size="sm" variant="outline" disabled className="w-full">
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
                        <Button size="sm" variant="outline" disabled className="flex-1">
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
                        <Button size="sm" variant="outline" disabled>
                          Refresh Status
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
                        disabled
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
