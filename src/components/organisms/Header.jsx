import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const Header = ({ 
  title, 
  count,
  onAddClick, 
  addButtonLabel = "Add", 
  addButtonIcon = "Plus",
  children,
  className,
  ...props 
}) => {
  return (
<header 
      className={cn(
        "bg-white border-b border-secondary-200 px-6 py-4 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary-700 to-secondary-900 bg-clip-text text-transparent">
            {title}{count !== undefined && ` (${count})`}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {children}
          {onAddClick && (
            <Button 
              onClick={onAddClick}
              icon={addButtonIcon}
              className="shadow-lg"
            >
              {addButtonLabel}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;