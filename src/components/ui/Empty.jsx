import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Empty = ({ 
  icon = "Package",
  title = "No items found", 
  description = "Get started by adding your first item.", 
  actionLabel = "Add Item",
  onAction,
  className,
  ...props 
}) => {
  return (
    <div className={cn("min-h-[400px] flex items-center justify-center p-8", className)} {...props}>
      <div className="text-center max-w-md space-y-6">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-secondary-50 to-secondary-100 border border-secondary-200">
          <ApperIcon name={icon} size={36} className="text-secondary-400" />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-secondary-600 to-secondary-700 bg-clip-text text-transparent">
            {title}
          </h3>
          <p className="text-secondary-500 leading-relaxed">{description}</p>
        </div>
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ApperIcon name="Plus" size={16} />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default Empty;