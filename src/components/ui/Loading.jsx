import { cn } from "@/utils/cn";

const Loading = ({ className, ...props }) => {
  return (
    <div className={cn("min-h-[400px] flex items-center justify-center", className)} {...props}>
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 animate-pulse">
          <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-secondary-100 to-secondary-200 rounded animate-pulse w-32 mx-auto" />
          <div className="h-3 bg-gradient-to-r from-secondary-100 to-secondary-200 rounded animate-pulse w-24 mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default Loading;