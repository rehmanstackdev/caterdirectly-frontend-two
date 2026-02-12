import { Check, X, Building2, Users, UserCog, Network, Zap, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_LOGO } from "@/constants/app-assets";

const CorporateShowcaseSection = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-slate-50 to-gray-50 relative overflow-hidden">
      {/* Subtle dot pattern texture */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.15) 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }} />
      
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Split Layout: Visual (40%) / Content (60%) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 lg:gap-16 items-center">
          
          {/* Left Side: Geometric Visual Element */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="relative w-full max-w-md mx-auto lg:max-w-none aspect-square">
              {/* Geometric composition with icons */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Background circles */}
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
                
                {/* Icon arrangement */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Center large icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white flex items-center justify-center backdrop-blur-sm border border-primary/20 shadow-sm">
                <img 
                  src={APP_LOGO.url} 
                  alt={APP_LOGO.alt}
                  className="w-24 h-24 md:w-32 md:h-32 object-contain"
                />
              </div>
                  </div>
                  
                  {/* Top right icon */}
                  <div className="absolute top-4 right-4 md:top-8 md:right-8">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                      <Building2 className="w-8 h-8 md:w-10 md:h-10 text-foreground/60" strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  {/* Bottom left icon */}
                  <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                      <Users className="w-8 h-8 md:w-10 md:h-10 text-foreground/60" strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  {/* Connecting lines */}
                  <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                    <line 
                      x1="50%" 
                      y1="50%" 
                      x2="75%" 
                      y2="25%" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth="1" 
                      strokeOpacity="0.2"
                      strokeDasharray="4,4"
                    />
                    <line 
                      x1="50%" 
                      y1="50%" 
                      x2="25%" 
                      y2="75%" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth="1" 
                      strokeOpacity="0.2"
                      strokeDasharray="4,4"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="lg:col-span-3 space-y-8 md:space-y-10 lg:space-y-12">
            
            {/* Headline with mixed styling */}
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Stop juggling multiple platforms –{" "}
                <span className="text-primary">coordinate everything in one place</span>
              </h2>
            </div>

            {/* Before/After Comparison - Clean List Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              
              {/* The Traditional Way */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  The Traditional Way
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-base md:text-lg leading-relaxed">
                      3 separate platforms
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-base md:text-lg leading-relaxed">
                      12+ email threads per event
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-base md:text-lg leading-relaxed">
                      2-week planning cycles
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-base md:text-lg leading-relaxed">
                      3 invoices to reconcile
                    </span>
                  </li>
                </ul>
              </div>

              {/* With Cater Directly */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                  With Cater Directly
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="text-base md:text-lg leading-relaxed">
                      One conversation
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="text-base md:text-lg leading-relaxed">
                      48-hour turnaround
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="text-base md:text-lg leading-relaxed">
                      Real-time coordination
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="text-base md:text-lg leading-relaxed">
                      Single invoice
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Integrated Benefits - Emphasized Container */}
            <div className="p-6 md:p-8 rounded-2xl border-2 border-primary/10 bg-white/50 backdrop-blur-sm shadow-sm">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-6">
                Your benefits:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Benefit 1: Dedicated event coordinator */}
                <div className="flex flex-col items-start gap-3 p-5 rounded-xl border border-border/50 bg-background hover:border-primary/30 hover:bg-primary/5 transition-all duration-200">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <UserCog className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-foreground text-base">Dedicated Coordinator</h4>
                    <p className="text-sm text-muted-foreground leading-snug">Personal event manager for your needs</p>
                  </div>
                </div>

                {/* Benefit 2: Cross-vendor management */}
                <div className="flex flex-col items-start gap-3 p-5 rounded-xl border border-border/50 bg-background hover:border-primary/30 hover:bg-primary/5 transition-all duration-200">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Network className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-foreground text-base">Cross-Vendor Management</h4>
                    <p className="text-sm text-muted-foreground leading-snug">Seamless coordination across vendors</p>
                  </div>
                </div>

                {/* Benefit 3: 48-hour quote turnaround */}
                <div className="flex flex-col items-start gap-3 p-5 rounded-xl border border-border/50 bg-background hover:border-primary/30 hover:bg-primary/5 transition-all duration-200">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-foreground text-base">48-Hour Turnaround</h4>
                    <p className="text-sm text-muted-foreground leading-snug">Fast quotes for time-sensitive events</p>
                  </div>
                </div>

                {/* Benefit 4: Single invoice, NET-30 terms */}
                <div className="flex flex-col items-start gap-3 p-5 rounded-xl border border-border/50 bg-background hover:border-primary/30 hover:bg-primary/5 transition-all duration-200">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-foreground text-base">Single Invoice</h4>
                    <p className="text-sm text-muted-foreground leading-snug">NET-30 terms, simplified billing</p>
                  </div>
                </div>
              </div>
              
              {/* CTA Button inside container */}
              <div className="pt-6 mt-6 border-t border-border/50">
                <Button 
                  size="lg"
                  className="w-full md:w-auto bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-6 text-base md:text-lg font-semibold"
                  asChild
                >
                  <a href="mailto:info@caterdirectly.com">
                    Talk to Your Coordinator →
                  </a>
                </Button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default CorporateShowcaseSection;
