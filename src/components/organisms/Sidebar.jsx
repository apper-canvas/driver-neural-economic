import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose, className, ...props }) => {
  const menuItems = [
    { 
      name: "Dashboard", 
      path: "/", 
      icon: "BarChart3" 
    },
    { 
      name: "Contacts", 
      path: "/contacts", 
      icon: "Users" 
    },
    { 
      name: "Leads", 
      path: "/leads", 
      icon: "TrendingUp" 
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-secondary-200 shadow-sm",
        className
      )} {...props}>
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-secondary-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="Building" size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                CRM Pro
              </h1>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-l-4 border-primary-600 shadow-sm"
                      : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                  )
                }
              >
                <ApperIcon 
                  name={item.icon} 
                  size={20} 
                  className={cn(
                    "mr-3 transition-colors duration-200",
                  )}
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className={cn("lg:hidden", isOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 z-40 flex">
          <div 
            className="fixed inset-0 bg-secondary-600 bg-opacity-75 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={onClose}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <ApperIcon name="X" size={24} className="text-white" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6 pb-4 border-b border-secondary-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Building" size={20} className="text-white" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                    CRM Pro
                  </h1>
                </div>
              </div>
              
              <nav className="mt-5 px-4 space-y-2">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-l-4 border-primary-600 shadow-sm"
                          : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                      )
                    }
                  >
                    <ApperIcon 
                      name={item.icon} 
                      size={20} 
                      className="mr-3"
                    />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;