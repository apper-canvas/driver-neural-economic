import { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import StatusSelect from "@/components/molecules/StatusSelect";
import Badge from "@/components/atoms/Badge";
import { format } from "date-fns";

const LeadTable = ({ 
  leads, 
  onEdit, 
  onDelete, 
  onStatusChange,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const statusOptions = [
    { value: "new", label: "New", variant: "new" },
    { value: "contacted", label: "Contacted", variant: "contacted" },
    { value: "qualified", label: "Qualified", variant: "qualified" },
    { value: "lost", label: "Lost", variant: "lost" },
  ];

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === "createdAt") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "createdAt" ? "desc" : "asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "ArrowUpDown";
    return sortDirection === "asc" ? "ArrowUp" : "ArrowDown";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200">
        <div className="animate-pulse p-6">
          <div className="h-10 bg-secondary-100 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-secondary-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
      <div className="p-6 border-b border-secondary-200 space-y-4">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Search leads by name, email, or company..."
          className="max-w-md"
        />
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-secondary-600">Filter by status:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                statusFilter === "all"
                  ? "bg-primary-100 text-primary-700"
                  : "text-secondary-600 hover:bg-secondary-100"
              }`}
            >
              All
            </button>
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  statusFilter === status.value
                    ? "bg-primary-100 text-primary-700"
                    : "text-secondary-600 hover:bg-secondary-100"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50 border-b border-secondary-200">
            <tr>
              {[
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "company", label: "Company" },
                { key: "status", label: "Status" },
                { key: "createdAt", label: "Added" },
              ].map((column) => (
                <th key={column.key} className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center gap-2 text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors duration-200"
                  >
                    {column.label}
                    <ApperIcon name={getSortIcon(column.key)} size={14} />
                  </button>
                </th>
              ))}
              <th className="px-6 py-4 text-right text-sm font-medium text-secondary-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200">
            {sortedLeads.map((lead, index) => (
              <tr 
                key={lead.Id}
                className={`hover:bg-secondary-50 transition-colors duration-150 ${
                  index % 2 === 0 ? "bg-white" : "bg-secondary-25"
                }`}
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-secondary-900">
                    {lead.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-secondary-600">
                    {lead.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-secondary-600">
                    {lead.company || "-"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusSelect
                    value={lead.status}
                    onChange={(newStatus) => onStatusChange(lead.Id, newStatus)}
                    options={statusOptions}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-secondary-600 text-sm">
                    {format(new Date(lead.createdAt), "MMM dd, yyyy")}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Edit"
                      onClick={() => onEdit(lead)}
                      className="text-secondary-600 hover:text-primary-600"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Trash2"
                      onClick={() => onDelete(lead)}
                      className="text-secondary-600 hover:text-red-600"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedLeads.length === 0 && (
        <div className="text-center py-12">
          <div className="text-secondary-400 mb-2">
            <ApperIcon name="Search" size={24} className="mx-auto mb-2" />
          </div>
          <p className="text-secondary-600">
            {searchTerm || statusFilter !== "all" 
              ? "No leads found matching your filters." 
              : "No leads to display."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default LeadTable;