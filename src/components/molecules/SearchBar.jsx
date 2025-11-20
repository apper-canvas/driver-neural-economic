import { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const SearchBar = ({ onSearch, placeholder = "Search...", className, ...props }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className={cn("relative", className)} {...props}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <ApperIcon name="Search" size={20} className="text-secondary-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-3 text-secondary-900 bg-white border border-secondary-300 rounded-lg placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
      />
      {searchTerm && (
        <button
          onClick={clearSearch}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600 transition-colors duration-200"
        >
          <ApperIcon name="X" size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;