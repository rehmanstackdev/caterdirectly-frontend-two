
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  image: string;
  title: string;
  description: string;
  className?: string;
}

const ServiceCard = ({
  image,
  title,
  description,
  className,
}: ServiceCardProps) => (
  <div className={cn("flex flex-col h-full", className)}>
    <img
      src={image}
      alt={`${title} services near you - Cater Directly`}
      loading="lazy"
      decoding="async"
      className="w-full aspect-[1.2] object-cover rounded-[25px] shadow-md"
    />
    <h3 className="mt-3 text-base sm:text-lg font-semibold text-foreground">{title}</h3>
    <p className="mt-1 text-sm sm:text-[0.95rem] leading-7 text-muted-foreground">{description}</p>
  </div>
);

const ServicesSection = () => {
  const services = [
    {
      image: "https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/d7f43b7fd8d29641c759b164357b99e8301ea398?placeholderIfAbsent=true",
      title: "Catering",
      description: "Compare local caterers near you and get instant quotes",
    },
    {
      image: "https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/dcdcfb2ec08de76b25f9db7c65bec5c0c5117c05?placeholderIfAbsent=true",
      title: "Venues",
      description: "Discover venues nearby and check real-time availability",
    },
    {
      image: "https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/63a89b9627056bb55405191dac9182b900c42abf?placeholderIfAbsent=true",
      title: "Staffing",
      description: "Hire local bartenders, servers, and event staff",
    },
    {
      image: "https://cdn.builder.io/api/v1/image/assets/7ff21a8cccf24278b644e190037ac504/0133630b2bc74cd130141c9e9a21683df2d12b2b?placeholderIfAbsent=true",
      title: "Event Supplies",
      description: "Rent tents, tables, chairs, AV, and party rentals",
    },
  ];

  return (
    <section id="services" className="w-full max-w-full overflow-hidden py-16 px-4 mt-8 md:mt-16">
      <div className="max-w-[1800px] mx-auto">
        <div className="text-center">
          <span className="text-[#F07712] text-sm font-medium uppercase tracking-wider">
            Our Services
          </span>
          <h2 className="text-3xl font-bold mt-2 text-gray-900">
            Top Categories
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
