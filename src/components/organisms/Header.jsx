import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const Header = ({ 
  title, 
  onAddClick, 
  addButtonLabel = "Add", 
  addButtonIcon = "Plus",
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
            {title}
          </h1>
        </div>
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
    </header>
  );
};

export default Header;