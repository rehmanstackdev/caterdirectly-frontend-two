import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const shuffleArrayAvoidingFirst = <T extends { id: string }>(array: T[], avoidIndex: number): T[] => {
  let shuffled = shuffleArray(array);
  
  // If first element would be same as last shown, swap it with second element
  if (shuffled.length > 1 && shuffled[0].id === array[avoidIndex].id) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  
  return shuffled;
};

const HeroEventGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from('hero_event_gallery')
        .select('id, image_url, caption, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        setImages(shuffleArray(data));
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      // Start fade out
      setIsTransitioning(true);
      
      setTimeout(() => {
        // Calculate next index
        const next = (currentIndex + 1) % images.length;
        
        // Reshuffle if completing cycle
        if (next === 0 && images.length > 1) {
          setImages(prevImages => shuffleArrayAvoidingFirst(prevImages, currentIndex));
        }
        
        // Update index and reset loading state
        setCurrentIndex(next);
        setImageLoaded(false);
        setIsTransitioning(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [images, currentIndex]);

  // Preload next image whenever currentIndex changes
  useEffect(() => {
    if (images.length > 1) {
      const nextIndex = (currentIndex + 1) % images.length;
      const img = new Image();
      img.src = images[nextIndex].image_url;
    }
  }, [currentIndex, images]);

  if (images.length === 0) {
    return (
      <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-primary/20 to-primary/5">
        <img
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=75&fit=crop"
          srcSet="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=480&q=70&fit=crop 480w,
                  https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=75&fit=crop 800w,
                  https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=85&fit=crop 1200w"
          sizes="(max-width: 640px) 480px, (max-width: 1024px) 800px, 1200px"
          alt="Large catered event with guests and food service"
          className="w-full h-full object-cover"
          width="800"
          height="533"
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl bg-neutral-900">
      {/* Single Image with Smooth Transitions */}
      <img
        src={images[currentIndex].image_url}
        alt={images[currentIndex].caption || 'Event photo'}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isTransitioning || !imageLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        width="800"
        height="600"
        loading="eager"
        fetchPriority="high"
        onLoad={() => setImageLoaded(true)}
      />

      {/* Image Counter Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroEventGallery;
