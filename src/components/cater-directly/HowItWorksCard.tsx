import { Search, ShoppingCart, CheckCircle, ArrowRight } from "lucide-react";
import { useGeoCity } from "@/hooks/use-city";

const HowItWorksCard = () => {
  const { city, region, label: cityLabel } = useGeoCity();
  const locationLabel = city ? `${city}${region ? `, ${region}` : ''}` : undefined;
  const locationQueryStandalone = city ? `?city=${encodeURIComponent(city)}${region ? `&region=${encodeURIComponent(region)}` : ""}` : "";

  return (
    <div className="mt-2 md:mt-4 bg-gradient-to-br from-primary/5 to-transparent rounded-xl md:rounded-2xl p-4 md:p-8">
      <h3 className="text-xl md:text-2xl font-bold text-center mb-3 md:mb-6">How It Works</h3>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 md:gap-6 md:gap-4 items-center">
        {/* Step 1 */}
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
            <Search className="w-6 h-6 md:w-8 md:h-8 text-brand" />
          </div>
          <h4 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Browse & Quote</h4>
          <p className="text-xs md:text-sm text-muted-foreground">
            Search all categories{locationLabel ? ` in ${locationLabel}` : ''}, check availability, get instant quotes
          </p>
        </div>
        
        {/* Arrow 1 */}
        <div className="hidden md:flex items-center justify-center">
          <ArrowRight className="w-8 h-8 text-muted-foreground/30" />
        </div>
        
        {/* Step 2 */}
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
            <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-brand" />
          </div>
          <h4 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Book in One Cart</h4>
          <p className="text-xs md:text-sm text-muted-foreground">
            Add catering, venue, staff & rentals to one cart — checkout once
          </p>
        </div>
        
        {/* Arrow 2 */}
        <div className="hidden md:flex items-center justify-center">
          <ArrowRight className="w-8 h-8 text-muted-foreground/30" />
        </div>
        
        {/* Step 3 */}
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
            <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-success" />
          </div>
          <h4 className="text-base md:text-lg font-semibold mb-1 md:mb-2">We Handle Everything</h4>
          <p className="text-xs md:text-sm text-muted-foreground">
            Your coordinator ensures vendors work together — you get one invoice
          </p>
        </div>
      </div>
      
      <div className="text-center mt-4 md:mt-6">
        <a
          href={`/marketplace${locationQueryStandalone}`}
          className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-5 py-2.5 md:px-6 md:py-3 text-xs md:text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors"
          title={`Start browsing vendors${locationLabel ? ` in ${locationLabel}` : ""}`}
        >
          Browse Marketplace{locationLabel ? ` in ${locationLabel}` : ''}
        </a>
      </div>
    </div>
  );
};

export default HowItWorksCard;

