
import { ReactNode } from "react";

interface MarketplaceLayoutProps {
  children: ReactNode;
  aiRecommended?: boolean;
}

const MarketplaceLayout = ({ children, aiRecommended = false }: MarketplaceLayoutProps) => {
  return (
    <div className={`min-h-screen ${aiRecommended ? "bg-gradient-to-b from-amber-50 to-gray-50" : "bg-gray-50"} w-full overflow-x-hidden`}>
      {aiRecommended && (
        <div className="bg-[#F07712]/10 border-b border-[#F07712]/20 py-2 text-center text-sm font-medium text-[#F07712]">
          AI Recommended Services
        </div>
      )}
      <main className="container mx-auto px-2 sm:px-4 py-6 md:py-8 w-full">
        <div className="grid gap-4 md:gap-8 w-full max-w-full">{children}</div>
      </main>
    </div>
  );
};

export default MarketplaceLayout;
