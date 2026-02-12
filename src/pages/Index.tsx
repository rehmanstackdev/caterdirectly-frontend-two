
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/cater-directly/Header";
import HeroSection from "@/components/cater-directly/HeroSection";
import Footer from "@/components/cater-directly/Footer";
import VenuesSection from "@/components/cater-directly/VenuesSection";
import HowItWorksCard from "@/components/cater-directly/HowItWorksCard";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { useSimpleServicesPreloader } from "@/hooks/use-simple-service-preloader";
import SeoJsonLd from "@/components/shared/SeoJsonLd";

// Progressive loading of below-the-fold sections
const ServicesSection = lazy(() => import("@/components/cater-directly/ServicesSection"));
const HowItWorksSection = lazy(() => import("@/components/cater-directly/HowItWorksSection"));
const SearchBar = lazy(() => import("@/components/cater-directly/SearchBar"));
const AIEventPlannerSection = lazy(() => import("@/components/cater-directly/AIEventPlannerSection"));
const CaterersSection = lazy(() => import("@/components/cater-directly/CaterersSection"));
const CorporateShowcaseSection = lazy(() => import("@/components/cater-directly/CorporateShowcaseSection"));

const BrandsSection = lazy(() => import("@/components/cater-directly/BrandsSection"));

const FaqSection = lazy(() => import("@/components/cater-directly/FaqSection"));
const StaffRentalsSection = lazy(() => import("@/components/cater-directly/StaffRentalsSection"));
const BetaWaitlistCard = lazy(() => import("@/components/cater-directly/BetaWaitlistCard"));

const Index = () => {
  const { user, userRole, loading } = useAuth();
  const [loadPriority1, setLoadPriority1] = useState(false); // Services, HowItWorks, SearchBar
  const [loadPriority2, setLoadPriority2] = useState(false); // Caterers, Testimonials
  const [loadPriority3, setLoadPriority3] = useState(false); // Brands, Venues, FAQ, Staff
  const priority1Ref = useRef<HTMLDivElement>(null);
  const priority2Ref = useRef<HTMLDivElement>(null);
  const priority3Ref = useRef<HTMLDivElement>(null);
  
  // Redirect admin users to their dashboard
  // if (!loading && user && (userRole === 'admin' || userRole === 'super_admin')) {
  //   return <Navigate to="/admin/dashboard" replace />;
  // }
  
  // Preload marketplace services in the background (simplified version)
  useSimpleServicesPreloader();
  
  // Use Intersection Observer for progressive loading instead of artificial delays
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === priority1Ref.current) {
              setLoadPriority1(true);
            } else if (entry.target === priority2Ref.current) {
              setLoadPriority2(true);
            } else if (entry.target === priority3Ref.current) {
              setLoadPriority3(true);
            }
          }
        });
      },
      { 
        rootMargin: isMobile ? '100px' : '200px',
        threshold: 0.01
      }
    );

    if (priority1Ref.current) observer.observe(priority1Ref.current);
    if (priority2Ref.current) observer.observe(priority2Ref.current);
    if (priority3Ref.current) observer.observe(priority3Ref.current);

    return () => observer.disconnect();
  }, []);
  
  console.log('[Index] Component rendering');
  
  return (
    <ErrorBoundary>
      <LoadingProvider>
        {/* No MetaTags component here - using static HTML meta tags for better OG sharing */}
        <SeoJsonLd />
        <div id="top" className="min-h-screen bg-white overflow-x-hidden w-full">
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10">
              <Header />
              <HeroSection />
            </div>
          </div>

          <main className="w-full max-w-full overflow-hidden space-y-8 md:space-y-12 lg:space-y-16 px-4 md:px-6 mx-auto">
            {/* Priority 1: Above-the-fold sections */}
            <div ref={priority1Ref}>
            {loadPriority1 && (
              <Suspense fallback={<div className="h-32 bg-muted/5 animate-pulse rounded-lg" />}>
                <ServicesSection />
              </Suspense>
            )}
            
            
            {loadPriority1 && (
              <Suspense fallback={<div className="h-24 bg-muted/5 animate-pulse rounded-lg" />}>
                <SearchBar />
              </Suspense>
            )}
            {loadPriority1 && (
              <Suspense fallback={<div className="h-32 bg-muted/5 animate-pulse rounded-lg" />}>
                <section id="" className="scroll-mt-24 md:scroll-mt-28">
                  <HowItWorksSection />
                </section>
              </Suspense>
            )}
            {loadPriority1 && (
              <section id="how-it-works" className="scroll-mt-24 md:scroll-mt-28 container mx-auto px-4 py-2 md:py-4">
                <HowItWorksCard />
              </section>
            )}
            {/* AI Planner Section - Moved below SearchBar, admin-only */}
            {/* {loadPriority1 && (
              <Suspense fallback={<div className="h-32 bg-muted/5 animate-pulse rounded-lg" />}>
                <AIEventPlannerSection />
              </Suspense>
            )} */}

            </div>
            
            {/* Priority 2: Important content sections */}
            <div ref={priority2Ref}>
            {loadPriority2 && (
              <Suspense fallback={<div className="h-96 bg-muted/5 animate-pulse rounded-lg" />}>
                <div id="caterers" className="max-w-[1800px] mx-auto w-full scroll-mt-24 md:scroll-mt-28">
                  <CaterersSection />
                </div>
              </Suspense>
            )}
            
            {loadPriority2 && (
              <Suspense fallback={<div className="h-96 bg-muted/5 animate-pulse rounded-lg" />}>
                <CorporateShowcaseSection />
              </Suspense>
            )}
            
            {/* {loadPriority2 && (
              <Suspense fallback={<div className="h-32 bg-muted/5 animate-pulse rounded-lg" />}>
                <BetaWaitlistCard />
              </Suspense>
            )} */}
            

            
            </div>
            
            {/* Priority 3: Below-the-fold sections */}
            <div ref={priority3Ref}>
            {loadPriority3 && (
              <Suspense fallback={<div className="h-32 bg-muted/5 animate-pulse rounded-lg" />}>
                <BrandsSection />
              </Suspense>
            )}
            
            {loadPriority3 && (
              <VenuesSection />
            )}
            
            {loadPriority3 && (
              <Suspense fallback={<div className="h-48 bg-muted/5 animate-pulse rounded-lg" />}>
                <section id="faqs" className="scroll-mt-24 md:scroll-mt-28">
                  <FaqSection />
                </section>
              </Suspense>
            )}
            
            {loadPriority3 && (
              <Suspense fallback={<div className="h-64 bg-muted/5 animate-pulse rounded-lg" />}>
                <section id="staff-rentals" className="scroll-mt-24 md:scroll-mt-28">
                  <StaffRentalsSection />
                </section>
              </Suspense>
            )}
            </div>
          </main>

          <Footer />
        </div>
      </LoadingProvider>
    </ErrorBoundary>
  );
};

export default Index;

