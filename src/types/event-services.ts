export interface EventService {
  id: string;
  event_id: string;
  order_id?: string;
  service_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EventServiceInsert {
  event_id: string;
  order_id?: string;
  service_id?: string;
}

export interface EventServiceUpdate {
  order_id?: string;
  service_id?: string;
}

// Enhanced event type with structured address
export interface EventWithAddress {
  id: string;
  title: string;
  description?: string;
  venue_name?: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip?: string;
  address_full?: string;
  coordinates_lat?: number;
  coordinates_lng?: number;
  start_date: string;
  end_date: string;
  event_url?: string;
  max_capacity?: number;
  is_public: boolean;
  is_ticketed: boolean;
  image?: string;
  host_id: string;
  created_at: string;
  updated_at: string;
}

// Event form data interface
export interface EventFormData {
  title: string;
  description: string;
  venueName?: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip?: string;
  addressFull?: string;
  coordinatesLat?: number;
  coordinatesLng?: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  eventUrl?: string;
  capacity?: number;
  isPublic: boolean;
  isTicketed: boolean;
  image?: string;
  hostId?: string;
  ticketTypes: TicketType[];
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
  quantity?: number;
  sold: number;
}
