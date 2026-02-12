
interface AlertTriangleIconProps {
  className?: string;
}

const AlertTriangleIcon = ({ className }: AlertTriangleIconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 20 20" 
    fill="none" 
    className={className}
  >
    <path 
      d="M9.47618 3.75L2.85785 15.75H16.0945L9.47618 3.75ZM9.47618 6.825L13.3528 14.25H5.59951L9.47618 6.825Z" 
      fill="currentColor" 
    />
    <path 
      d="M9.47617 12.5C9.74231 12.5 9.97617 12.2761 9.97617 12V10C9.97617 9.72386 9.74231 9.5 9.47617 9.5C9.21003 9.5 8.97617 9.72386 8.97617 10V12C8.97617 12.2761 9.21003 12.5 9.47617 12.5Z" 
      fill="currentColor" 
    />
    <circle cx="9.47617" cy="13.75" r="0.75" fill="currentColor" />
  </svg>
);

export default AlertTriangleIcon;
