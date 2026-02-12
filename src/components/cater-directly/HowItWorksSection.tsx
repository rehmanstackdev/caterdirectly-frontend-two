import { Search, ShoppingCart, CheckCircle, ArrowRight } from "lucide-react";
import { useGeoCity } from "@/hooks/use-city";
import { useIsMobile } from "@/hooks/use-mobile";
import CompetitorComparisonTable from "./CompetitorComparisonTable";
import MobileComparisonCards from "./MobileComparisonCards";
import TrustSignalsGrid from "./TrustSignalsGrid";

const HowItWorksSection = () => {
  const { city, region, label: cityLabel } = useGeoCity();
  const isMobile = useIsMobile();
  const locationLabel = city ? `${city}${region ? `, ${region}` : ''}` : undefined;
  const locationQuery = city ? `&city=${encodeURIComponent(city)}${region ? `&region=${encodeURIComponent(region)}` : ""}` : "";
  const locationQueryStandalone = city ? `?city=${encodeURIComponent(city)}${region ? `&region=${encodeURIComponent(region)}` : ""}` : "";

  return (
    <section
      id="why-choose-us"
      aria-labelledby="how-it-works-title"
      className="relative w-full py-14 md:py-20 bg-background scroll-mt-24 md:scroll-mt-28"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.1)_0%,transparent_60%)]"
        aria-hidden="true"
      />
      {/* Soft edges for smooth section transitions */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[hsl(var(--background))] to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[hsl(var(--background))] to-transparent"
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 relative z-10 rounded-3xl ring-1 ring-border/30 bg-background/60 backdrop-blur-sm py-8 md:py-10">
        <div className="text-brand text-sm font-semibold tracking-wide text-center">Why choose us</div>
        <h2
          id="how-it-works-title"
          className="mt-3 text-center text-4xl md:text-5xl font-semibold leading-tight text-foreground"
        >
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Why Event Planners Choose Cater Directly
          </span>
        </h2>

        {/* Category Navigation Pills */}
        <nav className="mx-auto mt-6 max-w-3xl" aria-label={`Explore categories${locationLabel ? ` in ${locationLabel}` : ""}`}>
          <ul className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            <li>
              <a
                href={`/marketplace?category=catering${locationQuery}`}
                className="inline-flex items-center rounded-md bg-primary/10 text-primary px-3 py-1 text-xs md:text-sm ring-1 ring-primary/20 hover:bg-primary/15 transition-colors"
                title={`Explore catering${locationLabel ? ` in ${locationLabel}` : ""}`}
              >
                Catering
              </a>
            </li>
            <li>
              <a
                href={`/marketplace?category=venues${locationQuery}`}
                className="inline-flex items-center rounded-md bg-primary/10 text-primary px-3 py-1 text-xs md:text-sm ring-1 ring-primary/20 hover:bg-primary/15 transition-colors"
                title={`Explore venues${locationLabel ? ` in ${locationLabel}` : ""}`}
              >
                Venues
              </a>
            </li>
            <li>
              <a
                href={`/marketplace?category=staffing${locationQuery}`}
                className="inline-flex items-center rounded-md bg-primary/10 text-primary px-3 py-1 text-xs md:text-sm ring-1 ring-primary/20 hover:bg-primary/15 transition-colors"
                title={`Explore staffing${locationLabel ? ` in ${locationLabel}` : ""}`}
              >
                Staffing
              </a>
            </li>
            <li>
              <a
                href={`/marketplace?category=party-rentals${locationQuery}`}
                className="inline-flex items-center rounded-md bg-primary/10 text-primary px-3 py-1 text-xs md:text-sm ring-1 ring-primary/20 hover:bg-primary/15 transition-colors"
                title={`Explore party rentals${locationLabel ? ` in ${locationLabel}` : ""}`}
              >
                Party rentals
              </a>
            </li>
          </ul>
        </nav>

        {/* Block 1: Competitive Comparison Table */}
        <div className="mt-6 md:mt-10 px-2 sm:px-4">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2 px-4">
            Stop juggling 3+ platforms for one event
          </h3>
          <p className="text-center text-muted-foreground text-sm sm:text-base mb-6 md:mb-8 max-w-3xl mx-auto px-4">
            {city 
              ? `Why ${city} planners switched from ezCater, Peerspace & Instawork` 
              : 'Why event planners switched from ezCater, Peerspace & Instawork'}
          </p>
          
          {isMobile ? (
            <MobileComparisonCards city={city} region={region} />
          ) : (
            <CompetitorComparisonTable city={city} region={region} />
          )}
        </div>

        {/* Block 2: Trust Signals Grid */}
        <TrustSignalsGrid />

  
      </div>
    </section>
  );
};

export default HowItWorksSection;
