import { useNavigate } from "react-router-dom";
import TypewriterText from "./TypewriterText";
import HeroEventGallery from "./HeroEventGallery";
import { Button } from "@/components/ui/button";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { ArrowRight, Check } from "lucide-react";
import { HOMEPAGE_TYPEWRITER_PHRASES } from "@/content/siteMeta";
import { useMarketplacePrefetch } from "@/hooks/use-marketplace-prefetch";

const HeroSection = () => {
  const { isDesktop, isMobile, isTablet } = useMobileDetection();
  const navigate = useNavigate();
  const testimonialCount = 250;
  const { prefetchAllTabs } = useMarketplacePrefetch();

  return (
    <div className="flex flex-col self-stretch relative min-h-[500px] md:min-h-[700px] w-full items-center pt-3 md:pt-8 px-3 sm:px-4 md:px-8 lg:px-20 pb-4 md:pb-12 bg-primary">
        <picture>
          <source 
            media="(max-width: 480px)" 
            srcSet="https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/529cf24329fb06cf8519dd04ea3781b5eb517582?width=480&quality=70&format=webp"
          />
          <source 
            media="(max-width: 768px)" 
            srcSet="https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/529cf24329fb06cf8519dd04ea3781b5eb517582?width=768&quality=75&format=webp"
          />
          <source 
            media="(max-width: 1024px)" 
            srcSet="https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/529cf24329fb06cf8519dd04ea3781b5eb517582?width=1024&quality=80&format=webp"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/529cf24329fb06cf8519dd04ea3781b5eb517582?width=1920&quality=85&format=webp"
            srcSet="
              https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/529cf24329fb06cf8519dd04ea3781b5eb517582?width=480&quality=70&format=webp 480w,
              https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/529cf24329fb06cf8519dd04ea3781b5eb517582?width=768&quality=75&format=webp 768w,
              https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/529cf24329fb06cf8519dd04ea3781b5eb517582?width=1280&quality=80&format=webp 1280w,
              https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/529cf24329fb06cf8519dd04ea3781b5eb517582?width=1920&quality=85&format=webp 1920w
            "
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            alt="Hero background"
            fetchPriority="high"
            loading="eager"
          />
      </picture>
      
      <div className="relative z-10 flex w-full max-w-[1600px] flex-col md:flex-row gap-4 md:gap-6 lg:gap-10 items-center">
        {/* Left Side: Messaging + CTA (Mobile: Stacked, Desktop: 55% width) */}
        <div className="w-full md:w-[52%] lg:w-[55%] flex flex-col order-2 md:order-1">
          {/* H1 Headline with Typewriter */}
          <h1 className="font-manrope text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight">
            <span>Book </span>
            <TypewriterText 
              phrases={HOMEPAGE_TYPEWRITER_PHRASES}
              className="text-[hsl(var(--brand))] inline"
              speed={150}
            />
            <span> for Bay Area Events</span>
          </h1>
          
          {/* Value Proposition Bullets */}
          <div className="mt-3 md:mt-6 space-y-1.5 lg:space-y-3" style={{ minHeight: 'calc(4 * (1.25rem + 0.375rem))' }}>
            {isMobile ? (
              // Mobile: Ultra-compact bullets (< 768px)
              <>
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <p className="text-white text-xs font-medium leading-tight">
                    <span className="font-bold">Book everything in one place</span> — Catering + venues + staff + rentals (unlike ezCater or Peerspace)
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <p className="text-white text-xs font-medium leading-tight">
                    <span className="font-bold">Top-rated vendors only</span> — We only accept vendors with +4.8-star ratings
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <p className="text-white text-xs font-medium leading-tight">
                    <span className="font-bold">Managed Office Meal Programs</span> — Like Zerocater & Cater2.Me for recurring office catering
                  </p>
                </div>
              </>
            ) : isTablet ? (
              // Tablet: Medium bullets (768-1024px)
              <>
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <p className="text-white text-sm font-bold leading-snug">
                    Book everything in one place — Catering + venues + staff + rentals
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <p className="text-white text-sm font-bold leading-snug">
                    Top-rated vendors only — We only accept vendors with +4.8-star ratings
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <p className="text-white text-sm font-bold leading-snug">
                    Managed Office Meal Programs — Like Zerocater & Cater2.Me for recurring office catering
                  </p>
                </div>
              </>
            ) : (
              // Desktop: Full expanded bullets (> 1024px)
              <>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center mt-0.5">
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-white text-lg font-bold leading-relaxed">
                      Book everything in one place
                    </p>
                    <p className="text-white/90 text-sm mt-1 leading-relaxed">
                      Unlike ezCater (catering only) or Peerspace (venues only), coordinate catering + venues + staff + rentals in a single cart with coordinated logistics
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center mt-0.5">
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-white text-lg font-bold leading-relaxed">
                      Top-rated vendors only
                    </p>
                    <p className="text-white/90 text-sm mt-1 leading-relaxed">
                      We only accept vendors with +4.8-star ratings on other platforms
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center mt-0.5">
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-white text-lg font-bold leading-relaxed">
                      Managed Office Meal Programs
                    </p>
                    <p className="text-white/90 text-sm mt-1 leading-relaxed">
                      Like Zerocater & Cater2.Me — we handle budget tracking, menu planning, dietary coordination, and logistics
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Primary CTA */}
          <div className="mt-4 md:mt-8">
            <Button
              onClick={() => navigate('/marketplace')}
              onMouseEnter={() => prefetchAllTabs()}
              size="lg"
              className="bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand))]/90 text-white font-semibold text-sm sm:text-base md:text-lg py-3 sm:py-4 md:py-5 px-5 sm:px-6 md:px-8 rounded-full h-auto shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              View Marketplace
              <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
          
          {/* Social Proof */}
          <div className="mt-3 md:mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs md:text-sm mb-6 lg:mb-0">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-[hsl(var(--brand))]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-white font-bold text-base md:text-lg">
                4.9/5
              </span>
              <span className="text-white/90 text-sm md:text-base">
                from {testimonialCount}+ events
              </span>
            </div>
            
            <div className="h-0 sm:h-6 w-full sm:w-px bg-white/30" />
            
            <div className="text-white/90 text-sm md:text-base font-medium flex items-center gap-2 -mt-2 sm:mt-0">
              <svg className="w-5 h-5 text-[hsl(var(--brand))]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              San Francisco Bay Area Events • 50-5,000+ headcount
            </div>
          </div>
        </div>
        
        {/* Right Side: Event Gallery */}
        <div className="w-full md:w-[48%] lg:w-[45%] mt-4 md:mt-0 order-1 md:order-2">
          <div className="aspect-[3/2] md:aspect-[4/5] lg:aspect-[3/4] max-w-[500px] mx-auto md:max-w-none rounded-2xl overflow-hidden">
            <HeroEventGallery />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
