import { EventGuest } from "@/types/order";

export interface InvitationToken {
  id: string;
  token: string;
  email: string;
  eventId?: string;
  orderId?: string;
  type: 'event' | 'group_order' | 'both';
  isUsed: boolean;
  expiresAt: string;
}

/**
 * Service for managing invitation tokens for events and group orders
 */
export const invitationService = {
  /**
   * Generate a new invitation token
   */
  async generateToken({
    email,
    eventId,
    orderId,
    type = 'event',
    expiryDays = 30
  }: {
    email: string,
    eventId?: string,
    orderId?: string,
    type?: 'event' | 'group_order' | 'both',
    expiryDays?: number
  }): Promise<InvitationToken | null> {
    console.log('API Call: generateToken', {
      email,
      eventId,
      orderId,
      type,
      expiryDays
    });

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Generate a random token
    const token = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);

    const mockToken: InvitationToken = {
      id: `token-${Date.now()}`,
      token,
      email,
      eventId,
      orderId,
      type,
      isUsed: false,
      expiresAt: expiresAt.toISOString()
    };

    console.log('API Call Complete: generateToken', { result: mockToken });
    return mockToken;
  },

  /**
   * Validate an invitation token
   */
  async validateToken(token: string): Promise<InvitationToken | null> {
    console.log('API Call: validateToken', { token });

    // Return mock token data for valid tokens
    const mockTokenData: InvitationToken = {
      id: `token-${Date.now()}`,
      token,
      email: 'guest@example.com',
      eventId: 'event-123',
      orderId: undefined,
      type: 'event',
      isUsed: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    console.log('API Call Complete: validateToken', { result: mockTokenData });
    return mockTokenData;
  },

  /**
   * Mark a token as used
   */
  async markTokenAsUsed(token: string): Promise<boolean> {
    console.log('API Call: markTokenAsUsed', { token });
    console.log('API Call Complete: markTokenAsUsed', { result: true });
    return true;
  },

  /**
   * Get event details by token
   */
  async getEventDetailsByToken(token: string): Promise<any> {
    console.log('API Call: getEventDetailsByToken', { token });

    const tokenData = await this.validateToken(token);
    if (!tokenData || !tokenData.eventId) {
      console.log('API Call Complete: getEventDetailsByToken', { result: null });
      return null;
    }

    const mockEvent = {
      id: tokenData.eventId,
      title: 'Mock Event',
      description: '',
      date: new Date().toISOString(),
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      location: '',
      venueName: '',
      type: '',
      capacity: 0,
      guests: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      image: '',
      eventUrl: '',
      isPublic: false,
      isTicketed: false,
      ticketTypes: [],
      host_id: 'mock-host-id'
    };

    console.log('API Call Complete: getEventDetailsByToken', { result: mockEvent });
    return mockEvent;
  },

  /**
   * Get order details by token
   */
  async getOrderDetailsByToken(token: string): Promise<any> {
    console.log('API Call: getOrderDetailsByToken', { token });

    const tokenData = await this.validateToken(token);
    if (!tokenData || !tokenData.orderId) {
      console.log('API Call Complete: getOrderDetailsByToken', { result: null });
      return null;
    }

    const mockOrder = {
      id: tokenData.orderId,
      title: 'Mock Order',
      location: '',
      date: new Date().toISOString(),
      price: 0,
      guests: 0,
      status: 'pending',
      created_at: new Date().toISOString(),
      order_number: `ORD-${Date.now()}`,
      revision_number: 0
    };

    console.log('API Call Complete: getOrderDetailsByToken', { result: mockOrder });
    return mockOrder;
  },

  /**
   * Update guest RSVP with token
   */
  async updateGuestRsvpWithToken(
    token: string,
    rsvpStatus: 'pending' | 'confirmed' | 'declined',
    foodSelection?: any
  ): Promise<EventGuest | null> {
    console.log('API Call: updateGuestRsvpWithToken', {
      token,
      rsvpStatus,
      foodSelection
    });

    const tokenData = await this.validateToken(token);
    if (!tokenData || !tokenData.eventId) {
      console.log('API Call Complete: updateGuestRsvpWithToken', { result: null });
      return null;
    }

    // Mark the token as used
    await this.markTokenAsUsed(token);

    const mockGuest: EventGuest = {
      id: `guest-${Date.now()}`,
      name: 'Mock Guest',
      email: tokenData.email,
      rsvpStatus,
      phone: '',
      company: '',
      dietaryRestrictions: '',
      jobTitle: ''
    };

    console.log('API Call Complete: updateGuestRsvpWithToken', { result: mockGuest });
    return mockGuest;
  }
};
