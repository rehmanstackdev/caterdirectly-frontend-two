
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users, User, Phone, Mail, Clock, FileText, Building2 } from "lucide-react";
import { OrderInfo } from "@/types/order";

interface BookingDetailsCardProps {
  formData: OrderInfo;
}

const BookingDetailsCard = ({ formData }: BookingDetailsCardProps) => {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-gray-200">
        <CardTitle className="text-base font-semibold text-gray-900">Booking Details</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-4 space-y-0">
        {/* Event Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">Event name</span>
            </div>
            <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] truncate">
              {formData?.orderName || formData?.name || formData?.eventName || "Not specified"}
            </span>
          </div>

          {/* Company Name - Only show if exists */}
          {((formData as any)?.company || (formData as any)?.clientCompany) && (
            <div className="p-3 bg-blue-50 border border-gray-200 rounded-md my-2">
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-900">
                    {(formData as any).company || (formData as any).clientCompany}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Contact: {formData.primaryContactName || (formData as any).clientName || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">Date</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formData?.date || "Not specified"}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">Time</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {(() => {
                const timeValue = formData?.deliveryWindow || formData?.time;
                if (!timeValue || timeValue === "Not specified") return "Not specified";

                // If it's already a formatted time with AM/PM, return as is
                if (timeValue.includes('AM') || timeValue.includes('PM')) return timeValue;

                // Try to parse and format time with AM/PM
                try {
                  // Handle HH:MM format
                  const timeMatch = timeValue.match(/^(\d{1,2}):(\d{2})$/);
                  if (timeMatch) {
                    const [, hours, minutes] = timeMatch;
                    const date = new Date();
                    date.setHours(parseInt(hours), parseInt(minutes));
                    return date.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                  }
                  return timeValue;
                } catch {
                  return timeValue;
                }
              })()}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">Guests</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formData?.headcount || formData?.guests || "Not specified"}
            </span>
          </div>

          <div className="flex items-start justify-between py-2">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600">Location</span>
            </div>
            <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] leading-relaxed">
              {formData?.location || "Not specified"}
            </span>
          </div>
        </div>

        <Separator className="my-4 bg-gray-200" />

        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">Primary contact</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formData?.primaryContactName || "Not specified"}
            </span>
          </div>

          {formData?.primaryContactPhone && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-600">Phone</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formData.primaryContactPhone}
              </span>
            </div>
          )}

          {formData?.primaryContactEmail && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-600">Email</span>
              </div>
              <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] truncate">
                {formData.primaryContactEmail}
              </span>
            </div>
          )}

          {/* Backup Contact */}
          {formData?.hasBackupContact && formData?.backupContactName && (
            <>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Backup contact</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formData.backupContactName}
                </span>
              </div>

              {formData?.backupContactPhone && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Backup phone</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formData.backupContactPhone}
                  </span>
                </div>
              )}

              {formData?.backupContactEmail && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Backup email</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] truncate">
                    {formData.backupContactEmail}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Additional Notes */}
        {formData?.additionalNotes && (
          <>
            <Separator className="my-4 bg-gray-200" />
            <div className="py-2">
              <div className="flex items-start gap-3 mb-2">
                <FileText className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">Notes</span>
              </div>
              <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed pl-7">
                {formData.additionalNotes}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingDetailsCard;
