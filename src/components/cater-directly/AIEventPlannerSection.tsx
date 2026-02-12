import { useState, ChangeEvent, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import AIEventPlanner from "./AIEventPlanner";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/auth";

const AIEventPlannerSection = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin' || userRole === 'super-admin';
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    eventLocation: "",
    headcount: "",
    eventTime: "",
    serviceStyle: "",
    eventBudget: "",
    description: "",
    services: {
      catering: true,
      hireStaff: false,
      venueRental: false,
      rentSupplies: false,
    },
  });

  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsGeneratingProposal(true);
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-background/70 supports-[backdrop-filter]:bg-background/60 backdrop-blur border border-border shadow-lg w-full max-w-[1500px] mx-auto mt-8 px-6 py-5 rounded-[40px] max-md:px-3 max-md:rounded-[20px]">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="secondary" className="mb-4">Admin: Open AI Planner (beta)</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {isGeneratingProposal ? (
            <div className="bg-white flex w-full flex-col px-8 py-8 rounded-[30px] max-md:px-3 max-md:py-5 max-md:rounded-[15px]">
              <AIEventPlanner formData={formData} />
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white flex w-full flex-col px-8 py-8 rounded-[30px] max-md:px-3 max-md:py-5 max-md:rounded-[15px]"
            >
              <h2 className="text-[rgba(54,54,54,1)] text-[40px] font-semibold text-center mb-8 max-md:text-[26px] max-md:mb-5">
                Ask <span className="text-primary">Our AI</span> for an Instant Quote
              </h2>
              
              
              
              <div className="grid grid-cols-12 gap-6 max-md:grid-cols-1 max-md:gap-4">
                {/* Left section - 8 columns */}
                <div className="col-span-8 max-md:col-span-1">
                  <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1 max-md:gap-4">
                    <div className="space-y-3 max-md:space-y-2">
                      <Label htmlFor="fullName" className="text-lg font-medium max-md:text-base">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="shadow-sm"
                      />
                    </div>
                    
                    <div className="space-y-3 max-md:space-y-2">
                      <Label htmlFor="email" className="text-lg font-medium max-md:text-base">Email Address</Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="shadow-sm"
                      />
                    </div>
                    
                    <div className="space-y-3 max-md:space-y-2">
                      <Label htmlFor="phone" className="text-lg font-medium max-md:text-base">Phone Number</Label>
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="shadow-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 mt-6 max-md:grid-cols-1 max-md:gap-4 max-md:mt-4">
                    <div className="space-y-3 max-md:space-y-2">
                      <Label htmlFor="eventType" className="text-lg font-medium max-md:text-base">Event Type</Label>
                      <Select
                        value={formData.eventType}
                        onValueChange={(value) => handleSelectChange("eventType", value)}
                      >
                        <SelectTrigger id="eventType" className="shadow-sm">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="birthday">Birthday</SelectItem>
                          <SelectItem value="social">Social Gathering</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3 max-md:space-y-2">
                      <Label htmlFor="eventDate" className="text-lg font-medium max-md:text-base">Event Date</Label>
                      <Input
                        type="date"
                        id="eventDate"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        className="shadow-sm"
                      />
                    </div>
                    
                    <div className="space-y-3 max-md:space-y-2">
                      <Label htmlFor="eventLocation" className="text-lg font-medium max-md:text-base">Event Location</Label>
                      <Input
                        type="text"
                        id="eventLocation"
                        name="eventLocation"
                        value={formData.eventLocation}
                        onChange={handleInputChange}
                        className="shadow-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Desktop-only description section */}
                  <div className="mt-6 max-md:hidden">
                    <Label htmlFor="description" className="text-xl font-semibold block mb-2">
                      Describe your event and needs
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="shadow-sm w-full min-h-[120px]"
                    />
                  </div>
                  
                  {/* Desktop-only submit button */}
                  <div className="mt-8 max-md:hidden">
                    <Button 
                      type="submit"
                      className="bg-[rgba(240,119,18,1)] hover:bg-[rgba(220,109,16,1)] text-white font-medium py-6 px-8 rounded-[30px] h-auto"
                    >
                      <span className="text-xl mr-4">Submit the Request</span>
                      <div className="bg-white rounded-full p-2 flex items-center justify-center w-10 h-10">
                        <ArrowRight className="w-6 h-6 text-[rgba(240,119,18,1)]" />
                      </div>
                    </Button>
                  </div>
                </div>
                
                {/* Right section - 4 columns */}
                <div className="col-span-4 max-md:col-span-1">
                  <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-4">
                    <div className="space-y-3 max-md:space-y-2">
                      <Label htmlFor="headcount" className="text-lg font-medium max-md:text-base">Headcount</Label>
                      <Input
                        type="number"
                        id="headcount"
                        name="headcount"
                        value={formData.headcount}
                        onChange={handleInputChange}
                        className="shadow-sm"
                      />
                    </div>
                    
                    <div className="space-y-3 max-md:space-y-2">
                      <Label htmlFor="eventTime" className="text-lg font-medium max-md:text-base">Event Time</Label>
                      <Input
                        type="time"
                        id="eventTime"
                        name="eventTime"
                        value={formData.eventTime}
                        onChange={handleInputChange}
                        className="shadow-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mt-6 max-md:grid-cols-1 max-md:gap-4 max-md:mt-4">
                    <div className="space-y-3 max-md:space-y-2">
                      <Label htmlFor="serviceStyle" className="text-lg font-medium max-md:text-base">Service Style</Label>
                      <Select
                        value={formData.serviceStyle}
                        onValueChange={(value) => handleSelectChange("serviceStyle", value)}
                      >
                        <SelectTrigger id="serviceStyle" className="shadow-sm">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buffet">Buffet</SelectItem>
                          <SelectItem value="plated">Plated</SelectItem>
                          <SelectItem value="family">Family Style</SelectItem>
                          <SelectItem value="stations">Food Stations</SelectItem>
                          <SelectItem value="cocktail">Cocktail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3 max-md:space-y-2">
                      <Label htmlFor="eventBudget" className="text-lg font-medium max-md:text-base">Event Budget</Label>
                      <Input
                        type="text"
                        id="eventBudget"
                        name="eventBudget"
                        value={formData.eventBudget}
                        onChange={handleInputChange}
                        className="shadow-sm"
                        placeholder="$"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-10 max-md:mt-6">
                    <h3 className="text-xl font-semibold mb-4 text-center max-md:text-lg max-md:mb-3">Services Needed</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="catering" 
                          checked={formData.services.catering}
                          className={formData.services.catering ? "border-[rgba(240,119,18,1)] bg-[rgba(240,119,18,1)]" : "border-[rgba(137,137,137,1)]"}
                          onCheckedChange={(checked) => {
                            setFormData(prev => ({
                              ...prev,
                              services: {
                                ...prev.services,
                                catering: checked as boolean
                              }
                            }));
                          }}
                        />
                        <Label htmlFor="catering" className="text-lg font-medium max-md:text-base">Catering</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hireStaff" 
                          checked={formData.services.hireStaff}
                          className="border-[rgba(137,137,137,1)]"
                          onCheckedChange={(checked) => {
                            setFormData(prev => ({
                              ...prev,
                              services: {
                                ...prev.services,
                                hireStaff: checked as boolean
                              }
                            }));
                          }}
                        />
                        <Label htmlFor="hireStaff" className="text-lg font-medium max-md:text-base">Hire Staff</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="venueRental" 
                          checked={formData.services.venueRental}
                          className="border-[rgba(137,137,137,1)]"
                          onCheckedChange={(checked) => {
                            setFormData(prev => ({
                              ...prev,
                              services: {
                                ...prev.services,
                                venueRental: checked as boolean
                              }
                            }));
                          }}
                        />
                        <Label htmlFor="venueRental" className="text-lg font-medium max-md:text-base">Venue Rental</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="rentSupplies" 
                          checked={formData.services.rentSupplies}
                          className="border-[rgba(137,137,137,1)]"
                          onCheckedChange={(checked) => {
                            setFormData(prev => ({
                              ...prev,
                              services: {
                                ...prev.services,
                                rentSupplies: checked as boolean
                              }
                            }));
                          }}
                        />
                        <Label htmlFor="rentSupplies" className="text-lg font-medium max-md:text-base">Rent Supplies</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mobile-only sections */}
              <div className="md:hidden mt-6">
                <Label htmlFor="description-mobile" className="text-lg font-semibold block mb-2">
                  Describe your event and needs
                </Label>
                <Textarea
                  id="description-mobile"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="shadow-sm w-full min-h-[100px]"
                />
              </div>
              
              <div className="md:hidden mt-6">
                <Button 
                  type="submit"
                  className="w-full bg-[rgba(240,119,18,1)] hover:bg-[rgba(220,109,16,1)] text-white font-medium py-5 px-6 rounded-[20px] h-auto"
                >
                  <span className="text-lg mr-3">Submit the Request</span>
                  <div className="bg-white rounded-full p-1.5 flex items-center justify-center w-8 h-8">
                    <ArrowRight className="w-5 h-5 text-[rgba(240,119,18,1)]" />
                  </div>
                </Button>
              </div>
            </form>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default AIEventPlannerSection;
