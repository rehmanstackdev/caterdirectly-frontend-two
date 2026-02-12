import { useState, useEffect } from 'react';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Mobile: < 768px
      setIsMobile(width < 768);
      
      // Tablet: 768px - 1024px
      setIsTablet(width >= 768 && width <= 1024);
      
      // Touch device detection
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        /Mobi|Android/i.test(navigator.userAgent)
      );
    };

    // Check on mount
    checkDevice();

    // Check on resize
    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isTouchDevice,
    isDesktop: !isMobile && !isTablet
  };
};