import { Building, CheckCircle } from "lucide-react";

const CASE_STUDIES = [
  {
    company: "Tech Startup (Series B, 150 employees)",
    challenge: "Spending 10+ hours/month coordinating office meals across 3 platforms",
    solution: "Automated recurring lunch program with dietary tracking",
    results: [
      "Saved 40 hours/month in admin time",
      "Reduced meal costs by 25% vs. previous provider",
      "Improved employee satisfaction (4.8/5 meal rating)"
    ],
    quote: "Cater Directly eliminated the chaos of juggling ezCater, Peerspace, and delivery apps. Now our team gets great food without me being a full-time event planner.",
    attribution: "Office Manager"
  },
  {
    company: "Fortune 500 Financial Services Firm",
    challenge: "Needed single vendor for quarterly all-hands (800 attendees) with venue + catering + AV",
    solution: "Full-service event coordination with dedicated project manager",
    results: [
      "Coordinated 4 quarterly events in 2024",
      "Single invoice for all services (simplified accounting)",
      "NET-30 billing with PO support"
    ],
    quote: "Unlike our old process of calling 5+ vendors separately, Cater Directly gave us one point of contact for everything. Game changer for corporate events.",
    attribution: "VP of Operations"
  }
];

const CaseStudiesSection = () => {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-[1800px]">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-sm font-semibold tracking-wide text-primary mb-2">SUCCESS STORIES</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            How Companies Save Time & Money with Cater Directly
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {CASE_STUDIES.map((study, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold">{study.company}</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Challenge:</p>
                  <p className="text-sm leading-relaxed">{study.challenge}</p>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Solution:</p>
                  <p className="text-sm leading-relaxed">{study.solution}</p>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Results:</p>
                  <ul className="space-y-2">
                    {study.results.map((result, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <blockquote className="italic text-sm text-muted-foreground leading-relaxed">
                    "{study.quote}"
                  </blockquote>
                  <p className="text-xs text-muted-foreground mt-2">— {study.attribution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
