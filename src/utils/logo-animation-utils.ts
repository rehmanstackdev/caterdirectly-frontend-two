
import { useState, useEffect } from "react";

type Logo = {
  src: string;
  alt: string;
};

/**
 * Custom hook to manage logo animation and rotation
 */
export const useLogoAnimation = (allLogos: Logo[], visibleCount: number) => {
  const [visibleLogos, setVisibleLogos] = useState<Logo[]>([]);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [logoPool, setLogoPool] = useState<Logo[]>([]);
  const [lastChangedIndex, setLastChangedIndex] = useState<number | null>(null);

  // Initialize visible logos and logo pool
  useEffect(() => {
    // Safety check: ensure allLogos has valid data
    if (!allLogos || allLogos.length === 0) {
      setVisibleLogos([]);
      setLogoPool([]);
      return;
    }

    // Create a shuffled copy of all logos
    const shuffled = [...allLogos].sort(() => Math.random() - 0.5);
    
    // Set initial visible logos
    const initial = shuffled.slice(0, visibleCount).filter(logo => logo && logo.src);
    setVisibleLogos(initial);
    
    // Set remaining logos as the logo pool (excluding visible ones)
    const initialSrcs = new Set(initial.map(logo => logo.src));
    const remaining = shuffled.filter(logo => logo && logo.src && !initialSrcs.has(logo.src));
    setLogoPool(remaining);
    
    // Reset last changed index when display changes
    setLastChangedIndex(null);
  }, [allLogos, visibleCount]);

  // Animation cycle
  useEffect(() => {
    if (isAnimating || animatingIndex !== null) return;

    const timeoutId = setTimeout(() => {
      setIsAnimating(true);

      // Select a random index to change, excluding the last changed index
      let availableIndices = Array.from({ length: visibleCount }, (_, i) => i);
      
      // Filter out the last changed index if it exists
      if (lastChangedIndex !== null) {
        availableIndices = availableIndices.filter(i => i !== lastChangedIndex);
      }
      
      // Select a random index from available indices
      const randomPosition = Math.floor(Math.random() * availableIndices.length);
      const indexToChange = availableIndices[randomPosition];
      
      // Save the current index as the last changed
      setLastChangedIndex(indexToChange);
      setAnimatingIndex(indexToChange);

      setTimeout(() => {
        setVisibleLogos(prev => {
          // Create a new array from previous visible logos
          const newLogos = [...prev];
          const currentLogoAtIndex = prev[indexToChange];
          
          // Early return if current logo is invalid
          if (!currentLogoAtIndex || !currentLogoAtIndex.src) {
            return prev;
          }
          
          // Get all currently visible logo sources except the one we're replacing
          const currentVisibleSrcs = new Set(
            prev.filter((logo, i) => logo && logo.src && i !== indexToChange).map(logo => logo.src)
          );
          
          if (logoPool.length > 0) {
            // Find logos from the pool that aren't currently visible elsewhere
            const availablePoolLogos = logoPool.filter(logo => logo && logo.src && !currentVisibleSrcs.has(logo.src));
            
            if (availablePoolLogos.length > 0) {
              // Take a random non-duplicate logo from the filtered pool
              const randomPoolIndex = Math.floor(Math.random() * availablePoolLogos.length);
              const nextLogo = availablePoolLogos[randomPoolIndex];
              
              // Remove the selected logo from the pool and add the replaced one back
              setLogoPool(prevPool => {
                const newPool = prevPool.filter(logo => logo && logo.src && logo.src !== nextLogo.src);
                // Only add back if valid
                if (currentLogoAtIndex && currentLogoAtIndex.src) {
                  newPool.push(currentLogoAtIndex);
                }
                return newPool;
              });
              
              // Replace the logo at the selected index
              newLogos[indexToChange] = nextLogo;
            } else {
              // Fall back to using a logo from the full set if needed
              refreshLogoPool(newLogos, indexToChange, currentLogoAtIndex);
            }
          } else {
            // If pool is empty, refresh from the full logo set
            refreshLogoPool(newLogos, indexToChange, currentLogoAtIndex);
          }
          
          return newLogos;
        });

        setTimeout(() => {
          setAnimatingIndex(null);
          
          setTimeout(() => {
            setIsAnimating(false);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [isAnimating, animatingIndex, logoPool, visibleCount, lastChangedIndex, allLogos]);

  // Helper function to refresh the logo pool and select a non-duplicate logo
  const refreshLogoPool = (
    currentLogos: Logo[], 
    indexToChange: number, 
    currentLogoAtIndex: Logo
  ) => {
    // Get all currently visible logo sources except the one we're replacing
    const visibleSrcs = new Set(
      currentLogos
        .filter((logo, i) => logo && logo.src && i !== indexToChange)
        .map(logo => logo.src)
    );
    
    // Find logos from all available logos that aren't currently visible
    const availableLogos = allLogos.filter(logo => logo && logo.src && !visibleSrcs.has(logo.src));
    
    if (availableLogos.length > 0) {
      // Use a random logo from those not currently displayed
      const randomIndex = Math.floor(Math.random() * availableLogos.length);
      const nextLogo = availableLogos[randomIndex];
      currentLogos[indexToChange] = nextLogo;
      
      // Rebuild the logo pool with logos not currently visible
      const newVisibleSrcs = new Set(currentLogos.filter(logo => logo && logo.src).map(logo => logo.src));
      setLogoPool(
        allLogos
          .filter(logo => logo && logo.src && !newVisibleSrcs.has(logo.src))
          .sort(() => Math.random() - 0.5)
      );
    }
  };

  return { visibleLogos, animatingIndex };
};
