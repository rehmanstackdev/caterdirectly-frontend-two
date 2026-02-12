
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAIEventPlanner } from "@/hooks/use-ai-event-planner";
import AIEventProposal from "./AIEventProposal";
import { toast } from "@/hooks/use-toast";

const AIEventPlanner = ({ formData }: { formData: any }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [proposal, setProposal] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { generateRecommendation } = useAIEventPlanner();
  
  useEffect(() => {
    // Automatically start generation when component mounts
    handleGenerateProposal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleGenerateProposal = async () => {
    // Validate form data
    if (!formData.fullName || !formData.email || !formData.eventType || !formData.eventDate) {
      setError("Please fill in the required fields (name, email, event type, and event date)");
      setIsGenerating(false);
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Using generateRecommendation instead of generateEventPlan
      const result = await generateRecommendation(
        formData.eventType,
        formData.guestCount || 10,
        formData.budget || 1000
      );
      setProposal(result);
    } catch (err) {
      setError("Unable to generate your proposal at this time. Please try again later.");
      toast({
        title: "Error",
        description: "Unable to generate your proposal. Please try again later.",
        variant: "destructive",
      });
      console.error("Error generating proposal:", err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const resetProposal = () => {
    setProposal(null);
    setError(null);
  };
  
  if (proposal) {
    return (
      <div className="w-full">
        <AIEventProposal 
          proposal={proposal} 
          clientName={formData.fullName}
          onBack={resetProposal}
        />
      </div>
    );
  }
  
  return (
    <div className="w-full mt-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <div className="text-center py-8">
        {isGenerating ? (
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-[#F07712]" />
            </div>
            <h3 className="text-xl md:text-2xl font-medium text-gray-800 mb-2">
              Creating Your Bespoke Event Plan...
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Our AI is curating the perfect services for your {formData.eventType} in {formData.eventLocation || "your area"}.
            </p>
          </div>
        ) : (
          <Button
            onClick={handleGenerateProposal}
            className={`bg-[#F07712] hover:bg-[#F07712]/90 text-white rounded-[30px] h-auto flex items-center justify-center gap-3 ${
              isMobile ? "py-4 px-6 text-base" : "py-6 px-8 text-xl"
            }`}
          >
            <span>Try Again</span>
            <div className="bg-white rounded-full p-2 flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-[#F07712]" />
            </div>
          </Button>
        )}
      </div>
    </div>
  );
};

export default AIEventPlanner;
