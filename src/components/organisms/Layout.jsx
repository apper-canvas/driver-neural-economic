import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/organisms/Sidebar";
import ApperIcon from "@/components/ApperIcon";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-secondary-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-secondary-600 hover:text-secondary-900 transition-colors duration-200"
          >
            <ApperIcon name="Menu" size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-md flex items-center justify-center">
              <ApperIcon name="Building" size={14} className="text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              CRM Pro
            </h1>
          </div>
          <div className="w-6" />
        </div>
        
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;