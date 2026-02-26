import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, CalendarDays } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GroupOrderSuccessModalProps {
  open: boolean;
  onClose: () => void;
  eventName: string;
  address: string;
  date: string;
  time: string;
  budgetPerPerson?: string;
  inviteToken: string;
}

export default function GroupOrderSuccessModal({
  open,
  onClose,
  eventName,
  address,
  date,
  time,
  budgetPerPerson,
  inviteToken,
}: GroupOrderSuccessModalProps) {
  const [copied, setCopied] = useState(false);
  
  const inviteLink = `${window.location.origin}/group-order/invite-start/${inviteToken}`;

  const formattedDate = (() => {
    if (!date) return "TBD";
    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return date;
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "2-digit",
      day: "2-digit",
    }).format(parsed);
  })();

  const formattedTime = (() => {
    if (!time) return "TBD";
    const parsed = new Date(`1970-01-01T${time}`);
    if (Number.isNaN(parsed.getTime())) return time;
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    }).format(parsed);
  })();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[86vw] sm:!max-w-lg md:!max-w-xl px-5 sm:px-6 py-3 sm:py-4">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-2xl font-semibold text-gray-900 pr-8 text-left leading-tight">
            Invite guests to place their orders
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-4">
          <p className="text-sm sm:text-lg leading-6 sm:leading-8 text-gray-700">
            Just copy the link to share it with your group. Attendees will have access to the menu and be able to add items to your cart.
          </p>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="mt-0.5 sm:mt-1 text-[#F07712]">
              <CalendarDays className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div className="text-xs sm:text-lg leading-6 sm:leading-8 text-gray-700">
              <p
                className="font-semibold text-gray-900 text-xs sm:text-xl truncate whitespace-nowrap overflow-hidden max-w-full cursor-help"
                title={eventName}
              >
                {eventName}
              </p>
              <p>Order by {formattedDate}, 9:00 AM PST</p>
              <p>{address}</p>
              {budgetPerPerson && (
                <p>
                  Budget per person: ${Number(budgetPerPerson || 0).toFixed(2)}
                </p>
              )}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 pt-1.5 sm:pt-2 text-[#F07712] hover:text-[#F07712]/80 font-medium transition-colors text-xs sm:text-base"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                    Copied invite link
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5 sm:h-6 sm:w-6" />
                    Copy invite link
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 sm:gap-3 pt-1 sm:pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-9 sm:h-11 px-5 sm:px-8 text-base sm:text-lg border-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={onClose}
              className="h-9 sm:h-11 px-6 sm:px-10 text-base sm:text-lg bg-[#F07712] hover:bg-[#F07712]/90 text-white"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
