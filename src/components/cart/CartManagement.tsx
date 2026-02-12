import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useDraftOrders, DraftOrder } from '@/hooks/use-draft-orders';
import { EnhancedDraftManagementToolbar } from '@/components/draft/EnhancedDraftManagementToolbar';
import { saveBookingStateBackup, loadBookingStateBackup, clearBookingStateBackup } from '@/utils/booking-state-persistence';
import { toast } from 'sonner';
import { Save, RefreshCw, Trash2, AlertCircle, Database } from 'lucide-react';

interface CartManagementProps {
  selectedServices?: any[];
  selectedItems?: Record<string, number>;
  formData?: any;
  onLoadDraft?: (draft: DraftOrder) => void;
}

export const CartManagement = ({
  selectedServices = [],
  selectedItems = {},
  formData = {},
  onLoadDraft
}: CartManagementProps) => {
  const { cartItems, clearCart } = useCart();
  const { autoSave } = useDraftOrders();

  const hasUnsavedChanges = selectedServices.length > 0 || Object.keys(selectedItems).length > 0;

  // Auto-save every 30 seconds if there are changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const interval = setInterval(() => {
      autoSave(selectedServices, selectedItems, formData);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [selectedServices, selectedItems, formData, hasUnsavedChanges, autoSave]);

  // Legacy localStorage functions for backward compatibility
  const handleRestoreBackup = () => {
    try {
      const backup = loadBookingStateBackup();
      if (backup) {
        toast.success('Previous backup restored! Your selections have been recovered.');
        window.location.reload();
      } else {
        toast.info('No local backup found. Use "Load Drafts" for saved orders.');
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      toast.error('Failed to restore backup. Please try again.');
    }
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) {
      toast.info('Cart is already empty.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to clear your cart? This will remove ${cartItems.length} item(s) and cannot be undone.`
    );
    
    if (confirmed) {
      clearCart(true);
      clearBookingStateBackup();
    }
  };

  return (
    <>
      {/* Compact save bar */}
      <div className="bg-muted/30 border border-border/50 rounded-lg px-3 py-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {hasUnsavedChanges && (
              <>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">Auto-saving</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {hasUnsavedChanges && (
              <Button
                onClick={() => autoSave(selectedServices, selectedItems, formData)}
                size="sm"
                className="h-7 px-2 text-xs"
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
            )}
            
            <Button
              onClick={handleRestoreBackup}
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Load</span>
            </Button>
            
            {cartItems.length > 0 && (
              <Button
                onClick={handleClearCart}
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Draft management in a less intrusive sheet instead of floating toolbar */}
      <EnhancedDraftManagementToolbar
        selectedServices={selectedServices}
        selectedItems={selectedItems}
        formData={formData}
        onLoadDraft={onLoadDraft}
        className="hidden" // Hide the floating toolbar
      />
    </>
  );
};