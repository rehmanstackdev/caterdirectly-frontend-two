import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { groupOrderService } from "@/services/groupOrderService";
import Header from "@/components/cater-directly/Header";
import Footer from "@/components/cater-directly/Footer";
import { inviteStartSchema } from "@/validations/groupOrderInviteStartValidation";

interface InvitationDetailsData {
  host_name?: string;
  hostName?: string;
  contactName?: string;
  eventName?: string;
  eventLocation?: string;
  eventDate?: string;
  serviceTime?: string;
  budgetPerPerson?: number | string;
}

export default function GroupOrderInviteStart() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isInvalidToken, setIsInvalidToken] = useState(false);
  const [orderData, setOrderData] = useState<InvitationDetailsData | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const loadInvitation = async () => {
      if (!id) {
        setIsInvalidToken(true);
        setIsLoading(false);
        return;
      }

      const details = await groupOrderService.getInvitationDetails(id);
      if (!details) {
        setIsInvalidToken(true);
      } else {
        setOrderData(details);
      }
      setIsLoading(false);
    };

    loadInvitation();
  }, [id]);

  const hostName =
    orderData?.host_name || orderData?.hostName || orderData?.contactName || "Your host";
  const eventName = orderData?.eventName || "Group Order";
  const location = orderData?.eventLocation || "Location TBD";
  const budget =
    orderData?.budgetPerPerson !== undefined && orderData?.budgetPerPerson !== null
      ? Number(orderData.budgetPerPerson).toFixed(2)
      : null;

  const dateLine = (() => {
    const date = orderData?.eventDate || "";
    const time = orderData?.serviceTime || "";
    if (!date && !time) return "Delivery details will be shared by the host";
    return `Delivery on ${date || "TBD"}${time ? `, ${time}` : ""}`;
  })();

  const handleContinue = () => {
    if (!id) return;
    const parsed = inviteStartSchema.safeParse({ name, email });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setNameError(fieldErrors.name?.[0] || "");
      setEmailError(fieldErrors.email?.[0] || "");
      return;
    }

    navigate('/group-order/marketplace', {
      state: {
        inviteToken: id,
        guestName: parsed.data.name,
        guestEmail: parsed.data.email,
        orderData,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-[#F07712]" />
          <p className="text-gray-600">Loading invitation</p>
        </div>
      </div>
    );
  }

  if (isInvalidToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white border rounded-xl p-6">
          <h1 className="text-2xl font-semibold text-gray-900">Invalid Invitation</h1>
          <p className="text-gray-600 mt-2">
            This invite link is invalid or expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-6 sm:py-10 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border border-orange-100 shadow-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-[#F07712] to-[#FF9142]" />
            <CardContent className="pt-5 sm:pt-8 pb-5 sm:pb-7 px-4 sm:px-6">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {hostName} invited you to order!
              </h1>
              <p className="text-gray-700 mt-4 sm:mt-5 text-base sm:text-lg">Here are all the details:</p>

              <div className="mt-5 sm:mt-6 border rounded-xl bg-gray-50 p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-md bg-orange-50 flex items-center justify-center text-[#F07712]">
                  <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <p
                    className="font-semibold text-gray-900 text-base sm:text-2xl leading-tight truncate whitespace-nowrap overflow-hidden max-w-full cursor-help"
                    title={eventName}
                  >
                    {eventName}
                  </p>
                  <p className="text-gray-600 mt-1 text-sm sm:text-lg">{dateLine}</p>
                  <p className="text-gray-600 text-sm sm:text-lg">{location}</p>
                  {budget && <p className="text-gray-600 text-sm sm:text-lg">Your budget: ${budget}</p>}
                </div>
              </div>

              <Card className="mt-7 border border-gray-200 shadow-none">
                <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-5 sm:pb-6">
                  <p className="text-gray-700 text-base sm:text-lg">
                    Let&apos;s start with your name and email.
                  </p>

                  <div className="mt-4 sm:mt-5 max-w-xl space-y-4 sm:space-y-5">
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-2">Name</label>
                      <Input
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (nameError && e.target.value.trim()) {
                            setNameError("");
                          }
                        }}
                        placeholder="Your name"
                        className="h-11 sm:h-12 text-base sm:text-lg"
                      />
                      {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-2">Work email address</label>
                      <Input
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError && e.target.value.trim()) {
                            setEmailError("");
                          }
                        }}
                        placeholder="you@company.com"
                        type="email"
                        className="h-11 sm:h-12 text-base sm:text-lg"
                      />
                      {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base">
                      If you do not have an account we&apos;ll create one for you.
                    </p>
                    <Button
                      onClick={handleContinue}
                      disabled={!name.trim() || !email.trim()}
                      className="bg-[#F07712] hover:bg-[#F07712]/90 text-white h-10 sm:h-11 px-6 sm:px-8 text-sm sm:text-base"
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
