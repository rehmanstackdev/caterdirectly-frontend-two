
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Order, OrderStatus, Review, Dispute } from "@/types/order-types";
import { OrdersAPI } from "@/api/orders";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { DraftOrder } from "./use-draft-orders";
import { computeEnhancedDraftGroupKey } from "@/lib/utils";
import { APP_LOGO } from "@/constants/app-assets";
import { getServiceImageUrl, getServiceMenuImageUrl } from "@/utils/image-utils";

export const useOrders = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<OrderStatus>("active");
  const { user } = useAuth();
  
  // Fetch orders and drafts for the current user
  const {
    data: allOrders = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Fetch regular orders from backend API
      const orders = await OrdersAPI.getOrders(user.id);

      // Fetch draft orders and convert to Order format
      const { data: drafts, error: draftsError } = await supabase
        .from('draft_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (draftsError) {
        console.error('Error fetching drafts:', draftsError);
        throw draftsError;
      }

      // Group drafts by a stable key to consolidate versions and keep latest
      const grouped = new Map<string, any>();
      (drafts || []).forEach((draft: any) => {
        const key = computeEnhancedDraftGroupKey({
          name: draft.name,
          form_data: draft.form_data,
          date: draft.form_data?.date,
          location: draft.form_data?.location,
          selected_services: draft.selected_services,
        });
        const existing = grouped.get(key);
        if (!existing || new Date(draft.updated_at).getTime() > new Date(existing.updated_at).getTime()) {
          grouped.set(key, draft);
        }
      });
const latestDrafts = Array.from(grouped.values());

// Resolve best image for a draft: Venue > Catering > App logo
const resolveDraftImage = (draft: any): string => {
  const services = draft?.selected_services || [];
  if (Array.isArray(services) && services.length) {
    // 1) Venue takes priority
    const venue = services.find((s: any) => {
      const t = (s?.serviceType || s?.type || '').toString().toLowerCase();
      return t.includes('venue');
    });
    if (venue) {
      const vImg = getServiceImageUrl(venue) || (venue.serviceImage ?? venue.image);
      if (vImg) return getServiceImageUrl(vImg);
    }
    // 2) Catering next (use menu image when possible)
    const catering = services.find((s: any) => {
      const t = (s?.serviceType || s?.type || '').toString().toLowerCase();
      return t.includes('catering');
    });
    if (catering) {
      const menuImg = getServiceMenuImageUrl(catering);
      if (menuImg) return getServiceImageUrl(menuImg);
      const cImg = getServiceImageUrl(catering) || (catering.serviceImage ?? catering.image);
      if (cImg) return getServiceImageUrl(cImg);
    }
  }
  return APP_LOGO.url;
};

      // Convert grouped latest drafts to Order format
const draftOrders: Order[] = (latestDrafts || []).map((draft: any) => ({
  id: draft.id,
  title: draft.name,
  host_id: draft.user_id,
  price: draft.estimated_total || 0,
  status: 'draft' as OrderStatus,
  created_at: draft.created_at,
  service_details: JSON.stringify(draft.selected_services || []),
  booking_details: JSON.stringify(draft.form_data || {}),
  // Draft-specific data
  isDraft: true,
  draftData: draft,
  // Ensure all Order properties exist
  vendor_id: undefined,
  vendor_name: undefined,
  guests: undefined,
  location: draft.form_data?.location,
  date: draft.form_data?.date,
  image: resolveDraftImage(draft),
  needs_review: false,
  review: undefined,
  dispute: undefined,
  guest_orders: undefined,
  is_group_order: false
}));

      // Ensure regular orders have all required properties
      const normalizedOrders: Order[] = (orders || []).map((order: any) => ({
        ...order,
        status: order.status as OrderStatus,
        isDraft: false
      }));

      // Fetch disputes for these orders and attach minimal dispute info
      let ordersWithDisputes: Order[] = normalizedOrders;
      try {
        const orderIds = normalizedOrders.map(o => o.id).filter(Boolean);
        if (orderIds.length) {
          const { data: disputesRows, error: disputesError } = await supabase
            .from('disputes')
            .select('order_id,status')
            .in('order_id', orderIds as any);

          if (disputesError) {
            console.warn('Error fetching disputes:', disputesError);
          } else {
            const disputesByOrder = new Map<string, any>();
            (disputesRows || []).forEach((row: any) => {
              disputesByOrder.set(row.order_id, { status: row.status });
            });
            ordersWithDisputes = normalizedOrders.map(o =>
              disputesByOrder.has(o.id)
                ? { ...o, dispute: disputesByOrder.get(o.id) }
                : { ...o, dispute: undefined }
            );
          }
        }
      } catch (e) {
        console.warn('Disputes fetch failed, continuing without disputes', e);
      }

      return [...ordersWithDisputes, ...draftOrders];
    },
    enabled: !!user,
    meta: {
      onError: (err: Error) => {
        console.error('Error fetching orders:', err);
        toast.error('Failed to fetch orders');
      }
    }
  });

  // Filter orders based on active tab
  const orders = allOrders.filter(order => order.status === activeTab);
  
  // Calculate derived data
  const totalOrders = allOrders.length;
  const ordersNeedingReview = allOrders.filter(order => order.status === 'ended' && order.needs_review).length;
  const totalReviews = allOrders.filter(order => order.status === 'ended' && order.needs_review === false && !order.isDraft).length;
  const totalDisputes = allOrders.filter(order => !!order.dispute).length;

  // Review submission mutation (order-level legacy)
  const submitReviewMutation = useMutation({
    mutationFn: ({ orderId, review }: { orderId: string; review: Review }) => 
      OrdersAPI.submitReview(orderId, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
      toast.success('Review submitted successfully!');
    },
    onError: (err) => {
      console.error('Error submitting review:', err);
      toast.error('Failed to submit review');
    }
  });

  // Service-level reviews mutation
  const submitServiceReviewsMutation = useMutation({
    mutationFn: ({ orderId, reviews }: { orderId: string; reviews: { serviceId: string; rating: number; comment?: string }[] }) =>
      OrdersAPI.submitOrderServiceReviews(orderId, reviews),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
      toast.success('Reviews submitted successfully!');
    },
    onError: (err) => {
      console.error('Error submitting service reviews:', err);
      toast.error('Failed to submit reviews');
    }
  });

  // Dispute submission mutation
  const submitDisputeMutation = useMutation({
    mutationFn: ({ orderId, reason, details }: { orderId: string; reason: string; details: string }) => 
      OrdersAPI.submitDispute(orderId, reason, details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
      toast.success('Dispute submitted successfully!');
    },
    onError: (err) => {
      console.error('Error submitting dispute:', err);
      toast.error('Failed to submit dispute');
    }
  });
  
  // Create Order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData: Omit<Order, 'id'>) => 
      OrdersAPI.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
      toast.success('Order created successfully!');
    },
    onError: (err) => {
      console.error('Error creating order:', err);
      toast.error('Failed to create order');
    }
  });

  // Public methods that mirror the original API but now use mutations
  const submitReview = async (orderId: string, review: Review) => {
    return submitReviewMutation.mutateAsync({ orderId, review });
  };

  const submitServiceReviews = async (orderId: string, reviews: { serviceId: string; rating: number; comment?: string }[]) => {
    return submitServiceReviewsMutation.mutateAsync({ orderId, reviews });
  };

  const submitDispute = async (orderId: string, reason: string, details: string) => {
    return submitDisputeMutation.mutateAsync({ orderId, reason, details });
  };
  
  const createOrder = async (orderData: Omit<Order, 'id'>) => {
    return createOrderMutation.mutateAsync(orderData);
  };

  return {
    orders,
    allOrders,
    activeTab,
    setActiveTab,
    totalOrders,
    ordersNeedingReview,
    totalReviews,
    totalDisputes,
    submitReview,
    submitDispute,
    createOrder,
    isLoading,
    error,
    isSubmittingReview: submitReviewMutation.isPending,
    isSubmittingDispute: submitDisputeMutation.isPending,
    isCreatingOrder: createOrderMutation.isPending,
    isSubmittingServiceReviews: submitServiceReviewsMutation.isPending
  };
};

