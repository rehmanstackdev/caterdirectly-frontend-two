import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, HeadphonesIcon, User, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import hostService from '@/services/api/host/host.Service';

type Props = {
  onOpenSupport: () => Promise<void> | void;
  onOpenVendorByEmail: (vendorId: string, name?: string | null) => Promise<void> | void;
};

type Vendor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string;
};

const NewConversationDialog = ({ onOpenSupport, onOpenVendorByEmail }: Props) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [openingSupport, setOpeningSupport] = useState(false);
  const [openingVendorId, setOpeningVendorId] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user || !open) return;
      try {
        setLoadingVendors(true);
        console.log('Loading vendors for user:', user.id);
        const response = await hostService.getHostVendors();
        console.log('Vendors API response:', response);
        if (response?.data) {
          console.log('Setting vendors:', response.data);
          setVendors(response.data);
        } else {
          console.log('No vendor data received');
          setVendors([]);
        }
      } catch (error) {
        console.error('Error loading vendors:', error);
        setVendors([]);
      } finally {
        setLoadingVendors(false);
      }
    };
    load();
  }, [user, open]);

  const filteredVendors = useMemo(
    () =>
      vendors.filter(
        (v) =>
          v.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          v.lastName?.toLowerCase().includes(search.toLowerCase()) ||
          v.email?.toLowerCase().includes(search.toLowerCase()) ||
          v.businessName?.toLowerCase().includes(search.toLowerCase())
      ),
    [vendors, search]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#F07712] hover:bg-[#F07712]/90">
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Start a new conversation</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="support">
          <TabsList>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="guests">Guests</TabsTrigger>
          </TabsList>

          <TabsContent value="support" className="space-y-4">
            <div className="p-4 rounded-lg border bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <HeadphonesIcon className="h-5 w-5 text-blue-700" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Support Team</p>
                  <p className="text-sm text-gray-600">
                    Get help from our team. Admins can reply in this chat.
                  </p>
                </div>
                <Button disabled={openingSupport}
                  onClick={async () => {
                    try {
                      setOpeningSupport(true);
                      setShowSkeleton(true);
                      await onOpenSupport();
                      setOpen(false);
                    } finally {
                      setOpeningSupport(false);
                      setShowSkeleton(false);
                    }
                  }}
                  className="bg-[#F07712] hover:bg-[#F07712]/90"
                >
                  {openingSupport ? 'Opening…' : 'Open'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search your vendor contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {loadingVendors ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-3 rounded-lg border animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-5 w-12 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredVendors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {vendors.length === 0 ? 'No vendors yet. Place an order to see vendors here.' : 'No vendors match your search.'}
                </div>
              ) : (
                filteredVendors.map((v) => {
                  const vendorName = `${v.firstName || ''} ${v.lastName || ''}`.trim();
                  const displayName = vendorName || v.businessName || v.email;
                  
                  return (
                    <div
                      key={v.id}
                      className={`p-3 rounded-lg border hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                        openingVendorId === v.id ? 'opacity-50' : ''
                      }`}
                      onClick={async () => {
                        if (openingVendorId) return;
                        console.log('Clicking vendor:', { id: v.id, email: v.email, name: vendorName });
                        setOpeningVendorId(v.id);
                        setShowSkeleton(true);
                        try {
                          console.log('📊 Vendor details:', {
                            vendorId: v.id,
                            userId: v.user?.id,
                            email: v.email,
                            firstName: v.firstName,
                            lastName: v.lastName,
                            businessName: v.businessName,
                            fullVendorObject: v
                          });
                          const targetUserId = v.user?.id || v.id;
                          console.log('Calling onOpenVendorByEmail with user ID:', targetUserId, vendorName);
                          await onOpenVendorByEmail(targetUserId, vendorName);
                          console.log('Successfully started chat, closing dialog');
                          setOpen(false);
                        } catch (error) {
                          console.error('Error in vendor click handler:', error);
                        } finally {
                          setOpeningVendorId(null);
                          setShowSkeleton(false);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{displayName}</p>
                          <p className="text-xs text-gray-500">{v.email}</p>
                          {v.businessName && vendorName && (
                            <p className="text-xs text-gray-400">{v.businessName}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {openingVendorId === v.id && (
                          <span className="text-xs text-gray-500">Opening...</span>
                        )}
                        <Badge variant="secondary">Vendor</Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="guests" className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <p>Guest messaging coming soon.</p>
              <p className="text-xs mt-2">This feature will be available in a future update.</p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Skeleton Loading */}
        {showSkeleton && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F07712]"></div>
              <p className="text-sm text-gray-600">Creating conversation...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationDialog;
