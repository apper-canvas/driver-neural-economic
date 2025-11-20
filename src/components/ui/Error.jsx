import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Error = ({ message = "Something went wrong", onRetry, className, ...props }) => {
  return (
    <div className={cn("min-h-[400px] flex items-center justify-center p-8", className)} {...props}>
      <div className="text-center max-w-md space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
          <ApperIcon name="AlertCircle" size={32} className="text-red-500" />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-secondary-600 bg-gradient-to-r from-secondary-600 to-secondary-700 bg-clip-text">
            Oops! Something went wrong
          </h3>
          <p className="text-secondary-500 leading-relaxed">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ApperIcon name="RefreshCw" size={16} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default Error;