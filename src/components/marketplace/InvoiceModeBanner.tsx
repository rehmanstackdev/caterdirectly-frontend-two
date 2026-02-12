
import { FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, X, ShoppingCart, Users } from 'lucide-react';
import { useInvoiceMode } from '@/hooks/use-invoice-mode';
import { VendorInvoiceInfoDialog } from './VendorInvoiceInfoDialog';

const InvoiceModeBanner = () => {
  const [searchParams] = useSearchParams();
  const isVendorMode = searchParams.get('vendor') === 'true';
  
  const {
    isInvoiceMode,
    selectedServices,
    totalSelectedServices,
    proceedToInvoiceCreation,
    exitInvoiceMode,
    showVendorInfo,
    setShowVendorInfo,
    handleVendorInfoDismiss
  } = useInvoiceMode();

  if (!isInvoiceMode) return null;

  const totalValue = selectedServices.reduce((sum, service) => {
    const price = typeof service.price === 'string' 
      ? parseFloat(service.price.replace(/[^0-9.]/g, '')) 
      : service.price || 0;
    return sum + (price * (service.invoiceQuantity || 1));
  }, 0);

  return (
    <Card className="bg-gradient-to-r from-[#F07712] to-[#FFB473] text-white border-none shadow-lg sticky top-0 z-40">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="font-semibold">
                {isVendorMode ? "Creating Invoice" : "Invoice Mode"}
              </span>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Active
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <ShoppingCart className="h-4 w-4" />
                <span>{totalSelectedServices} service{totalSelectedServices !== 1 ? 's' : ''}</span>
              </div>
              {totalValue > 0 && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={proceedToInvoiceCreation}
              disabled={totalSelectedServices === 0}
              className="bg-white text-[#F07712] hover:bg-white/90"
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice ({totalSelectedServices})
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={exitInvoiceMode}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {totalSelectedServices > 0 && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="text-sm opacity-90">
              {isVendorMode 
                ? "Selected services from your inventory will be included in the invoice for your client."
                : "Selected services will be compiled into a custom invoice for your client."
              }
            </div>
          </div>
        )}
      </div>
      
      <VendorInvoiceInfoDialog
        open={showVendorInfo}
        onOpenChange={setShowVendorInfo}
        onDontShowAgain={handleVendorInfoDismiss}
      />
    </Card>
  );
};

export default InvoiceModeBanner;
