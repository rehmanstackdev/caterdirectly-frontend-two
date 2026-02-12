
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface MetaTagOptions {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

export function usePageMeta(options: MetaTagOptions) {
  const location = useLocation();
  const baseUrl = window.location.origin;
  const currentUrl = baseUrl + location.pathname;
  
  // Check if we're on the homepage - if so, don't override the static meta tags
  const isHomepage = location.pathname === '/';
  
  // Default values
  const defaultTitle = "CaterDirectly - Event Services Marketplace";
  const defaultDescription = "Find the best catering services, venues, party rentals, and staffing for your events";
  const defaultImage = `${baseUrl}/lovable-uploads/5a0003fb-1412-482d-a6cb-4352fc398d2d.png`;
  
  const title = options.title || defaultTitle;
  const description = options.description || defaultDescription;
  const image = options.image || defaultImage;
  const type = options.type || "website";

  useEffect(() => {
    // For homepage, only update the document title but preserve static OG tags
    if (isHomepage) {
      document.title = title;
      return;
    }

    // For other pages, update all meta tags as before
    document.title = title;
    
    // Find or create meta description tag
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
    
    // Update Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', currentUrl);
    updateMetaTag('og:type', type);
    
    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    
    // Cleanup - reset to defaults when component unmounts (non-homepage only)
    return () => {
      document.title = defaultTitle;
      if (metaDescription) metaDescription.setAttribute('content', defaultDescription);
      updateMetaTag('og:title', defaultTitle);
      updateMetaTag('og:description', defaultDescription);
      updateMetaTag('og:image', defaultImage);
      updateMetaTag('og:url', baseUrl);

      const canonicalTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (canonicalTag) canonicalTag.setAttribute('href', baseUrl);

      updateMetaTag('twitter:title', defaultTitle);
      updateMetaTag('twitter:description', defaultDescription);
      updateMetaTag('twitter:image', defaultImage);
    };
  }, [title, description, image, currentUrl, type, isHomepage]);
}

function updateMetaTag(property: string, content: string, attributeType = 'property') {
  let tag = document.querySelector(`meta[${attributeType}="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attributeType, property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}
