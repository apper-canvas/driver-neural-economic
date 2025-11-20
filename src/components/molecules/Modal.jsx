import { useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className,
  ...props 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />
        
        <div 
          className={cn(
            "relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all w-full max-w-lg",
            className
          )}
          {...props}
        >
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-secondary-900">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-secondary-400 hover:text-secondary-600 transition-colors duration-200"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;