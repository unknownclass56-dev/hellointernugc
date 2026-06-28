import logo from "@/assets/techlaunchpad-logo.png";

interface LogoLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LogoLoader({ className = "", size = "md" }: LogoLoaderProps) {
  const containerSizes = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-40 h-40",
  };

  const ringSizes = {
    sm: "border-2 w-12 h-12",
    md: "border-4 w-24 h-24",
    lg: "border-[6px] w-40 h-40",
  };

  const logoSizes = {
    sm: "size-7",
    md: "size-14",
    lg: "size-24",
  };

  return (
    <div className={`relative flex items-center justify-center ${containerSizes[size]} ${className} rounded-full overflow-hidden bg-white`}>
      {/* Outer spinning premium loading ring */}
      <div 
        className={`absolute rounded-full border-t-gold border-r-transparent border-b-navy border-l-transparent animate-spin ${ringSizes[size]}`} 
        style={{ animationDuration: '0.8s' }} 
      />
      {/* Inner glowing pulse ring */}
      <div className={`absolute rounded-full border border-gold/20 animate-ping opacity-75 ${ringSizes[size]}`} style={{ animationDuration: '2s' }} />
      
      {/* Company logo at the center */}
      <img
        src={logo}
        alt="Loading..."
        className={`rounded-full bg-white p-1 object-contain shadow-md relative z-10 ${logoSizes[size]}`}
      />
    </div>
  );
}
