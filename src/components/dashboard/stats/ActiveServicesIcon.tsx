
interface ActiveServicesIconProps {
  className?: string;
}

const ActiveServicesIcon = ({ className }: ActiveServicesIconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 20 20" 
    fill="none" 
    className={className}
  >
    <path 
      d="M10 15V10M10 5V10M10 10H15M10 10H5" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
  </svg>
);

export default ActiveServicesIcon;
