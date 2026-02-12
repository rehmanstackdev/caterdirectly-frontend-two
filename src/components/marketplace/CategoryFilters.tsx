
import { LucideIcon } from "lucide-react";
import { services } from "@/pages/marketplace-data";

interface CategoryItemProps {
  icon: LucideIcon;
  label: string;
  color: string;
  isActive?: boolean;
  onClick: () => void;
}

const CategoryItem = ({ icon: Icon, label, color, isActive, onClick }: CategoryItemProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all w-[120px] ${
      isActive 
        ? `${color} text-white shadow-md` 
        : "bg-white text-gray-700 hover:shadow-md border border-gray-100"
    }`}
  >
    <div className={`p-3 rounded-full ${isActive ? 'bg-white/20' : `${color} bg-opacity-10`}`}>
      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : color.replace('bg-', 'text-')}`} />
    </div>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export const CategoryFilters = () => {
  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
      {services.map((service) => (
        <CategoryItem
          key={service.id}
          icon={service.icon}
          label={service.title}
          color={service.color}
          onClick={() => console.log(`Selected ${service.title}`)}
        />
      ))}
    </div>
  );
};
