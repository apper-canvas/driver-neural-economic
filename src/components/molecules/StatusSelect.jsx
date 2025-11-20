import { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import { cn } from "@/utils/cn";

const StatusSelect = ({ value, onChange, options, className, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value) || options[0];

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} {...props}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 text-left focus:outline-none"
      >
        <Badge variant={selectedOption.variant}>
          {selectedOption.label}
        </Badge>
        <ApperIcon name="ChevronDown" size={14} className="text-secondary-400" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-1 w-40 bg-white border border-secondary-200 rounded-lg shadow-lg py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option)}
                className="block w-full text-left px-3 py-2 hover:bg-secondary-50 transition-colors duration-150"
              >
                <Badge variant={option.variant}>
                  {option.label}
                </Badge>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StatusSelect;