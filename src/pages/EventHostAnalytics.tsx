
import React, { useEffect, useState } from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Button } from "@/components/ui/button";
import OrderCard from "@/components/orders/OrderCard";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import EventsList from "@/components/events/EventsList";
import { Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import OrderCardSkeleton from "@/components/orders/OrderCardSkeleton";
import { EventsAPI } from "@/api/events";
import { OrdersAPI } from "@/api/orders";
import { useAuth } from "@/contexts/auth";
import type { Event } from "@/types/order";
import type { Order } from "@/types/order-types";

const EventHostAnalytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [section, setSection] = useState<'orders' | 'events'>('events');
  
  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [eventActiveTab, setEventActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  
  // Orders state
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orderActiveTab, setOrderActiveTab] = useState<'active' | 'ended'>('active');
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  
  // Filter events and orders
  const filteredEvents = events.filter(event => {
    if (eventActiveTab === 'upcoming') return event.category === 'upcoming';
    if (eventActiveTab === 'past') return event.category === 'past';
    return false;
  });
  
  const orders = allOrders.filter(order => {
    if (orderActiveTab === 'active') return ['active', 'pending', 'confirmed'].includes(order.status);
    if (orderActiveTab === 'ended') return ['ended', 'completed'].includes(order.status);
    return false;
  });
  
  const ordersNeedingReview = allOrders.filter(order => order.needs_review).length;
  
  // Fetch events
  const fetchEvents = async () => {
    if (!user?.id) return;
    setIsEventsLoading(true);
    try {
      const eventsData = await EventsAPI.getEvents(user.id);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsEventsLoading(false);
    }
  };
  
  // Fetch orders
  const fetchOrders = async () => {
    if (!user?.id) return;
    setIsOrdersLoading(true);
    try {
      const ordersData = await OrdersAPI.getOrders(user.id);
      setAllOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsOrdersLoading(false);
    }
  };
  
  // Load data on mount
  useEffect(() => {
    fetchEvents();
    fetchOrders();
  }, [user?.id]);
  
  // Debug logging
  console.log('EventHostAnalytics - Events:', { filteredEvents, isEventsLoading });
  console.log('EventHostAnalytics - Orders:', { allOrders, orders, isOrdersLoading });

  useEffect(() => {
    const s = searchParams.get('section');
    if (s === 'orders' || s === 'events') {
      setSection(s);
    }
  }, [searchParams]);
  const orderTabs = [
    { id: "active", label: "Active Orders" },
    { id: "ended", label: "Past Orders" }
  ] as const;

  const eventTabs = [
    { id: "upcoming", label: "Upcoming Events" },
    { id: "past", label: "Past Events" }
  ] as const;

  const handleCreateNew = () => {
    if (section === 'orders') {
      navigate("/marketplace");
    } else {
      navigate("/events/create");
    }
  };

  // Render loading state
  const renderLoading = (type: 'orders' | 'events') => (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-[#F07712] mb-4" />
        <p className="text-gray-500">Loading {type}...</p>
      </CardContent>
    </Card>
  );

  return (
    <Dashboard activeTab="analytics" userRole="event-host">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#F07712] to-[#FFB473] bg-clip-text text-transparent">Events & Orders</h1>
          <Button 
            onClick={handleCreateNew}
            className="bg-[#F07712] hover:bg-[#F07712]/90 text-white rounded-full px-4 sm:px-6 py-1 sm:py-2 shadow-md"
          >
            {section === 'orders' ? "Create New Order" : "Create New Event"}
          </Button>
        </div>

        <div className="flex space-x-4 sm:space-x-6 border-b overflow-x-auto">
          <button
            onClick={() => { setSection('events'); setSearchParams({ section: 'events' }); }}
            className={`pb-2 px-1 font-medium transition-colors whitespace-nowrap ${section === 'events' ? 'border-b-2 border-[#F07712] text-[#F07712]' : 'text-gray-500'}`}
          >
            Events
          </button>
          <button
            onClick={() => { setSection('orders'); setSearchParams({ section: 'orders' }); }}
            className={`pb-2 px-1 font-medium transition-colors whitespace-nowrap ${section === 'orders' ? 'border-b-2 border-[#F07712] text-[#F07712]' : 'text-gray-500'}`}
          >
            Orders & Reviews
          </button>
        </div>

        {section === 'orders' ? (
          <>
            <div className="flex gap-2 sm:gap-4 border-b overflow-x-auto">
              {orderTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderActiveTab(tab.id)}
                  className="relative px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    {tab.label}
                    {tab.id === "ended" && ordersNeedingReview > 0 && (
                      <Badge variant="destructive" className="h-4 sm:h-5 w-4 sm:w-5 flex items-center justify-center rounded-full text-xs">
                        {ordersNeedingReview}
                      </Badge>
                    )}
                  </div>
                  {orderActiveTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#F07712]" />
                  )}
                </button>
              ))}
            </div>

            {isOrdersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <OrderCardSkeleton key={i} />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-500">No {orderActiveTab} orders found.</p>
                <p className="text-sm text-gray-400 mt-2">Debug: Total orders: {allOrders.length}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {orders.map((order) => (
                  <OrderCard key={order.id} {...order} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex gap-2 sm:gap-4 border-b overflow-x-auto">
              {eventTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setEventActiveTab(tab.id as any)}
                  className="relative px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    {tab.label}
                  </div>
                  {eventActiveTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#F07712]" />
                  )}
                </button>
              ))}
            </div>

            <EventsList events={filteredEvents} isLoading={isEventsLoading} />
          </>
        )}
      </div>
    </Dashboard>
  );
};

export default EventHostAnalytics;
