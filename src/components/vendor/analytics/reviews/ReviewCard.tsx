
import React, { useState } from 'react';
import { Star, Calendar, Tag } from 'lucide-react';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment?: string;
    serviceType: string;
    createdAt: string;
    customer: {
      firstName?: string;
      lastName?: string;
      imageUrl?: string;
      email?: string;
    } | null;
  };
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const [imageError, setImageError] = useState(false);
  
  const customerName = review.customer 
    ? `${review.customer.firstName || ''} ${review.customer.lastName || ''}`.trim() || 'Anonymous'
    : 'Anonymous';
  
  const reviewDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const serviceTypeFormatted = review.serviceType
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  const imageUrl = review.customer?.imageUrl;
  const email = review.customer?.email;
  const showImage = imageUrl && !imageError;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {showImage ? (
              <img 
                src={imageUrl} 
                alt={customerName}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                {customerName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 text-base">{customerName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const filled = i < Math.floor(review.rating);
                    const halfFilled = !filled && i === Math.floor(review.rating) && review.rating % 1 >= 0.5;
                    return (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          filled 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : halfFilled
                            ? 'text-yellow-500 fill-yellow-500 opacity-50'
                            : 'text-gray-300'
                        }`} 
                      />
                    );
                  })}
                  <span className="ml-1 text-sm font-medium text-gray-700">
                    {review.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Information */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" />
          <span className="font-medium">{serviceTypeFormatted}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>{reviewDate}</span>
        </div>
      </div>

      {/* Review Comment */}
      {review.comment && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-gray-700 leading-relaxed text-sm">{review.comment}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
