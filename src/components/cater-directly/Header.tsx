
import { Link, useNavigate } from "react-router-dom";
import { APP_LOGO } from "@/constants/app-assets";
import { cn } from "@/lib/utils";

interface HeaderProps {
  hideNavigation?: boolean;
  variant?: "dark" | "light";
}

const Header = ({ hideNavigation = false, variant = "dark" }: HeaderProps) => {
  const navigate = useNavigate();
  
  const isDark = variant === "dark";
  const textColor = isDark ? "text-white" : "text-gray-800";
  const bgColor = isDark ? "bg-black" : "bg-white";
  const borderColor = isDark ? "" : "border-b border-gray-200";

  const handleScrollToSection = (sectionId: string) => {
    // If not on home page, navigate to home first with hash
    if (window.location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      // Update URL with hash
      window.history.pushState(null, '', `#${sectionId}`);
      
      // Get the header height to account for any offset
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 0;
      
      // Calculate the position to scroll to (top of viewport)
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;
      
      // Smooth scroll to the calculated position
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className={cn("w-full", bgColor, borderColor)}>
      <div className="container mx-auto px-4 py-3 md:py-6">
        <div className="flex items-center justify-between">
        <img
          src={APP_LOGO.url}
          className={APP_LOGO.className.default + " cursor-pointer h-10 sm:h-12 md:h-14 w-auto"}
          alt={APP_LOGO.alt}
          width={133}
          height={73}
          onClick={() => navigate('/')}
        />
        {!hideNavigation && (
          <nav className="hidden md:flex items-center space-x-8" aria-label="Primary">
            <Link 
              to="/marketplace" 
              className={cn(
                "flex items-center space-x-1 cursor-pointer font-semibold px-4 py-2 rounded-full transition-colors border",
                isDark 
                  ? "text-white bg-[hsl(var(--primary))]/20 hover:bg-[hsl(var(--primary))]/30 border-[hsl(var(--primary))]/40"
                  : "text-gray-800 bg-[hsl(var(--primary))]/10 hover:bg-[hsl(var(--primary))]/20 border-[hsl(var(--primary))]/30"
              )}
            >
              <span className="text-sm">Browse Marketplace</span>
            </Link>
            <a href="/#services" className={cn("flex items-center space-x-1 cursor-pointer", textColor)}>
              <span className="text-sm">Services</span>
            </a>
            <a 
              href="/#how-it-works" 
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection('how-it-works');
              }}
              className={cn("flex items-center space-x-1 cursor-pointer", textColor)}
            >
              <span className="text-sm">How it works</span>
            </a>
            <a href="/#faqs" className={cn("flex items-center space-x-1 cursor-pointer", textColor)}>
              <span className="text-sm">FAQs</span>
            </a>
          </nav>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
          <Link 
            to="/host/login"
            className="px-3 py-1 md:px-5 md:py-2 text-[hsl(27_88%_51%)] border border-[hsl(27_88%_51%)] rounded-full hover:bg-[hsl(27_88%_51%)] hover:text-white transition-colors text-xs sm:text-sm md:text-base leading-none whitespace-nowrap"
          >
            Event Host Login
          </Link>
          <Link 
            to="/vendor/login"
            className="px-3 py-1 md:px-5 md:py-2 bg-[hsl(27_88%_51%)] text-white rounded-full hover:bg-[hsl(27_88%_46%)] transition-colors text-xs sm:text-sm md:text-base leading-none whitespace-nowrap"
          >
            Vendor Login
          </Link>
        </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
