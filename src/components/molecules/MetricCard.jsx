import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  trend,
  className,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "bg-white p-6 rounded-xl border border-secondary-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            {value}
          </p>
          {trend && (
            <p className={cn(
              "text-sm font-medium flex items-center gap-1",
              trend.type === "increase" ? "text-green-600" : "text-red-600"
            )}>
              <ApperIcon 
                name={trend.type === "increase" ? "TrendingUp" : "TrendingDown"} 
                size={14} 
              />
              {trend.value}
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
          <ApperIcon name={icon} size={24} className="text-primary-600" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;