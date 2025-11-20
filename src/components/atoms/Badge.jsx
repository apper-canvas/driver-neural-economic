import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ 
  variant = "default",
  children,
  className,
  ...props 
}, ref) => {
  const variants = {
    default: "bg-secondary-100 text-secondary-700 border border-secondary-200",
    new: "bg-blue-100 text-blue-700 border border-blue-200",
    contacted: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    qualified: "bg-green-100 text-green-700 border border-green-200",
    lost: "bg-red-100 text-red-700 border border-red-200",
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-200",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;