import { Button } from '@/components/ui/button';

interface MarketplacePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

const MarketplacePagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  isLoading,
  onPageChange
}: MarketplacePaginationProps) => {
  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between px-2 py-4 border-t">
      <div className="text-sm text-muted-foreground">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <>
            Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
            <span className="font-medium">{totalItems}</span> services
          </>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {isLoading ? (
          <>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Go to first page</span>
              &laquo;
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 px-3"
            >
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {(() => {
                const pages: (number | string)[] = [];

                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  pages.push(1);

                  if (currentPage > 3) {
                    pages.push('...');
                  }

                  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                    if (!pages.includes(i)) {
                      pages.push(i);
                    }
                  }

                  if (currentPage < totalPages - 2) {
                    pages.push('...');
                  }

                  if (!pages.includes(totalPages)) {
                    pages.push(totalPages);
                  }
                }

                return pages.map((page, index) =>
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(page as number)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  )
                );
              })()}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 px-3"
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Go to last page</span>
              &raquo;
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default MarketplacePagination;
