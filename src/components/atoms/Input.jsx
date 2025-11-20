import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Input = forwardRef(({ 
  type = "text",
  label,
  error,
  className,
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-secondary-600">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          "block w-full px-4 py-3 text-secondary-900 bg-white border border-secondary-300 rounded-lg placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;