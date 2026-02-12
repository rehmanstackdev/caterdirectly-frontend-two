import { Shield, Headphones, Check } from "lucide-react";

const TrustSignalsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
      {/* Quality Guarantee */}
        <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-lg font-semibold">Trained Agency Staff</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
              <span>Professional staffing agencies (not freelance gig workers like Instawork)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
              <span>Ongoing training programs & quality standards</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
              <span>Fully insured & background checked</span>
            </li>
          </ul>
        </div>

        {/* Coordination Support */}
        <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
              <Headphones className="w-6 h-6 text-brand" />
            </div>
            <h3 className="text-lg font-semibold">We Handle Everything</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
              <span>Dedicated event coordinator (not just a booking app)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
              <span>Staff coordinated with caterers & venues</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
              <span>Budget tracking & approval workflows</span>
            </li>
          </ul>
        </div>
      </div>
  );
};

export default TrustSignalsGrid;
