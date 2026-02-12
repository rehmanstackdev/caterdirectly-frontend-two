
import { ServiceItem, PriceType } from '@/types/service-types';

// Helper function to transform database service data to ServiceItem interface
export function transformServiceData(data: any): ServiceItem {
  return {
    id: data.id,
    name: data.name,
    type: data.type as any,
    description: data.description,
    price: data.price,
    price_type: data.price_type as PriceType,
    image: data.image,
    status: data.status as any,
    active: data.active,
    isManaged: data.is_managed,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    vendorName: data.vendor_name,
    vendor_id: data.vendor_id,
    location: data.location || (data.vendors?.full_address) || (data.vendors?.city && data.vendors?.state ? `${data.vendors.city}, ${data.vendors.state}` : '') || '',
    reviews: data.reviews,
    rating: data.rating,
    adminFeedback: data.admin_feedback,
    serviceType: data.type,
    available: data.available,
    service_details: {
      ...(data.service_details || {}),
      // Preserve createdBy and vendor details if available at root level
      ...(data.createdBy && { createdBy: data.createdBy }),
      ...(data.vendor && { vendor: data.vendor }),
      ...(data.vendors && { vendor: data.vendors })
    }
  };
}
