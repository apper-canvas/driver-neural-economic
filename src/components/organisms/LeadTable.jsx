import React, { useState } from "react";
import { differenceInDays, format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const leadSources = [
  "Website", "Referral", "Cold Call", "Social Media", 
  "LinkedIn", "Event", "Advertisement", "Partner", "Other"
];

const leadStatuses = [
  "New", "Contacted", "Qualified", "Unqualified", "Lost"
];

const priorities = ["High", "Medium", "Low"];

const mockUsers = [
  "John Smith", "Sarah Johnson", "Mike Davis", "Emily Brown"
];

const getStatusColor = (status) => {
  const colors = {
    "New": "bg-blue-100 text-blue-800",
    "Contacted": "bg-yellow-100 text-yellow-800",
    "Qualified": "bg-green-100 text-green-800",
    "Unqualified": "bg-gray-100 text-gray-800",
    "Lost": "bg-red-100 text-red-800"
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const getPriorityColor = (priority) => {
  const colors = {
    "High": "bg-red-500",
    "Medium": "bg-yellow-500",
    "Low": "bg-green-500"
  };
  return colors[priority] || "bg-gray-500";
};

const getScoreColor = (score) => {
  if (score <= 30) return "bg-red-500";
  if (score <= 60) return "bg-yellow-500";
  return "bg-green-500";
};

const getScoreLabel = (score) => {
  if (score <= 30) return "Cold";
  if (score <= 60) return "Warm";
  return "Hot";
};
const LeadTable = ({ 
leads, 
  onEdit, 
  onDelete, 
  onConvert,
  loading = false 
}) => {
const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [scoreRange, setScoreRange] = useState([0, 100]);
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
      (lead.leadName && lead.leadName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.companyName && lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || lead.leadStatus === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.leadSource === sourceFilter;
    const matchesPriority = priorityFilter === "all" || lead.priority === priorityFilter;
    const matchesAssigned = assignedFilter === "all" || lead.assignedTo === assignedFilter;
    const matchesScore = lead.leadScore >= scoreRange[0] && lead.leadScore <= scoreRange[1];
    
    return matchesSearch && matchesStatus && matchesSource && matchesPriority && matchesAssigned && matchesScore;
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
    <div className="bg-white rounded-xl shadow-sm border border-secondary-200">
      <div className="p-6 border-b border-secondary-200 space-y-4">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Search leads by name, email, or company..."
          className="max-w-md"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-600 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              {leadStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-600 mb-2">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Sources</option>
              {leadSources.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-600 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Priorities</option>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-600 mb-2">Assigned To</label>
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Users</option>
              {mockUsers.map((user) => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-600 mb-2">
              Score Range: {scoreRange[0]} - {scoreRange[1]}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={scoreRange[0]}
                onChange={(e) => setScoreRange([parseInt(e.target.value), scoreRange[1]])}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={scoreRange[1]}
                onChange={(e) => setScoreRange([scoreRange[0], parseInt(e.target.value)])}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

<div className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : sortedLeads.length === 0 ? (
          <div className="text-center py-12">
            <ApperIcon name="Users" size={48} className="mx-auto text-secondary-400 mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No leads found</h3>
            <p className="text-secondary-500">Try adjusting your filters or add a new lead.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedLeads.map((lead) => (
              <div
                key={lead.Id}
                className="bg-white border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                      {lead.leadName}
                    </h3>
                    <p className="text-secondary-600 text-sm">{lead.companyName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-3 h-3 rounded-full ${getPriorityColor(lead.priority)}`}
                      title={`${lead.priority} Priority`}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-secondary-600">
                    <ApperIcon name="Mail" size={14} />
                    <span>{lead.email}</span>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-sm text-secondary-600">
                      <ApperIcon name="Phone" size={14} />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mb-4">
                  <Badge className={`${getStatusColor(lead.leadStatus)} text-xs`}>
                    {lead.leadStatus}
                  </Badge>
                  <Badge className="bg-secondary-100 text-secondary-800 text-xs">
                    {lead.leadSource}
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-secondary-600">Lead Score</span>
                    <span className="text-sm font-semibold text-secondary-900">
                      {lead.leadScore}/100 ({getScoreLabel(lead.leadScore)})
                    </span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreColor(lead.leadScore)}`}
                      style={{ width: `${lead.leadScore}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-secondary-600 mb-4">
                  {lead.expectedDealValue > 0 && (
                    <div>
                      <span className="font-medium">Expected Value:</span>
                      <p>${lead.expectedDealValue.toLocaleString()}</p>
                    </div>
                  )}
                  {lead.assignedTo && (
                    <div>
                      <span className="font-medium">Assigned To:</span>
                      <p>{lead.assignedTo}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Days Since Created:</span>
                    <p>{differenceInDays(new Date(), new Date(lead.createdAt))} days</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-secondary-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Edit"
                    onClick={() => onEdit(lead)}
                    className="flex-1 text-secondary-600 hover:text-primary-600"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Trash2"
                    onClick={() => onDelete(lead)}
                    className="text-secondary-600 hover:text-red-600"
                  >
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="ArrowRight"
                    onClick={() => onConvert(lead)}
                    className="flex-1 text-secondary-600 hover:text-green-600"
                  >
                    Convert
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadTable;