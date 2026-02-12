
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface LoadingState {
  caterersSection: boolean;
  venuesSection: boolean;
  staffSection: boolean;
  rentalsSection: boolean;
  images: Record<string, boolean>;
}

interface LoadingContextType {
  loadingState: LoadingState;
  startLoading: (section: keyof Omit<LoadingState, 'images'>) => void;
  stopLoading: (section: keyof Omit<LoadingState, 'images'>) => void;
  registerImage: (id: string) => void;
  imageLoaded: (id: string) => void;
  isAnySectionLoading: () => boolean;
}

const initialLoadingState: LoadingState = {
  caterersSection: true,
  venuesSection: true,
  staffSection: true,
  rentalsSection: true,
  images: {},
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>(initialLoadingState);
  const [imageRegistry, setImageRegistry] = useState<Set<string>>(new Set());

  const startLoading = useCallback((section: keyof Omit<LoadingState, 'images'>) => {
    setLoadingState((prev) => ({
      ...prev,
      [section]: true,
    }));
  }, []);

  const stopLoading = useCallback((section: keyof Omit<LoadingState, 'images'>) => {
    setLoadingState((prev) => ({
      ...prev,
      [section]: false,
    }));
  }, []);

  const registerImage = useCallback((id: string) => {
    setImageRegistry(prev => {
      const newRegistry = new Set(prev);
      newRegistry.add(id);
      return newRegistry;
    });
    
    setLoadingState((prev) => ({
      ...prev,
      images: { ...prev.images, [id]: true },
    }));
  }, []);

  const imageLoaded = useCallback((id: string) => {
    setLoadingState((prev) => {
      const newImages = { ...prev.images };
      newImages[id] = false;
      return {
        ...prev,
        images: newImages,
      };
    });
  }, []);

  // Cleanup any stale image entries
  useEffect(() => {
    // Set a timeout to periodically clean up stale image entries
    const cleanupInterval = setInterval(() => {
      setLoadingState(prev => {
        const activeImages = Object.entries(prev.images)
          .filter(([id, loading]) => imageRegistry.has(id) || loading)
          .reduce((obj, [id, loading]) => ({ ...obj, [id]: loading }), {});
          
        return {
          ...prev,
          images: activeImages
        };
      });
    }, 10000); // Run cleanup every 10 seconds
    
    return () => clearInterval(cleanupInterval);
  }, [imageRegistry]);

  const isAnySectionLoading = useCallback(() => {
    const anySectionLoading = 
      loadingState.caterersSection ||
      loadingState.venuesSection ||
      loadingState.staffSection ||
      loadingState.rentalsSection;
      
    const anyImageLoading = Object.values(loadingState.images).some(isLoading => isLoading);
    
    return anySectionLoading || anyImageLoading;
  }, [loadingState]);

  return (
    <LoadingContext.Provider
      value={{
        loadingState,
        startLoading,
        stopLoading,
        registerImage,
        imageLoaded,
        isAnySectionLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  
  return context;
};
