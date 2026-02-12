import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Globe,
  DollarSign,
  Info,
  User,
  Mail,
  Phone,
  Ticket,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Car,
  FileText,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CreditCard,
  Receipt,
  Building,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import dashboardService from '@/services/api/admin/dashboard.Service';
import { cn } from '@/lib/utils';

interface EventDetailModalProps {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OrderInvoice {
  id: string;
  status: string;
  invoiceStatus: string;
  eventName: string;
  companyName: string;
  eventLocation: string;
  eventDate: string;
  serviceTime: string;
  guestCount: number;
  contactName: string;
  phoneNumber: string;
  emailAddress: string;
  additionalNotes: string;
  additionalTip: string;
}

interface EventOrder {
  id: string;
  invoiceId: string;
  stripePaymentIntentId: string;
  paymentStatus: string;
  amountPaid: string;
  currency: string;
  paymentMethodType: string;
  paymentMethodId: string;
  paymentDetails: {
    amount: number;
    currency: string;
    paymentMethod: {
      id: string;
      type: string;
    };
    paymentIntentStatus: string;
  };
  createdAt: string;
  updatedAt: string;
  invoice: OrderInvoice;
}

interface EventDetail {
  id: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  eventType: string;
  themeColor: string;
  visibility: string;
  venueName: string;
  venueNameOptional: string;
  venueAddress: string;
  latitude: number;
  longitude: number;
  eventImage: string;
  capacity: number;
  website: string;
  isPublic: boolean;
  isPaid: boolean;
  parkingInfo: string;
  specialInstructions: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedInUrl: string;
  orderId: string | null;
  createdById: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    imageUrl: string;
  };
  tickets: Array<{
    id: string;
    ticketName: string;
    price: number;
    quantityAvailable: number;
    description: string;
  }>;
  order: EventOrder | null;
  createdAt: string;
  updatedAt: string;
}

export function EventDetailModal({ eventId, open, onOpenChange }: EventDetailModalProps) {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['event-detail', eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const result = await dashboardService.getEventById(eventId);
      return result;
    },
    enabled: !!eventId && open,
    retry: 2,
  });

  // BaseRequest service returns result.data from axios
  // Backend API structure: { status: 200, response: "OK", message: "...", data: {...} }
  // So response.data contains the actual event object
  const event: EventDetail | null = response?.data || null;

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      // Parse the UTC time and display it as-is without timezone conversion
      // Remove the 'Z' to treat it as local time
      const dateWithoutZ = dateString.replace('Z', '');
      return format(new Date(dateWithoutZ), 'EEEE, MMMM d, yyyy • h:mm a');
    } catch {
      return dateString;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      // Parse the UTC time and display it as-is without timezone conversion
      const dateWithoutZ = dateString.replace('Z', '');
      return format(new Date(dateWithoutZ), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      succeeded: { label: 'Succeeded', className: 'bg-green-100 text-green-800 border-green-300' },
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800 border-green-300' },
      pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-300' },
      processing: { label: 'Processing', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      failed: { label: 'Failed', className: 'bg-red-100 text-red-800 border-red-300' },
      refunded: { label: 'Refunded', className: 'bg-purple-100 text-purple-800 border-purple-300' },
      cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-800 border-slate-300' },
    };
    const config = statusConfig[status?.toLowerCase()] || { label: status || 'Unknown', className: 'bg-slate-100 text-slate-800 border-slate-300' };
    return <Badge className={cn('font-medium', config.className)}>{config.label}</Badge>;
  };

  const openInMaps = () => {
    if (event?.latitude && event?.longitude) {
      window.open(`https://www.google.com/maps?q=${event.latitude},${event.longitude}`, '_blank');
    } else if (event?.venueAddress) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venueAddress)}`, '_blank');
    }
  };

  // Check if image is a valid external URL (not lovable-uploads)
  const hasValidImage = event?.eventImage && 
    (event.eventImage.startsWith('http://') || event.eventImage.startsWith('https://'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden bg-white border-gray-200 shadow-2xl">
        {isLoading ? (
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="px-6 pt-6 pb-4 border-b">
              <div className="h-8 bg-muted rounded w-3/4 mb-3"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded w-20"></div>
                <div className="h-6 bg-muted rounded w-24"></div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="px-6 py-4 space-y-6">
              {/* Description */}
              <div>
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-4/6"></div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-24"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-24"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </div>
                </div>
              </div>

              {/* Venue */}
              <div>
                <div className="h-4 bg-muted rounded w-32 mb-3"></div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-muted rounded flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-48"></div>
                    <div className="h-3 bg-muted rounded w-64"></div>
                  </div>
                </div>
              </div>

              {/* Creator */}
              <div>
                <div className="h-4 bg-muted rounded w-28 mb-3"></div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-48"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : error || !event ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-destructive/10" />
              <AlertCircle className="relative h-16 w-16 text-destructive" />
            </div>
            <h3 className="text-xl font-bold mb-2">Failed to Load Event</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {error ? 'An error occurred while fetching event details. Please try again.' : 'Event not found or has been removed.'}
            </p>
          </div>
        ) : (
          <>
            {/* Header with Image */}
            <div className="relative">
              {hasValidImage ? (
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={event.eventImage}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <DialogTitle className="text-2xl font-bold text-white mb-2">
                      {event.title}
                    </DialogTitle>
                    <div className="flex flex-wrap gap-2">
                      {event.eventType && (
                        <Badge variant="secondary" className="bg-white/90 text-gray-900">
                          {event.eventType}
                        </Badge>
                      )}
                      {event.isPaid && (
                        <Badge className="bg-green-500">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Paid Event
                        </Badge>
                      )}
                      {event.isPublic ? (
                        <Badge variant="outline" className="bg-white/90 border-white text-gray-900">
                          <Eye className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-white/90 border-white text-gray-900">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                  <DialogTitle className="text-2xl font-bold mb-2">{event.title}</DialogTitle>
                  <div className="flex flex-wrap gap-2">
                    {event.eventType && (
                      <Badge variant="secondary">{event.eventType}</Badge>
                    )}
                    {event.isPaid && (
                      <Badge className="bg-green-500">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Paid Event
                      </Badge>
                    )}
                    {event.isPublic ? (
                      <Badge variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                </DialogHeader>
              )}
            </div>

            <ScrollArea className="max-h-[calc(90vh-12rem)] px-6 pb-6">
              <div className="space-y-5 pt-4">
                {/* Description */}
                {event.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Description
                    </h3>
                    <p className="text-sm leading-relaxed text-foreground">{event.description}</p>
                  </div>
                )}

                <Separator />

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Start Date & Time</p>
                      <p className="text-sm font-medium text-foreground">{formatDateTime(event.startDateTime)}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground mb-1">End Date & Time</p>
                      <p className="text-sm font-medium text-foreground">{formatDateTime(event.endDateTime)}</p>
                    </div>
                  </div>
                </div>

                {/* Venue Information */}
                {(event.venueName || event.venueAddress) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Venue Information
                      </h3>
                      <div className="flex gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          {event.venueName && (
                            <p className="text-sm font-medium text-foreground">{event.venueName}</p>
                          )}
                          {event.venueNameOptional && event.venueNameOptional !== event.venueName && (
                            <p className="text-xs text-muted-foreground">{event.venueNameOptional}</p>
                          )}
                          {event.venueAddress && event.venueAddress !== event.venueName && (
                            <p className="text-sm text-foreground mt-1">{event.venueAddress}</p>
                          )}
                          {(event.latitude && event.longitude) && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs text-primary mt-1"
                              onClick={openInMaps}
                            >
                              Open in Maps
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Capacity & Website */}
                {(event.capacity || event.website) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {event.capacity && (
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Capacity</p>
                            <p className="text-sm font-medium text-foreground">{event.capacity} people</p>
                          </div>
                        </div>
                      )}
                      {event.website && (
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Globe className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Website</p>
                            <a
                              href={event.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline truncate flex items-center gap-1"
                            >
                              <span className="truncate">{event.website}</span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Tickets */}
                {event.isPaid && event.tickets && event.tickets.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        Tickets
                      </h3>
                      <div className="space-y-3">
                        {event.tickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-sm text-foreground">{ticket.ticketName}</h4>
                                {ticket.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{ticket.description}</p>
                                )}
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                ${typeof ticket.price === 'number' ? ticket.price.toFixed(2) : parseFloat(ticket.price).toFixed(2)}
                              </Badge>
                            </div>
                            {ticket.quantityAvailable !== null && (
                              <p className="text-xs text-muted-foreground">
                                {ticket.quantityAvailable} tickets available
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Additional Information */}
                {(event.parkingInfo || event.specialInstructions) && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      {event.parkingInfo && (
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Car className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Parking Information</p>
                            <p className="text-sm">{event.parkingInfo}</p>
                          </div>
                        </div>
                      )}
                      {event.specialInstructions && (
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Special Instructions</p>
                            <p className="text-sm">{event.specialInstructions}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Social Media Links */}
                {(event.facebookUrl || event.twitterUrl || event.instagramUrl || event.linkedInUrl) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Social Media
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {event.facebookUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={event.facebookUrl} target="_blank" rel="noopener noreferrer">
                              <Facebook className="h-4 w-4 mr-2" />
                              Facebook
                            </a>
                          </Button>
                        )}
                        {event.twitterUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={event.twitterUrl} target="_blank" rel="noopener noreferrer">
                              <Twitter className="h-4 w-4 mr-2" />
                              Twitter
                            </a>
                          </Button>
                        )}
                        {event.instagramUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={event.instagramUrl} target="_blank" rel="noopener noreferrer">
                              <Instagram className="h-4 w-4 mr-2" />
                              Instagram
                            </a>
                          </Button>
                        )}
                        {event.linkedInUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={event.linkedInUrl} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="h-4 w-4 mr-2" />
                              LinkedIn
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Event Creator */}
                {event.createdBy && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Event Creator
                      </h3>
                      <div className="flex items-start gap-4">
                        {event.createdBy.imageUrl ? (
                          <img
                            src={event.createdBy.imageUrl}
                            alt={`${event.createdBy.firstName} ${event.createdBy.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <p className="font-semibold text-foreground">
                            {event.createdBy.firstName} {event.createdBy.lastName}
                          </p>
                          {(event.createdBy.email || event.createdBy.phone) && (
                            <div className="space-y-1">
                              {event.createdBy.email && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="h-4 w-4" />
                                  <a href={`mailto:${event.createdBy.email}`} className="hover:text-primary">
                                    {event.createdBy.email}
                                  </a>
                                </div>
                              )}
                              {event.createdBy.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="h-4 w-4" />
                                  <a href={`tel:${event.createdBy.phone}`} className="hover:text-primary">
                                    {event.createdBy.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Order Details - Only shown when order exists */}
                {event.order && event.order.invoice && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Order Details
                      </h3>

                      <div className="space-y-2">
                        {event.order.invoice.contactName && (
                          <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-sm text-muted-foreground">Contact Name</span>
                            <span className="text-sm font-medium text-foreground">{event.order.invoice.contactName}</span>
                          </div>
                        )}
                        {event.order.invoice.phoneNumber && (
                          <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-sm text-muted-foreground">Phone</span>
                            <a href={`tel:${event.order.invoice.phoneNumber}`} className="text-sm font-medium text-primary hover:underline">
                              {event.order.invoice.phoneNumber}
                            </a>
                          </div>
                        )}
                        {event.order.invoice.eventDate && (
                          <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-sm text-muted-foreground">Event Date</span>
                            <span className="text-sm font-medium text-foreground">{formatDate(event.order.invoice.eventDate)}</span>
                          </div>
                        )}
                        {event.order.invoice.serviceTime && (
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-muted-foreground">Service Time</span>
                            <span className="text-sm font-medium text-foreground">{event.order.invoice.serviceTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Payment Information - Only shown when order has payment data */}
                {event.order && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Payment Information
                      </h3>

                      {/* Status Header */}
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</span>
                          {getPaymentStatusBadge(event.order.paymentStatus)}
                        </div>
                        {event.order.invoice?.invoiceStatus && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Invoice</span>
                            <Badge variant="outline" className="capitalize bg-white">
                              {event.order.invoice.invoiceStatus}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Payment Cards Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Amount Paid Card */}
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                              <DollarSign className="h-4 w-4 text-emerald-600" />
                            </div>
                          </div>
                          <p className="text-xs font-medium text-emerald-600/70 mb-1">Amount Paid</p>
                          <p className="text-xl font-bold text-emerald-700">
                            {event.order.paymentDetails?.amount
                              ? formatCurrency(event.order.paymentDetails.amount / 100, event.order.currency || 'usd')
                              : formatCurrency(parseFloat(event.order.amountPaid || '0'), event.order.currency || 'usd')
                            }
                          </p>
                        </div>

                        {/* Payment Method Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <CreditCard className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <p className="text-xs font-medium text-blue-600/70 mb-1">Payment Method</p>
                          <p className="text-lg font-semibold text-blue-700 capitalize">
                            {event.order.paymentMethodType || 'N/A'}
                          </p>
                        </div>

                        {/* Additional Tip Card */}
                        {event.order.invoice?.additionalTip && parseFloat(event.order.invoice.additionalTip) > 0 ? (
                          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-amber-600" />
                              </div>
                            </div>
                            <p className="text-xs font-medium text-amber-600/70 mb-1">Additional Tip</p>
                            <p className="text-lg font-semibold text-amber-700">
                              {formatCurrency(parseFloat(event.order.invoice.additionalTip), event.order.currency || 'usd')}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-slate-400" />
                              </div>
                            </div>
                            <p className="text-xs font-medium text-slate-400 mb-1">Additional Tip</p>
                            <p className="text-lg font-semibold text-slate-400">—</p>
                          </div>
                        )}

                        {/* Payment Date Card */}
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-purple-600" />
                            </div>
                          </div>
                          <p className="text-xs font-medium text-purple-600/70 mb-1">Payment Date</p>
                          <p className="text-lg font-semibold text-purple-700">
                            {formatDate(event.order.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
