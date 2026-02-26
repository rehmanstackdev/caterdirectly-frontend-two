import React from "react";
import { MenuItem } from "@/types/service-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusCircle, X } from "lucide-react";
import { MenuItemForm } from "../menu-item";
import MenuItemsList from "../MenuItemsList";
import FileUpload from "@/components/shared/FileUpload";
import ServiceImage from "@/components/shared/ServiceImage";

interface CateringMenuProps {
  formData: any;
  updateFormData: (data: any) => void;
  editingMenuItem: MenuItem | null;
  setEditingMenuItem: (item: MenuItem | null) => void;
  showMenuItemForm: boolean;
  setShowMenuItemForm: (show: boolean) => void;
  menuCategories: string[];
  handleAddMenuItem: () => void;
  handleEditMenuItem: (item: MenuItem) => void;
  handleSaveMenuItem: (item: MenuItem) => void;
  handleDeleteMenuItem: (itemId: string) => void;
  handleCancelMenuItem: () => void;
  uploadingMenuImage: boolean;
  handleMenuImageUpload: (file: File) => void;
  handleMenuImageComplete: (url: string) => void;
  handleRemoveMenuImage: () => void;
}

const CateringMenu: React.FC<CateringMenuProps> = ({
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
  handleRemoveMenuImage,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Menu Items</h3>
          <p className="text-sm text-gray-500">
            Add menu items with specific pricing, dietary restrictions and
            allergen information
          </p>
        </div>
        <Button
          onClick={handleAddMenuItem}
          className="bg-[#F07712] hover:bg-[#F07712]/90"
        >
          <PlusCircle className="w-4 h-4 mr-1" />
          Add Menu Item
        </Button>
      </div>

      {/* Add Menu Image Section */}
      <div className="border-b pb-6 space-y-4">
        <div>
          <Label className="flex items-center gap-2">
            Menu Photo
            <span className="text-xs text-gray-500 font-normal">
              (Overall photo of your menu or featured dish)
            </span>
          </Label>
          <p className="text-sm text-gray-500 mb-2">
            This image will be displayed prominently in your service listing
          </p>
        </div>

        {formData.menuImage ? (
          <div className="relative border rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-[16/9] max-h-64 w-full">
              <ServiceImage
                src={formData.menuImage}
                alt="Menu Cover Image"
                className="w-full h-full object-cover"
                aspectRatio="aspect-[16/9]"
              />
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={handleRemoveMenuImage}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2">
              <p className="truncate">Menu Cover Image</p>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg shadow-sm overflow-hidden">
            <FileUpload
              onFileUpload={handleMenuImageUpload}
              onFileUploadComplete={handleMenuImageComplete}
              uploading={uploadingMenuImage}
              className="aspect-[16/9] max-h-64"
              compressionType="menu"
              showCompressionInfo={true}
            />
          </div>
        )}
      </div>

      {showMenuItemForm ? (
        <MenuItemForm
          menuItem={editingMenuItem || undefined}
          onSave={handleSaveMenuItem}
          onCancel={handleCancelMenuItem}
          categories={menuCategories}
        />
      ) : (
        <MenuItemsList
          menuItems={(() => {
            const menuItems = formData.menuItems || [];
            const combos = formData.combos || [];
            const comboMenuItems = combos.map((combo) => ({
              id: combo.id,
              name: combo.name,
              description: combo.description,
              price: combo.pricePerPerson,
              priceType: "per_person" as const,
              category: combo.category,
              image: combo.imageUrl,
              isCombo: true,
              comboCategories: combo.comboCategories,
            }));
            const allItems = [...menuItems, ...comboMenuItems];
            console.log("All items for display:", allItems);
            return allItems;
          })()}
          onEdit={handleEditMenuItem}
          onDelete={handleDeleteMenuItem}
        />
      )}
    </div>
  );
};

export default CateringMenu;
