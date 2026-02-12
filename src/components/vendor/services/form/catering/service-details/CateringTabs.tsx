
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CateringServiceDetails } from '@/types/service-types';
import CateringBasicInfo from './CateringBasicInfo';
import CateringMenu from './CateringMenu';
import DeliveryOptionsForm from '../DeliveryOptionsForm';
import PackagingOptionsForm from '../PackagingOptionsForm';
import ServiceAdditionsForm from '../ServiceAdditionsForm';

interface CateringTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  formData: Partial<CateringServiceDetails>;
  updateFormData: (data: Partial<CateringServiceDetails>) => void;
  editingMenuItem: any;
  setEditingMenuItem: (item: any) => void;
  showMenuItemForm: boolean;
  setShowMenuItemForm: (show: boolean) => void;
  menuCategories: string[];
  handleAddMenuItem: () => void;
  handleEditMenuItem: (item: any) => void;
  handleSaveMenuItem: (item: any) => void;
  handleDeleteMenuItem: (itemId: string) => void;
  handleCancelMenuItem: () => void;
  uploadingMenuImage: boolean;
  handleMenuImageUpload: (file: File) => void;
  handleMenuImageComplete: (url: string) => void;
  handleRemoveMenuImage: () => void;
}

const CateringTabs: React.FC<CateringTabsProps> = ({
  activeTab,
  setActiveTab,
  formData,
  updateFormData,
  editingMenuItem,
  setEditingMenuItem,
  showMenuItemForm,
  setShowMenuItemForm,
  menuCategories,
  handleAddMenuItem,
  handleEditMenuItem,
  handleSaveMenuItem,
  handleDeleteMenuItem,
  handleCancelMenuItem,
  uploadingMenuImage,
  handleMenuImageUpload,
  handleMenuImageComplete,
  handleRemoveMenuImage
}) => {
  // Update packaging options
  const handleUpdatePackaging = (packagingOptions: any) => {
    updateFormData({ packagingOptions });
  };

  // Update delivery options
  const handleUpdateDelivery = (deliveryOptions: any) => {
    updateFormData({ deliveryOptions });
  };

  // Update service additions
  const handleUpdateAdditions = (serviceAdditions: any) => {
    updateFormData({ serviceAdditions });
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-5 w-full mb-6">
        <TabsTrigger value="basics">Basic Info</TabsTrigger>
        <TabsTrigger value="menu">Menu Items</TabsTrigger>
        <TabsTrigger value="packaging">Packaging</TabsTrigger>
        <TabsTrigger value="delivery">Delivery</TabsTrigger>
        <TabsTrigger value="additions">Additions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basics" className="space-y-6">
        <CateringBasicInfo 
          formData={formData}
          updateFormData={updateFormData}
        />
      </TabsContent>
      
      <TabsContent value="menu">
        <CateringMenu 
          formData={formData}
          updateFormData={updateFormData}
          editingMenuItem={editingMenuItem}
          setEditingMenuItem={setEditingMenuItem}
          showMenuItemForm={showMenuItemForm}
          setShowMenuItemForm={setShowMenuItemForm}
          menuCategories={menuCategories}
          handleAddMenuItem={handleAddMenuItem}
          handleEditMenuItem={handleEditMenuItem}
          handleSaveMenuItem={handleSaveMenuItem} 
          handleDeleteMenuItem={handleDeleteMenuItem}
          handleCancelMenuItem={handleCancelMenuItem}
          uploadingMenuImage={uploadingMenuImage}
          handleMenuImageUpload={handleMenuImageUpload}
          handleMenuImageComplete={handleMenuImageComplete}
          handleRemoveMenuImage={handleRemoveMenuImage}
        />
      </TabsContent>
      
      <TabsContent value="packaging">
        <PackagingOptionsForm
          packagingOptions={formData.packagingOptions || {
            disposable: true,
            disposableFee: 0,
            reusable: false,
            reusableFeeType: 'flat_rate',
            reusableServiceFeePercentage: 0,
            reusableServiceFeeFlatRate: 0
          }}
          onUpdate={handleUpdatePackaging}
        />
      </TabsContent>
      
      <TabsContent value="delivery">
        <DeliveryOptionsForm
          deliveryOptions={formData.deliveryOptions || {
            delivery: true,
            pickup: true,
            deliveryRanges: [{ range: '0-5 miles', fee: 0 }],
            deliveryMinimum: 0
          }}
          onUpdate={handleUpdateDelivery}
        />
      </TabsContent>
      
      <TabsContent value="additions">
        <ServiceAdditionsForm
          serviceAdditions={formData.serviceAdditions || {
            providesUtensils: true,
            utensilsFee: 0,
            providesPlates: true,
            platesFee: 0,
            providesNapkins: true,
            napkinsFee: 0,
            providesServingUtensils: true,
            servingUtensilsFee: 0,
            providesLabels: false
          }}
          onUpdate={handleUpdateAdditions}
        />
      </TabsContent>
    </Tabs>
  );
};

export default CateringTabs;
