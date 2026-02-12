
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

type ServiceTab = 'all' | 'catering' | 'venues' | 'party-rentals' | 'staff';

export const useMarketplaceTabs = () => {
  const [activeTab, setActiveTab] = useState<ServiceTab>('all');
  const params = useParams();
  const location = useLocation();

  useEffect(() => {
    // Set active tab based on URL path
    if (location.pathname.includes("caterers")) {
      setActiveTab("catering");
    } else if (location.pathname.includes("venues")) {
      setActiveTab("venues");
    } else if (location.pathname.includes("party-rentals")) {
      setActiveTab("party-rentals");
    } else if (location.pathname.includes("staff")) {
      setActiveTab("staff");
    }

    // Check for category in query params
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get('category');
    if (category) {
      if (category === 'all') setActiveTab("all");
      if (category === 'catering') setActiveTab("catering");
      if (category === 'venues') setActiveTab("venues");
      if (category === 'party-rentals') setActiveTab("party-rentals");
      if (category === 'staffing' || category === 'staff') setActiveTab("staff");
    }
  }, [location.pathname, location.search, params]);

  return {
    activeTab,
    setActiveTab
  };
};
