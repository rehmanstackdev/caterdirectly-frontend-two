import { Event } from "@/types/order";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Link as LinkIcon,
  ExternalLink,
  Ticket,
  Clock3,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  formatEventDate,
  formatEventTime,
} from "@/hooks/events/utils/date-utils";
import { getServiceImageUrl } from "@/utils/image-utils";
import { Separator } from "../ui/separator";

interface EventsListProps {
  events: Event[];
  isLoading?: boolean;
}

const EventsList = ({ events, isLoading = false }: EventsListProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse rounded-2xl">
            <div className="h-36 bg-gray-200" />
            <CardContent className="p-4 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No events found.</p>
        <Button
          onClick={() => navigate("/events/create")}
          className="mt-4"
          variant="outline"
        >
          Create your first event
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {events.map((event) => {
        const confirmedGuests = (event.guests || []).filter(
          (g) => g.rsvpStatus === "confirmed",
        ).length;
        const totalGuests = (event.guests || []).length;
        const responseRate =
          totalGuests > 0
            ? Math.round((confirmedGuests / totalGuests) * 100)
            : 0;

        // const imageUrl = getServiceImageUrl(event.image);
        // const isPast = event.category === "past";

        return (
          <Card
            key={event.id}
            className="overflow-hidden rounded-2xl border border-[#F2E8DF] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* <div className="relative h-36 overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={event.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-[#fff7ed] to-[#ffedd5]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

              <div className="absolute left-3 top-3 flex gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    isPast
                      ? "bg-slate-900/80 text-white"
                      : "bg-emerald-600/90 text-white"
                  }`}
                >
                  {isPast ? "Past" : "Upcoming"}
                </span>

                <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-800">
                  {event.isTicketed ? "Ticketed" : "Free"}
                </span>
              </div>
            </div> */}

            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="line-clamp-2  text-lg font-semibold leading-tight text-slate-900 truncate">
                  {event.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {event.description || "No description available."}
                </p>
              </div>
              <Separator />
              <div className="border border-gray-200 rounded-lg p-2">
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="h-4 w-4 text-[#F07712]" />
                    <span>
                      {formatEventDate(
                        event.startDate || (event as any).startDateTime,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock3 className=" h-4 w-4 text-[#F07712]" />
                    <span>
                      {formatEventTime(
                        event.startDate || (event as any).startDateTime,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Users className="h-4 w-4 text-[#F07712]" />
                    <span>
                      {confirmedGuests}/{totalGuests} confirmed ({responseRate}
                      %)
                    </span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="h-4 w-4 text-[#F07712]" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}

                  {event.eventUrl && (
                    <a
                      href={event.eventUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span className="truncate">
                        {event.eventUrl.replace(/^https?:\/\//, "")}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Ticket className="h-3.5 w-3.5" />
                  {event.isTicketed ? "Paid event" : "Open entry"}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EventsList;
