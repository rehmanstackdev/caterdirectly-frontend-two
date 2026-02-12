import { FC } from "react";
import { useNavigate } from "react-router-dom";

const StaffRentalsSection = () => {
  const navigate = useNavigate();

  const handleBrowseClick = () => {
    navigate('/marketplace?category=party-rentals');
  };

  return (
    <section className="bg-[rgba(255,139,0,0.1)] w-full max-w-full overflow-hidden flex flex-col items-center py-12 md:py-16 px-4 md:px-8 lg:px-[70px] font-sans">
      <div className="w-full max-w-[1677px]">
        <div className="gap-5 flex flex-col md:flex-row md:items-center lg:items-start">
          <div className="w-full md:w-6/12 lg:w-6/12">
            <div className="self-stretch my-0 lg:my-auto">
              <h2 className="text-[rgba(240,119,18,1)] text-3xl sm:text-4xl md:text-4xl lg:text-6xl font-bold leading-tight md:leading-tight">
                Book Expert Event Staff & Premium Party Rentals
              </h2>
              <p className="text-[#676767] text-base sm:text-lg md:text-base lg:text-xl font-medium leading-relaxed md:leading-7 lg:leading-8 mt-8 md:mt-10 md:max-w-xl lg:max-w-2xl">
                Easily find experienced servers, bartenders, coordinators, and
                setup crews to manage your event smoothly. Explore our premium
                selection of rentals-from elegant tables and chairs to stylish
                glassware and decor. Book everything in just a few clicks, and
                let us handle the details while you enjoy your event.
              </p>
              <button 
                onClick={handleBrowseClick}
                className="bg-[rgba(240,119,18,1)] inline-flex w-full sm:w-auto items-center justify-center mt-8 md:mt-10 px-5 py-2.5 md:px-7 md:py-3.5 lg:px-8 lg:py-4 rounded-[40px]"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="text-white text-sm sm:text-base md:text-base lg:text-xl font-medium">
                    Browse Staff & Rentals
                  </div>
                  <div className="bg-white flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-3xl">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/84913af846f97ce52c412c8a1215631cc24c554c?placeholderIfAbsent=true"
                      loading="lazy"
                      className="aspect-[1] object-contain w-4 md:w-5"
                      alt="Arrow right"
                    />
                  </div>
                </div>
              </button>
            </div>
          </div>
          <div className="w-full md:w-6/12 lg:w-6/12 mt-8 md:mt-0">
            <div className="w-full">
              {/* Desktop view - Keep unchanged */}
              <div className="hidden md:flex md:flex-row gap-3 lg:gap-6">
                <div className="w-6/12">
                  <div>
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/809ab98d40784227b6ac331aa69124608611a481?placeholderIfAbsent=true"
                      loading="lazy"
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="aspect-[1.24] object-contain w-full rounded-[29px]"
                      alt="Event staff"
                    />
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/c186e3c02138193e97e46f55880cab2935e44f2d?placeholderIfAbsent=true"
                      loading="lazy"
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="aspect-[1.07] object-contain w-full mt-4 rounded-[29px]"
                      alt="Party rentals"
                    />
                  </div>
                </div>
                <div className="w-6/12">
                  <div className="w-full">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/9f66432d41e02e2d9be7ec88a6dd70faf5d03fa4?placeholderIfAbsent=true"
                      loading="lazy"
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="aspect-[1.04] object-contain w-full rounded-[29px]"
                      alt="Event setup"
                    />
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/1720e0eb2ee646560ca94c4f75555c8209cc5d28?placeholderIfAbsent=true"
                      loading="lazy"
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="aspect-[1.35] object-contain w-full mt-4 rounded-[29px]"
                      alt="Event decor"
                    />
                  </div>
                </div>
              </div>
              
              {/* Mobile view - 2x2 grid */}
              <div className="md:hidden grid grid-cols-2 gap-3">
                <div className="col-span-1">
                  <img
                     src="https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/809ab98d40784227b6ac331aa69124608611a481?placeholderIfAbsent=true"
                     loading="lazy"
                     sizes="(max-width: 767px) 50vw, 0vw"
                     className="aspect-[1.24] object-contain w-full rounded-[29px]"
                     alt="Event staff"
                   />
                </div>
                <div className="col-span-1">
                  <img
                     src="https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/9f66432d41e02e2d9be7ec88a6dd70faf5d03fa4?placeholderIfAbsent=true"
                     loading="lazy"
                     sizes="(max-width: 767px) 50vw, 0vw"
                     className="aspect-[1.04] object-contain w-full rounded-[29px]"
                     alt="Event setup"
                   />
                </div>
                <div className="col-span-1">
                  <img
                     src="https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/c186e3c02138193e97e46f55880cab2935e44f2d?placeholderIfAbsent=true"
                     loading="lazy"
                     sizes="(max-width: 767px) 50vw, 0vw"
                     className="aspect-[1.07] object-contain w-full rounded-[29px]"
                     alt="Party rentals"
                   />
                </div>
                <div className="col-span-1">
                  <img
                     src="https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/1720e0eb2ee646560ca94c4f75555c8209cc5d28?placeholderIfAbsent=true"
                     loading="lazy"
                     sizes="(max-width: 767px) 50vw, 0vw"
                     className="aspect-[1.35] object-contain w-full rounded-[29px]"
                     alt="Event decor"
                   />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StaffRentalsSection;
