import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({ 
  variant = "primary", 
  size = "md", 
  children, 
  className, 
  disabled,
  loading,
  icon,
  ...props 
}, ref) => {
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl",
    secondary: "bg-white text-secondary-600 border border-secondary-300 hover:bg-secondary-50 hover:border-secondary-400 shadow-sm hover:shadow-md",
    outline: "border-2 border-primary-500 text-primary-600 hover:bg-primary-50 hover:border-primary-600",
    ghost: "text-secondary-600 hover:bg-secondary-100 hover:text-secondary-700",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm font-medium",
    md: "px-4 py-2 text-sm font-medium",
    lg: "px-6 py-3 text-base font-medium",
    xl: "px-8 py-4 text-lg font-semibold",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <ApperIcon name="Loader2" size={16} className="animate-spin" />
      ) : icon ? (
        <ApperIcon name={icon} size={16} />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;