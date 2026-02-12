import React, { useEffect } from 'react';
import { 
  getOrganizationJsonLd, 
  getWebsiteJsonLd,
  getLocalBusinessJsonLd,
  getBreadcrumbJsonLd
} from '@/content/siteMeta';
import { getEventServicesJsonLd } from '@/content/eventsShowcase';
import { getFaqJsonLd } from '@/content/faqs';

const SeoJsonLd = () => {
  useEffect(() => {
    const baseUrl = window.location.origin;

    const scripts: HTMLScriptElement[] = [];

    const addJsonLd = (key: string, data: object) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-key', key);
      script.text = JSON.stringify(data);
      document.head.appendChild(script);
      scripts.push(script);
    };

    addJsonLd('organization', getOrganizationJsonLd(baseUrl));
    addJsonLd('website', getWebsiteJsonLd(baseUrl));
    addJsonLd('local-business', getLocalBusinessJsonLd(baseUrl));
    addJsonLd('breadcrumb', getBreadcrumbJsonLd(baseUrl));
    addJsonLd('event-services', getEventServicesJsonLd(baseUrl));
    addJsonLd('faqs', getFaqJsonLd(baseUrl));

    return () => {
      scripts.forEach((s) => s.remove());
    };
  }, []);

  return null;
};

export default SeoJsonLd;
