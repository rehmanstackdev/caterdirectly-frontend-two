
import { usePageMeta } from '@/hooks/use-page-meta';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

const MetaTags = ({ 
  title, 
  description, 
  image, 
  type = "website" 
}: MetaTagsProps) => {
  usePageMeta({
    title,
    description,
    image,
    type
  });
  
  // This component doesn't render anything visible
  return null;
};

export default MetaTags;
