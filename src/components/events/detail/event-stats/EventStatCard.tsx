


interface EventStatCardProps {
  label: string;
  value: string | number;
  valueClassName?: string;
}

const EventStatCard = ({
  label, 
  value,
  valueClassName = "font-medium"
}: EventStatCardProps) => {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-600 text-sm">{label}:</span>
      <span className={`${valueClassName} text-sm truncate max-w-[70%] text-right`}>{value}</span>
    </div>
  );
};

export default EventStatCard;
