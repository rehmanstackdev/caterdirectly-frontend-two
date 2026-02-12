
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building, CreditCard, Bell, Shield, MapPin, Phone, Mail, Globe, User, Camera, Loader2, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVendorData } from '@/hooks/vendor/use-vendor-data';
import FileUpload from '@/components/shared/FileUpload';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/use-profile';
import GoogleMapsAutocomplete from '@/components/shared/GoogleMapsAutocomplete';
import { LocationData } from '@/components/shared/address/types';
import { useUserProfile } from '@/hooks/use-user-profile';
import UsersService from '@/services/api/admin/users.Service';
import { useAuth } from '@/contexts/auth/useAuth';
import { useStripeConnectAccount } from '@/hooks/vendor/use-stripe-connect-account';

const VendorAccountSettings: React.FC = () => {
  const { toast } = useToast();
  const { vendorData, loading, error, updateVendorData } = useVendorData();
  const { profileData, updateProfile } = useProfile();
  const { profile: userProfile, loading: profileLoading, refetch: refetchUserProfile } = useUserProfile();
  const { user } = useAuth();
  const {
    account: stripeAccount,
    loading: stripeLoading,
    creating: creatingStripeAccount,
    creatingLink: creatingAccountLink,
    creatingLoginLink: creatingLoginLink,
    fetchAccount: fetchStripeAccount,
    createAccount: createStripeAccount,
    createAccountLink: createStripeAccountLink,
    createLoginLink: createStripeLoginLink,
  } = useStripeConnectAccount();
  
  const [businessInfo, setBusinessInfo] = useState({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    description: '',
    serviceRadius: '',
    fullAddress: '', // Google-validated complete address
    coordinates: { lat: 0, lng: 0 } // Store coordinates for distance calculations
  });

  // Update business info when vendor data loads
  useEffect(() => {
    if (vendorData) {
      console.log('VendorAccountSettings: Loading vendor data:', vendorData);
      setBusinessInfo({
        companyName: vendorData.businessName || '',
        email: '', // Email comes from userProfile
        phone: vendorData.phone || '',
        website: vendorData.website || '',
        address: vendorData.address || '',
        city: vendorData.city || '',
        state: vendorData.state || '',
        zipCode: vendorData.zipCode || '',
        description: '', // This might come from a different table or field
        serviceRadius: '', // Service radius not in VendorData interface
        fullAddress: vendorData.fullAddress || '',
        coordinates: vendorData.coordinates || { lat: 0, lng: 0 }
      });
    }
  }, [vendorData]);

  // Fetch Stripe Connect account when vendor data is available
  useEffect(() => {
    const vendorId = userProfile?.vendor?.id || vendorData?.id;
    if (vendorId) {
      fetchStripeAccount(vendorId);
    }
  }, [userProfile?.vendor?.id, vendorData?.id, fetchStripeAccount]);

  // Update business info when userProfile loads from API
  useEffect(() => {
    if (userProfile?.vendor) {
      console.log('VendorAccountSettings: Loading profile data:', userProfile);
      setBusinessInfo(prev => ({
        ...prev,
        companyName: userProfile.vendor?.businessName || prev.companyName || '',
        email: (userProfile.vendor as any)?.businessEmail || userProfile.email || prev.email || '',
        phone: userProfile.vendor?.phone || userProfile.phone || prev.phone || '',
        website: userProfile.vendor?.website || prev.website || '',
        address: userProfile.vendor?.address || prev.address || '',
        city: userProfile.vendor?.city || prev.city || '',
        state: userProfile.vendor?.state || prev.state || '',
        zipCode: userProfile.vendor?.zipCode || prev.zipCode || '',
        description: userProfile.vendor?.businessDescription || prev.description || '',
        fullAddress: userProfile.vendor?.fullAddress || prev.fullAddress || '',
        coordinates: userProfile.vendor?.coordinates ? {
          lat: userProfile.vendor.coordinates.lat,
          lng: userProfile.vendor.coordinates.lng
        } : prev.coordinates
      }));

      // Also load banking info from userProfile
      setBankingInfo(prev => ({
        ...prev,
        accountHolder: userProfile.vendor?.accountHolderName || prev.accountHolder || '',
        bankName: userProfile.vendor?.bankName || prev.bankName || '',
        accountType: userProfile.vendor?.accountType || prev.accountType || 'business',
        routingNumber: userProfile.vendor?.routingNumber || prev.routingNumber || '',
        accountNumber: userProfile.vendor?.accountNumber || prev.accountNumber || ''
      }));
    }
  }, [userProfile]);

  const [bankingInfo, setBankingInfo] = useState({
    accountHolder: '',
    routingNumber: '',
    accountNumber: '',
    bankName: '',
    accountType: 'business'
  });

  const [notifications, setNotifications] = useState({
    newOrders: true,
    orderUpdates: true,
    payments: true,
    marketing: false,
    proposals: true,
    reviews: true
  });

  const [savingBusinessInfo, setSavingBusinessInfo] = useState(false);
  const [savingBankingInfo, setSavingBankingInfo] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);

  // Handle address selection from Google Autocomplete
  const handleAddressSelected = (address: string, locationData?: LocationData) => {
    if (locationData) {
      setBusinessInfo(prev => ({
        ...prev,
        fullAddress: address,
        address: locationData.street,
        city: locationData.city,
        state: locationData.state,
        zipCode: locationData.zipCode,
        coordinates: {
          lat: locationData.lat,
          lng: locationData.lng
        }
      }));
    }
  };

  const handleSaveBusinessInfo = async () => {
    setSavingBusinessInfo(true);
    try {
      const payload = {
        businessName: businessInfo.companyName,
        businessEmail: businessInfo.email,
        phone: businessInfo.phone,
        website: businessInfo.website,
        address: businessInfo.address,
        city: businessInfo.city,
        state: businessInfo.state,
        zipCode: businessInfo.zipCode,
        fullAddress: businessInfo.fullAddress,
        coordinates: {
          lat: businessInfo.coordinates.lat,
          lng: businessInfo.coordinates.lng
        },
        businessDescription: businessInfo.description
      };

      // Get vendor ID from userProfile if available
      const vendorId = userProfile?.vendor?.id || vendorData?.id;
      const success = await updateVendorData(payload, vendorId);

      if (success) {
        // Refetch user profile to get updated data
        await refetchUserProfile();
        toast({
          title: "Business Information Updated",
          description: "Your business information has been saved successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update business information. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update business information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingBusinessInfo(false);
    }
  };

  // Note: accountHolderName is loaded from userProfile, not vendorData

  const handleSaveBankingInfo = async () => {
    setSavingBankingInfo(true);
    try {
      const payload = {
        accountHolderName: bankingInfo.accountHolder,
        bankName: bankingInfo.bankName,
        accountType: bankingInfo.accountType,
        routingNumber: bankingInfo.routingNumber,
        accountNumber: bankingInfo.accountNumber
      };

      // Get vendor ID from userProfile if available
      const vendorId = userProfile?.vendor?.id || vendorData?.id;
      const success = await updateVendorData(payload, vendorId);

      if (success) {
        // Refetch user profile to get updated data
        await refetchUserProfile();
        toast({
          title: "Banking Information Updated",
          description: "Your payout information has been updated securely.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update banking information. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update banking information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingBankingInfo(false);
    }
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Preferences Updated",
      description: "Your notification settings have been saved.",
    });
  };

  const handleProfileImageUpload = async (file: File) => {
    setUploadingProfileImage(true);
    try {
      // Get user ID from userProfile or auth context
      const userId = userProfile?.id || user?.id;
      
      if (!userId) {
        toast({
          title: "Error",
          description: "Unable to identify user. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Upload image using the API endpoint
      const response = await UsersService.updateUserImage(userId, file);
      
      // Refetch user profile to get updated image URL
      const updatedProfile = await refetchUserProfile();
      
      // Update localStorage with new image URL
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        userData.imageUrl = updatedProfile?.imageUrl || userProfile?.imageUrl;
        localStorage.setItem('user_data', JSON.stringify(userData));
      }
      
      // Dispatch event to notify other components (like header) to refresh
      window.dispatchEvent(new CustomEvent('profile-image-updated', { 
        detail: { imageUrl: updatedProfile?.imageUrl } 
      }));
      
      toast({
        title: "Profile Image Updated",
        description: "Your profile image has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Failed to upload profile image:', error);
      toast({
        title: "Upload Failed",
        description: error?.response?.data?.message || "Failed to upload profile image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const getInitials = () => {
    if (!profileData?.personal) return '?';
    const firstName = profileData.personal.firstName || '';
    const lastName = profileData.personal.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
  };

  // Show loader while initial data is loading
  const isLoading = loading || profileLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground">Manage your vendor account preferences and information</p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Shield className="h-3 w-3 mr-1" />
            Verified Vendor
          </Badge>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#F07712] mb-4" />
            <p className="text-sm text-muted-foreground">Loading account settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">Manage your vendor account preferences and information</p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Shield className="h-3 w-3 mr-1" />
          Verified Vendor
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Business Info
          </TabsTrigger>
          <TabsTrigger value="banking" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Banking & Payouts
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Update your profile picture and personal information
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {profileLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading profile information...</p>
                </div>
              ) : (
                <>
                  {/* Profile Details Section */}
                  {userProfile && (
                    <div className="space-y-4 border-b pb-6">
                      <h3 className="text-lg font-semibold">Profile Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">First Name</Label>
                          <p className="text-base font-medium">{userProfile.firstName || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Last Name</Label>
                          <p className="text-base font-medium">{userProfile.lastName || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                          <p className="text-base font-medium">{userProfile.email || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                          <p className="text-base font-medium">{userProfile.phone || 'N/A'}</p>
                        </div>
                        {userProfile.jobTitle && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Job Title</Label>
                            <p className="text-base font-medium">{userProfile.jobTitle}</p>
                          </div>
                        )}
                        {userProfile.userType && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">User Type</Label>
                            <p className="text-base font-medium">{userProfile.userType}</p>
                          </div>
                        )}
                      </div>
                      {userProfile.vendor && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-md font-semibold mb-3">Business Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userProfile.vendor.businessName && (
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Business Name</Label>
                                <p className="text-base font-medium">{userProfile.vendor.businessName}</p>
                              </div>
                            )}
                            {userProfile.vendor.website && (
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Website</Label>
                                <p className="text-base font-medium">{userProfile.vendor.website}</p>
                              </div>
                            )}
                            {userProfile.vendor.address && (
                              <div className="md:col-span-2">
                                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                                <p className="text-base font-medium">
                                  {userProfile.vendor.address}
                                  {userProfile.vendor.city && `, ${userProfile.vendor.city}`}
                                  {userProfile.vendor.state && `, ${userProfile.vendor.state}`}
                                  {userProfile.vendor.zipCode && ` ${userProfile.vendor.zipCode}`}
                                </p>
                              </div>
                            )}
                            {userProfile.vendor.einTin && (
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">EIN/TIN</Label>
                                <p className="text-base font-medium">{userProfile.vendor.einTin}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Profile Picture Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        {userProfile?.imageUrl ? (
                          <AvatarImage 
                            src={userProfile.imageUrl} 
                            alt="Profile picture"
                            className="object-cover"
                          />
                        ) : profileData?.personal.profileImage ? (
                          <AvatarImage 
                            src={profileData.personal.profileImage} 
                            alt="Profile picture"
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {userProfile?.firstName && userProfile?.lastName 
                            ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase()
                            : getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2">
                        <div className="bg-white rounded-full p-1 shadow-lg">
                          <Camera className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full max-w-md">
                      <Label className="text-sm font-medium mb-2 block">Upload Profile Picture</Label>
                      <FileUpload
                        onFileUpload={handleProfileImageUpload}
                        onFileUploadComplete={(url) => {
                          console.log('Profile image uploaded:', url);
                        }}
                        acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
                        maxSize={5}
                        uploading={uploadingProfileImage}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary/50 transition-colors"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Upload a profile picture (JPG, PNG, or WebP, max 5MB)
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Update your business details and service area information
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {profileLoading ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Loading business information...</p>
                </div>
              ) : (
                <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={businessInfo.companyName}
                    onChange={(e) => setBusinessInfo({...businessInfo, companyName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Business Email</Label>
                  <div className="flex">
                    <Mail className="h-4 w-4 mt-3 mr-2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={businessInfo.email}
                      onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex">
                    <Phone className="h-4 w-4 mt-3 mr-2 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={businessInfo.phone}
                      onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="flex">
                    <Globe className="h-4 w-4 mt-3 mr-2 text-muted-foreground" />
                    <Input
                      id="website"
                      value={businessInfo.website}
                      onChange={(e) => setBusinessInfo({...businessInfo, website: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Business Address</Label>
                <p className="text-sm text-muted-foreground">
                  📍 Using Google Maps for accurate address and coordinates
                </p>
                <GoogleMapsAutocomplete
                  placeholder="Start typing your address..."
                  onAddressSelected={handleAddressSelected}
                  value={businessInfo.fullAddress}
                  className="w-full"
                  required
                />
                
                {businessInfo.fullAddress && (
                  <div className="text-xs text-muted-foreground bg-green-50 dark:bg-green-950 p-3 rounded space-y-1">
                    <p className="font-medium text-green-700 dark:text-green-300">✓ Validated address:</p>
                    <p className="text-green-600 dark:text-green-400">{businessInfo.address}</p>
                    <p className="text-green-600 dark:text-green-400">{businessInfo.city}, {businessInfo.state} {businessInfo.zipCode}</p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={businessInfo.description}
                  onChange={(e) => setBusinessInfo({...businessInfo, description: e.target.value})}
                  rows={4}
                />
              </div>
{/* 
              <div>
                <Label htmlFor="serviceRadius">Service Radius (miles)</Label>
                <Input
                  id="serviceRadius"
                  type="number"
                  value={businessInfo.serviceRadius}
                  onChange={(e) => setBusinessInfo({...businessInfo, serviceRadius: e.target.value})}
                  className="w-32"
                />
              </div> */}

              <Button 
                onClick={handleSaveBusinessInfo} 
                className="w-full"
                disabled={savingBusinessInfo}
              >
                {savingBusinessInfo ? 'Saving...' : 'Save Business Information'}
              </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banking">
          <Card>
            <CardHeader>
              <CardTitle>Banking & Payout Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Secure banking details for receiving payments from orders
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stripe Connect Account Section */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-purple-900 mb-1 flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Stripe Connect Account
                    </h4>
                    <p className="text-sm text-purple-800">
                      Connect your Stripe account to receive payments directly. Required for receiving payouts.
                    </p>
                  </div>
                  {stripeAccount ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Connected
                    </Badge>
                  )}
                </div>

                {stripeLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                    <span className="ml-2 text-sm text-purple-700">Loading account status...</span>
                  </div>
                ) : stripeAccount ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-purple-700 font-medium">Account ID:</span>
                        <p className="text-purple-900 font-mono text-xs">{stripeAccount.id}</p>
                      </div>
                      <div>
                        <span className="text-purple-700 font-medium">Account Type:</span>
                        <p className="text-purple-900 capitalize">{stripeAccount.type}</p>
                      </div>
                      <div>
                        <span className="text-purple-700 font-medium">Charges Enabled:</span>
                        <p className={stripeAccount.charges_enabled ? "text-green-600" : "text-red-600"}>
                          {stripeAccount.charges_enabled ? "Yes" : "No"}
                        </p>
                      </div>
                      <div>
                        <span className="text-purple-700 font-medium">Payouts Enabled:</span>
                        <p className={stripeAccount.payouts_enabled ? "text-green-600" : "text-red-600"}>
                          {stripeAccount.payouts_enabled ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>

                    {!stripeAccount.details_submitted && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 mb-2">
                          ⚠️ Your Stripe account needs to complete onboarding to receive payouts.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            const vendorId = userProfile?.vendor?.id || vendorData?.id;
                            if (!vendorId) return;

                            const returnUrl = `${window.location.origin}/vendor/settings?tab=banking&onboarding=complete`;
                            const refreshUrl = `${window.location.origin}/vendor/settings?tab=banking&onboarding=refresh`;
                            
                            const url = await createStripeAccountLink(vendorId, returnUrl, refreshUrl);
                            if (url) {
                              window.open(url, '_blank');
                            }
                          }}
                          disabled={creatingAccountLink}
                          className="w-full"
                        >
                          {creatingAccountLink ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating Link...
                            </>
                          ) : (
                            <>
                              Complete Onboarding
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const vendorId = userProfile?.vendor?.id || vendorData?.id;
                          if (!vendorId) return;

                          const url = await createStripeLoginLink(vendorId);
                          if (url) {
                            window.open(url, '_blank');
                          }
                        }}
                        disabled={creatingLoginLink}
                        className="flex-1"
                      >
                        {creatingLoginLink ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Opening...
                          </>
                        ) : (
                          <>
                            Open Stripe Dashboard
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const vendorId = userProfile?.vendor?.id || vendorData?.id;
                          if (vendorId) {
                            fetchStripeAccount(vendorId);
                          }
                        }}
                        disabled={stripeLoading}
                      >
                        {stripeLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Refresh Status"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-purple-700">
                      You need to create a Stripe Connect account to receive payments. This will allow you to receive payouts directly to your bank account.
                    </p>
                    <Button
                      onClick={async () => {
                        const vendorId = userProfile?.vendor?.id || vendorData?.id;
                        if (!vendorId || !userProfile?.vendor) return;

                        const accountData = await createStripeAccount(vendorId, {
                          email: userProfile.email || userProfile.vendor.businessEmail || '',
                          businessName: userProfile.vendor.businessName || businessInfo.companyName || '',
                          country: 'US',
                          type: 'express',
                        });

                        if (accountData) {
                          // After creating account, create onboarding link
                          const returnUrl = `${window.location.origin}/vendor/settings?tab=banking&onboarding=complete`;
                          const refreshUrl = `${window.location.origin}/vendor/settings?tab=banking&onboarding=refresh`;
                          
                          const url = await createStripeAccountLink(vendorId, returnUrl, refreshUrl);
                          if (url) {
                            window.open(url, '_blank');
                          }
                        }
                      }}
                      disabled={creatingStripeAccount || !userProfile?.vendor}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {creatingStripeAccount ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Stripe Connect Account
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Payout Schedule</h4>
                <p className="text-sm text-blue-800">
                  Payouts are processed weekly on Fridays for the previous week's completed orders.
                  Funds typically arrive in your account within 1-2 business days.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="accountHolder">Account Holder Name</Label>
                  <Input
                    id="accountHolder"
                    value={bankingInfo.accountHolder}
                    onChange={(e) => setBankingInfo({...bankingInfo, accountHolder: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={bankingInfo.bankName}
                      onChange={(e) => setBankingInfo({...bankingInfo, bankName: e.target.value})}
                      placeholder="e.g., Chase Bank"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountType">Account Type</Label>
                    <Input
                      id="accountType"
                      value={bankingInfo.accountType}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      value={bankingInfo.routingNumber}
                      onChange={(e) => setBankingInfo({...bankingInfo, routingNumber: e.target.value})}
                      placeholder="9 digits"
                      maxLength={9}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={bankingInfo.accountNumber}
                      onChange={(e) => setBankingInfo({...bankingInfo, accountNumber: e.target.value})}
                      placeholder="Account number"
                    />
                  </div>
                </div>
              </div> */}

              {/* <Button 
                onClick={handleSaveBankingInfo} 
                className="w-full"
                disabled={savingBankingInfo}
              >
                {savingBankingInfo ? 'Saving...' : 'Save Banking Information'}
              </Button> */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose how you want to be notified about account activity
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">New Orders</h4>
                    <p className="text-sm text-muted-foreground">Get notified when you receive new booking requests</p>
                  </div>
                  <Switch
                    checked={notifications.newOrders}
                    onCheckedChange={(checked) => setNotifications({...notifications, newOrders: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Order Updates</h4>
                    <p className="text-sm text-muted-foreground">Notifications about changes to existing orders</p>
                  </div>
                  <Switch
                    checked={notifications.orderUpdates}
                    onCheckedChange={(checked) => setNotifications({...notifications, orderUpdates: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Payment Notifications</h4>
                    <p className="text-sm text-muted-foreground">Updates about payments and payouts</p>
                  </div>
                  <Switch
                    checked={notifications.payments}
                    onCheckedChange={(checked) => setNotifications({...notifications, payments: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Proposal Updates</h4>
                    <p className="text-sm text-muted-foreground">Notifications when clients respond to your proposals</p>
                  </div>
                  <Switch
                    checked={notifications.proposals}
                    onCheckedChange={(checked) => setNotifications({...notifications, proposals: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Reviews & Feedback</h4>
                    <p className="text-sm text-muted-foreground">Get notified when customers leave reviews</p>
                  </div>
                  <Switch
                    checked={notifications.reviews}
                    onCheckedChange={(checked) => setNotifications({...notifications, reviews: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing & Updates</h4>
                    <p className="text-sm text-muted-foreground">Platform updates and marketing opportunities</p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications({...notifications, marketing: checked})}
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications} className="w-full">
                Save Notification Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorAccountSettings;
