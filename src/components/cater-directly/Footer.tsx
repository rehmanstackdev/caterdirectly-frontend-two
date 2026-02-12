import { FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

const Footer = () => {
  const handleScrollToSection = (sectionId: string) => {
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
    <footer className="bg-[rgba(244,246,248,1)] self-stretch flex w-full flex-col items-center pt-[140px] pb-[35px] px-20 max-md:max-w-full max-md:pt-[100px] max-md:px-5 min-h-[400px] sm:min-h-[450px] md:min-h-[500px]">
      <div className="flex w-full max-w-[1682px] flex-col items-stretch max-md:max-w-full">
        <div className="w-full max-w-[1599px] max-md:max-w-full">
          <div className="grid w-full max-w-[1599px] grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10">
            {/* Brand blurb */}
            <div className="md:col-span-2 text-sm text-[rgba(66,73,82,1)] font-medium">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/74781423f4a77b34afbf047397cbddcb9962d250?width=133&quality=85&format=webp"
                className="aspect-[1.82] object-contain w-[133px] max-w-full"
                width="133"
                height="73"
                alt="Cater Directly Logo"
              />
              <p className="mt-[15px]">
                Cater Directly is your premier event marketplace, connecting you instantly with trusted local vendors for catering, venues, event staffing, and party rentals.
              </p>
              <p className="mt-3">
                Now serving Northern California, including the San Francisco Bay Area, San Jose, Oakland, Napa, and surrounding cities.
              </p>
            </div>

            {/* Explore links */}
            <nav aria-label="Footer Explore" className="text-sm text-[rgba(66,73,82,1)] font-medium mt-[5px]">
              <h3 className="text-[rgba(2,2,2,1)] text-base font-semibold">Explore</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#top" className="hover:text-[rgba(240,119,18,1)] transition-colors">Home</a>
                </li>
                <li>
                  <a 
                    href="#caterers" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleScrollToSection('caterers');
                    }}
                    className="hover:text-[rgba(240,119,18,1)] transition-colors cursor-pointer"
                  >
                    Catering Services
                  </a>
                </li>
                <li>
                  <a 
                    href="#venues" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleScrollToSection('venues');
                    }}
                    className="hover:text-[rgba(240,119,18,1)] transition-colors cursor-pointer"
                  >
                    Venues & Event Spaces
                  </a>
                </li>
                <li>
                  <a href="#staff-rentals" className="hover:text-[rgba(240,119,18,1)] transition-colors">Staff & Party Rentals</a>
                </li>
                <li>
                  <a href="#faqs" className="hover:text-[rgba(240,119,18,1)] transition-colors">FAQ</a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-[rgba(240,119,18,1)] transition-colors">How it works</a>
                </li>
              </ul>
            </nav>

            {/* Info links */}
            <nav aria-label="Footer Info" className="text-sm text-[rgba(66,73,82,1)] font-medium mt-[5px]">
              <h3 className="text-[rgba(2,2,2,1)] text-base font-semibold">Info</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="mailto:info@caterdirectly.com" className="hover:text-[rgba(240,119,18,1)] transition-colors">Contact Us</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/7f8731f2179c721733d345dfcddcb9e6eab49e2b?width=1000&quality=85&format=webp"
          className="aspect-[1000] object-contain w-full mt-11 max-md:max-w-full max-md:mt-10"
          width="1000"
          height="1"
          alt="Divider"
        />
        <div className="flex w-full items-stretch gap-5 text-sm text-[#424952] font-medium flex-wrap justify-between mt-[15px] max-md:max-w-full">
          <div>2025 Cater Directly. All Rights Reserved.</div>
          <div className="flex gap-8">
            <Dialog>
              <DialogTrigger asChild>
                <button className="hover:text-[rgba(240,119,18,1)] transition-colors">
                  Privacy Policy
                </button>
              </DialogTrigger>
              <DialogContent aria-label="Privacy Policy" className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Privacy Policy</DialogTitle>
                  <DialogDescription>How we collect, use, and protect your data.</DialogDescription>
                </DialogHeader>
                <div className="text-sm text-[#424952]">
                  <iframe
                    src="/privacy.html"
                    title="Privacy Policy"
                    className="w-full h-[70vh] rounded"
                  />
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <button className="hover:text-[rgba(240,119,18,1)] transition-colors">
                  Terms of Use
                </button>
              </DialogTrigger>
              <DialogContent aria-label="Terms of Use" className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Terms of Use</DialogTitle>
                  <DialogDescription>The rules and conditions for using our service.</DialogDescription>
                </DialogHeader>
                <div className="text-sm text-[#424952]">
                  <iframe
                    src="/terms.html"
                    title="Terms of Use"
                    className="w-full h-[70vh] rounded"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
