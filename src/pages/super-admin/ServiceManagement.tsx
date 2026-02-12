
import React, { useState } from "react";
import { 
  Package, Filter, Search, MoreHorizontal, PlusCircle, CheckCircle, XCircle, 
  AlertTriangle, Edit, Trash2, Eye, Download, FileText
} from "lucide-react";
import Dashboard from "@/components/dashboard/Dashboard";
import { ServiceItem, ServiceStatus, ServiceType } from "@/types/service-types";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mocked extended service data
const serviceData = [
  {
    id: "1",
    name: "Premium Bartending Service",
    type: "staff" as ServiceType,
    price: "$55/hour",
    active: true,
    image: "https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&w=600&q=80",
    description: "Professional bartenders for your event",
    status: "approved" as ServiceStatus,
    rating: "4.9",
    reviews: "156",
    vendorName: "Elite Bartenders",
    vendorId: "v1",
    createdAt: "2023-01-15T08:30:00Z",
    updatedAt: "2023-05-10T14:20:00Z",
    featured: true,
    serviceSpecificDetails: {
      qualifications: ["Certified Mixologists", "5+ years experience"],
      minimumHours: 4,
      attire: ["formal", "casual"]
    }
  },
  {
    id: "2",
    name: "Corporate Lunch Package",
    type: "catering" as ServiceType,
    price: "$25/person",
    active: false,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80",
    description: "Perfect for business meetings and office events",
    status: "draft" as ServiceStatus,
    vendorName: "Gourmet Delights",
    vendorId: "v2",
    createdAt: "2023-04-20T10:15:00Z",
    updatedAt: "2023-05-12T09:30:00Z",
    featured: false,
    serviceSpecificDetails: {
      serviceStyles: ["boxed_individual", "buffet"],
      dietaryOptions: ["vegetarian", "gluten_free"],
      minimumOrderAmount: 10
    }
  },
  {
    id: "3",
    name: "Luxury Beachfront Villa",
    type: "venue" as ServiceType,
    price: "$3,500/day",
    active: true,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    description: "Stunning beachfront property perfect for weddings and corporate retreats",
    status: "approved" as ServiceStatus,
    rating: "4.8",
    reviews: "47",
    vendorName: "Elite Venues",
    vendorId: "v3",
    createdAt: "2023-02-05T11:20:00Z",
    updatedAt: "2023-04-28T16:45:00Z",
    featured: true,
    serviceSpecificDetails: {
      capacity: {
        seated: 120,
        standing: 200
      },
      indoorOutdoor: "both",
      amenities: ["Pool", "Kitchen", "Sound System", "Parking"]
    }
  },
  {
    id: "4",
    name: "Wedding Cocktail Hour",
    type: "catering" as ServiceType,
    price: "$35/person",
    active: false,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    description: "Elegant appetizers and drinks for wedding receptions",
    status: "pending_approval" as ServiceStatus,
    vendorName: "Elite Catering Co.",
    vendorId: "v4",
    createdAt: "2023-05-18T13:10:00Z",
    updatedAt: "2023-05-18T13:10:00Z",
    featured: false,
    serviceSpecificDetails: {
      serviceStyles: ["passed_appetizers"],
      dietaryOptions: ["vegetarian", "gluten_free", "dairy_free"],
      allergenInfo: ["nuts", "shellfish"]
    }
  },
  {
    id: "5",
    name: "Deluxe Party Tent Package",
    type: "party-rental" as ServiceType,
    price: "$750/day",
    active: true,
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=600&q=80",
    description: "Complete tent setup with lighting and dance floor",
    status: "approved" as ServiceStatus,
    rating: "4.7",
    reviews: "89",
    vendorName: "Premier Party Rentals",
    vendorId: "v5",
    createdAt: "2023-03-12T09:45:00Z",
    updatedAt: "2023-05-05T11:30:00Z",
    featured: false,
    serviceSpecificDetails: {
      setupRequired: true,
      setupFee: 250,
      deliveryOptions: ["Delivery and setup", "Pickup available"],
      availableQuantity: 5
    }
  },
];

function ServiceManagement() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogAction, setDialogAction] = useState<string>("");
  
  // Service type filtering
  const filterByServiceType = (service: ServiceItem, serviceType: string): boolean => {
    if (!serviceType || serviceType === 'all') return true;
    
    // Handle service type mapping
    if (serviceType === 'venue' && service.type === 'venues') return true;
    if (serviceType === 'catering' && service.type === 'catering') return true;
    if (serviceType === 'party-rentals' && service.type === 'party-rentals') return true;
    if (serviceType === 'staff' && service.type === 'staff') return true;
    
    return false;
  };

  // Filter services based on active tab and search query
  const filteredServices = serviceData.filter(service => {
    // Filter by tab
    if (activeTab !== "all" && activeTab !== service.type && 
        !(activeTab === "pending" && service.status === "pending_approval") &&
        !(activeTab === "featured" && service.featured)) {
      return false;
    }

    // Filter by search
    if (searchQuery && 
        !service.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !service.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  const handleServiceAction = (action: string, service: any) => {
    setSelectedService(service);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const executeServiceAction = () => {
    console.log(`Executing ${dialogAction} on service:`, selectedService);
    // Here you would implement the actual action logic
    
    setDialogOpen(false);
    setSelectedService(null);
  };

  const getServiceTypeBadge = (type: ServiceType) => {
    switch (type) {
      case "catering":
        return <Badge className="bg-blue-100 text-blue-800">Catering</Badge>;
      case "venues":
        return <Badge className="bg-purple-100 text-purple-800">Venue</Badge>;
      case "party-rentals":
        return <Badge className="bg-green-100 text-green-800">Rental</Badge>;
      case "staff":
        return <Badge className="bg-amber-100 text-amber-800">Staff</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getServiceStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "pending_approval":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <Dashboard userRole="super-admin" activeTab="services">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Service Management</h1>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Service
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-7 w-full max-w-3xl">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="catering">Catering</TabsTrigger>
              <TabsTrigger value="venue">Venues</TabsTrigger>
              <TabsTrigger value="party-rentals">Rentals</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search services..."
              className="pl-9 w-full sm:w-[260px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img 
                          src={service.image} 
                          alt={service.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                        <div>
                          <div className="font-medium">{service.name}</div>
                          {service.featured && (
                            <Badge variant="outline" className="mt-1">Featured</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getServiceTypeBadge(service.type)}</TableCell>
                    <TableCell>{getServiceStatusBadge(service.status)}</TableCell>
                    <TableCell>{service.vendorName}</TableCell>
                    <TableCell>{service.price}</TableCell>
                    <TableCell>{new Date(service.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleServiceAction("view", service)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleServiceAction("edit", service)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Service
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {service.featured ? (
                            <DropdownMenuItem onClick={() => handleServiceAction("unfeature", service)}>
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Remove Featured
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleServiceAction("feature", service)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Make Featured
                            </DropdownMenuItem>
                          )}
                          {service.status === "pending_approval" && (
                            <>
                              <DropdownMenuItem onClick={() => handleServiceAction("approve", service)} className="text-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve Service
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleServiceAction("reject", service)} className="text-red-600">
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject Service
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleServiceAction("delete", service)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Service
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredServices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No services found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Service Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "view" && "Service Details"}
              {dialogAction === "edit" && "Edit Service"}
              {dialogAction === "feature" && "Feature Service"}
              {dialogAction === "unfeature" && "Remove Featured Status"}
              {dialogAction === "approve" && "Approve Service"}
              {dialogAction === "reject" && "Reject Service"}
              {dialogAction === "delete" && "Delete Service"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "view" && "Viewing detailed information about this service."}
              {dialogAction === "edit" && "Make changes to this service's properties."}
              {dialogAction === "feature" && "Make this service featured in the marketplace."}
              {dialogAction === "unfeature" && "Remove this service from featured listings."}
              {dialogAction === "approve" && "Approve this service for publishing on the marketplace."}
              {dialogAction === "reject" && "Reject this service and provide feedback to the vendor."}
              {dialogAction === "delete" && "Are you sure you want to delete this service? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <>
              {dialogAction === "view" && (
                <div className="space-y-4 mt-2">
                  <div className="flex items-center gap-4">
                    <img 
                      src={selectedService.image} 
                      alt={selectedService.name}
                      className="h-16 w-16 object-cover rounded-md"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{selectedService.name}</h3>
                      <div className="flex gap-2 mt-1">
                        {getServiceTypeBadge(selectedService.type)}
                        {getServiceStatusBadge(selectedService.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border p-3 rounded-md">
                      <div className="text-sm text-gray-500">Vendor</div>
                      <div>{selectedService.vendorName}</div>
                    </div>
                    <div className="border p-3 rounded-md">
                      <div className="text-sm text-gray-500">Price</div>
                      <div>{selectedService.price}</div>
                    </div>
                  </div>
                  
                  <div className="border p-3 rounded-md">
                    <div className="text-sm text-gray-500 mb-1">Description</div>
                    <div>{selectedService.description}</div>
                  </div>
                  
                  <div className="border p-3 rounded-md">
                    <div className="text-sm text-gray-500 mb-1">Service-Specific Details</div>
                    <div className="text-sm">
                      {selectedService.type === "catering" && (
                        <div className="space-y-2">
                          <div><strong>Service Styles:</strong> {selectedService.serviceSpecificDetails.serviceStyles.join(", ")}</div>
                          <div><strong>Dietary Options:</strong> {selectedService.serviceSpecificDetails.dietaryOptions.join(", ")}</div>
                          {selectedService.serviceSpecificDetails.minimumOrderAmount && (
                            <div><strong>Minimum Order:</strong> {selectedService.serviceSpecificDetails.minimumOrderAmount} people</div>
                          )}
                        </div>
                      )}
                      {selectedService.type === "venue" && (
                        <div className="space-y-2">
                          <div><strong>Capacity:</strong> {selectedService.serviceSpecificDetails.capacity.seated} seated, {selectedService.serviceSpecificDetails.capacity.standing} standing</div>
                          <div><strong>Indoor/Outdoor:</strong> {selectedService.serviceSpecificDetails.indoorOutdoor}</div>
                          <div><strong>Amenities:</strong> {selectedService.serviceSpecificDetails.amenities.join(", ")}</div>
                        </div>
                      )}
                      {selectedService.type === "party-rental" && (
                        <div className="space-y-2">
                          <div><strong>Setup Required:</strong> {selectedService.serviceSpecificDetails.setupRequired ? "Yes" : "No"}</div>
                          {selectedService.serviceSpecificDetails.setupFee && (
                            <div><strong>Setup Fee:</strong> ${selectedService.serviceSpecificDetails.setupFee}</div>
                          )}
                          <div><strong>Delivery Options:</strong> {selectedService.serviceSpecificDetails.deliveryOptions.join(", ")}</div>
                          <div><strong>Available Quantity:</strong> {selectedService.serviceSpecificDetails.availableQuantity}</div>
                        </div>
                      )}
                      {selectedService.type === "staff" && (
                        <div className="space-y-2">
                          <div><strong>Qualifications:</strong> {selectedService.serviceSpecificDetails.qualifications.join(", ")}</div>
                          <div><strong>Minimum Hours:</strong> {selectedService.serviceSpecificDetails.minimumHours}</div>
                          <div><strong>Attire Options:</strong> {selectedService.serviceSpecificDetails.attire.join(", ")}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {dialogAction === "delete" && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <p className="text-red-600">This action cannot be undone. This service will be permanently deleted.</p>
                  </div>
                </div>
              )}
              
              {(dialogAction === "approve" || dialogAction === "reject") && (
                <div className="flex items-center gap-4 my-4">
                  <img 
                    src={selectedService.image} 
                    alt={selectedService.name}
                    className="h-12 w-12 object-cover rounded-md"
                  />
                  <div>
                    <h3 className="font-medium">{selectedService.name}</h3>
                    <p className="text-sm text-gray-500">Submitted by {selectedService.vendorName}</p>
                  </div>
                </div>
              )}
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            {dialogAction === "view" ? (
              <Button variant="outline" onClick={() => handleServiceAction("edit", selectedService)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Service
              </Button>
            ) : (
              <Button 
                onClick={executeServiceAction}
                className={
                  dialogAction === "delete" || dialogAction === "reject" 
                    ? "bg-red-600 hover:bg-red-700" 
                    : ""
                }
              >
                {dialogAction === "approve" && <CheckCircle className="mr-2 h-4 w-4" />}
                {dialogAction === "reject" && <XCircle className="mr-2 h-4 w-4" />}
                {dialogAction === "delete" && <Trash2 className="mr-2 h-4 w-4" />}
                {dialogAction === "feature" && <CheckCircle className="mr-2 h-4 w-4" />}
                {dialogAction === "unfeature" && <AlertTriangle className="mr-2 h-4 w-4" />}
                {dialogAction === "edit" && <FileText className="mr-2 h-4 w-4" />}
                
                {dialogAction === "approve" && "Approve Service"}
                {dialogAction === "reject" && "Reject Service"}
                {dialogAction === "delete" && "Delete Service"}
                {dialogAction === "feature" && "Make Featured"}
                {dialogAction === "unfeature" && "Remove Featured Status"}
                {dialogAction === "edit" && "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
};

export default ServiceManagement;
