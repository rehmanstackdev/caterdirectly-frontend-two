import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface TypewriterTextProps {
  phrases: string[];
  speed?: number; // typing speed (ms per character)
  deleteSpeedMs?: number; // deleting speed (ms per character)
  className?: string;
  minLines?: number; // minimum lines to reserve space for
  clickable?: boolean; // make phrases clickable to navigate to marketplace
}

const TypewriterText = ({ 
  phrases, 
  speed = 100,
  deleteSpeedMs = 50,
  className = "",
  minLines = 1,
  clickable = true
}: TypewriterTextProps) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Reserve vertical space to prevent layout shift when text is empty
  const [reservedHeight, setReservedHeight] = useState<number>(56);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const longestPhrase = useMemo(
    () => phrases.reduce((a, b) => (a.length >= b.length ? a : b), ""),
    [phrases]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentPhrase = phrases[currentIndex];
      
      if (!isDeleting) {
        // Adding characters
        if (currentText !== currentPhrase) {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        } else {
          // Wait a bit before starting to delete
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        // Removing characters
        if (currentText) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? deleteSpeedMs : speed);

    return () => clearTimeout(timeout);
  }, [currentText, currentIndex, isDeleting, phrases, speed, deleteSpeedMs]);

  useEffect(() => {
    const measure = () => {
      const measureEl = measureRef.current;
      const containerEl = containerRef.current;
      if (measureEl && containerEl) {
        const measured = measureEl.offsetHeight || 0;
        const computed = window.getComputedStyle(containerEl);
        const lineHeight = parseFloat(computed.lineHeight || '0') || 0;
        const minPx = Math.max(0, (minLines || 1) * lineHeight);
        const next = Math.max(measured, minPx);
        if (next && next !== reservedHeight) setReservedHeight(next);
      }
    };

    measure();

    let ro: ResizeObserver | null = null;
    let usingWindow = false;
    const onResize = () => measure();

    if (containerRef.current && 'ResizeObserver' in window) {
      ro = new ResizeObserver(() => measure());
      ro.observe(containerRef.current);
    } else {
      usingWindow = true;
      window.addEventListener('resize', onResize);
    }
    
    return () => {
      if (ro && containerRef.current) ro.unobserve(containerRef.current);
      if (usingWindow) window.removeEventListener('resize', onResize);
    };
  }, [longestPhrase, minLines]);

  const handleClick = () => {
    if (!clickable) return;
    
    const currentPhrase = phrases[currentIndex];
    let category = 'catering';
    
    // Map phrases to marketplace categories
    if (currentPhrase.toLowerCase().includes('venue')) {
      category = 'venues';
    } else if (currentPhrase.toLowerCase().includes('staff') || currentPhrase.toLowerCase().includes('bartender') || currentPhrase.toLowerCase().includes('server')) {
      category = 'staff';
    } else if (currentPhrase.toLowerCase().includes('rental') || currentPhrase.toLowerCase().includes('table') || currentPhrase.toLowerCase().includes('chair')) {
      category = 'party-rentals';
    }
    
    navigate(`/marketplace?category=${category}&location=san-francisco-bay-area`);
  };

  return (
    <div 
      ref={containerRef} 
      className={`inline-block align-baseline ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      style={{ position: 'relative' }} 
      aria-live="polite"
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      <span className={className}>{currentText || "\u00A0"}</span>
      <span
        ref={measureRef}
        aria-hidden="true"
        className={"absolute -z-50 opacity-0 pointer-events-none " + className}
        style={{ whiteSpace: 'nowrap' }}
      >
        {longestPhrase || "A"}
      </span>
    </div>
  );
};

export default TypewriterText;
