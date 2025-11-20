import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import ContactTable from "@/components/organisms/ContactTable";
import ContactForm from "@/components/organisms/ContactForm";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // View and Filter State
  const [currentView, setCurrentView] = useState("grid"); // grid, list, table
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    source: "all",
    assignedTo: "all",
    tags: [],
    company: "all",
    dateFrom: "",
    dateTo: ""
  });

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
      console.error("Error loading contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // Filter contacts based on current filters
  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.name || '';
    const company = contact.companyName || contact.company || '';
    
    // Search filter
    if (filters.search && !fullName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !contact.email.toLowerCase().includes(filters.search.toLowerCase()) &&
        !company.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (filters.status !== "all" && contact.status !== filters.status) {
      return false;
    }
    
    // Source filter
    if (filters.source !== "all" && contact.source !== filters.source) {
      return false;
    }
    
    // Assigned To filter
    if (filters.assignedTo !== "all" && contact.assignedTo !== filters.assignedTo) {
      return false;
    }
    
    // Company filter
    if (filters.company !== "all" && company !== filters.company) {
      return false;
    }
    
    // Date range filter
    if (filters.dateFrom && new Date(contact.createdAt) < new Date(filters.dateFrom)) {
      return false;
    }
    if (filters.dateTo && new Date(contact.createdAt) > new Date(filters.dateTo)) {
      return false;
    }
    
    // Tags filter
    if (filters.tags.length > 0) {
      const contactTags = contact.tags || [];
      if (!filters.tags.some(tag => contactTags.includes(tag))) {
        return false;
      }
    }
    
    return true;
  });

  // Get unique values for filter dropdowns
  const uniqueValues = {
    sources: [...new Set(contacts.map(c => c.source).filter(Boolean))],
    assignees: [...new Set(contacts.map(c => c.assignedTo).filter(Boolean))],
    companies: [...new Set(contacts.map(c => c.companyName || c.company).filter(Boolean))],
    tags: [...new Set(contacts.flatMap(c => c.tags || []))]
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setIsFormOpen(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleDeleteContact = (contact) => {
    setDeleteConfirm(contact);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await contactService.delete(deleteConfirm.Id);
      setContacts(prev => prev.filter(c => c.Id !== deleteConfirm.Id));
      toast.success("Contact deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete contact. Please try again.");
      console.error("Error deleting contact:", err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleSubmitContact = async (formData) => {
    try {
      if (editingContact) {
        const updatedContact = await contactService.update(editingContact.Id, formData);
        setContacts(prev => prev.map(c => c.Id === updatedContact.Id ? updatedContact : c));
        toast.success("Contact updated successfully!");
      } else {
        const newContact = await contactService.create(formData);
        setContacts(prev => [...prev, newContact]);
        toast.success("Contact created successfully!");
      }
      
      setEditingContact(null);
      setIsFormOpen(false);
    } catch (err) {
      if (err.message && err.message.includes("email already exists")) {
        toast.error("Contact with this email already exists. Please check existing contacts.");
      } else {
        toast.error("Failed to save contact. Please try again.");
      }
      console.error("Error saving contact:", err);
      throw err;
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      status: "all",
      source: "all",
      assignedTo: "all",
      tags: [],
      company: "all",
      dateFrom: "",
      dateTo: ""
    });
  };

  const handleEmailContact = (contact) => {
    window.location.href = `mailto:${contact.email}`;
  };

  const handleCallContact = (contact) => {
    window.location.href = `tel:${contact.phone}`;
  };

  const getContactInitials = (contact) => {
    const firstName = contact.firstName || '';
    const lastName = contact.lastName || '';
    const name = contact.name || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (name) {
      const parts = name.split(' ');
      return parts.length > 1 
        ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
        : parts[0].charAt(0).toUpperCase();
    }
    return 'NA';
  };

  const getContactName = (contact) => {
    if (contact.firstName && contact.lastName) {
      return `${contact.firstName} ${contact.lastName}`;
    }
    return contact.name || 'No Name';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'lead':
        return 'bg-blue-100 text-blue-800';
      case 'prospect':
        return 'bg-yellow-100 text-yellow-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      case 'former customer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadContacts} />;
  }

  if (contacts.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="bg-white border-b border-secondary-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary-700 to-secondary-900 bg-clip-text text-transparent">
              Contacts (0)
            </h1>
            <Button onClick={handleAddContact} icon="UserPlus" className="shadow-lg">
              New Contact
            </Button>
          </div>
        </div>
        <div className="p-6">
          <Empty
            icon="Users"
            title="No contacts found"
            description="Start building your contact list by adding your first contact."
            actionLabel="Add Contact"
            onAction={handleAddContact}
          />
        </div>
        
        <ContactForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmitContact}
          contact={editingContact}
        />
      </div>
    );
  }

  const ContactCard = ({ contact }) => (
    <div className="bg-white rounded-xl border border-secondary-200 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      {/* Contact Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {getContactInitials(contact)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 hover:text-primary-600 cursor-pointer">
              {getContactName(contact)}
            </h3>
            {contact.jobTitle && (
              <p className="text-sm text-secondary-600">{contact.jobTitle}</p>
            )}
          </div>
        </div>
        <Badge className={cn("text-xs", getStatusColor(contact.status))}>
          {contact.status}
        </Badge>
      </div>

      {/* Company */}
      {(contact.companyName || contact.company) && (
        <div className="mb-4">
          <p className="text-secondary-700 font-medium hover:text-primary-600 cursor-pointer">
            {contact.companyName || contact.company}
          </p>
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-secondary-600">
          <ApperIcon name="Mail" size={16} />
          <a 
            href={`mailto:${contact.email}`} 
            className="hover:text-primary-600 cursor-pointer"
          >
            {contact.email}
          </a>
        </div>
        {contact.phone && (
          <div className="flex items-center space-x-2 text-sm text-secondary-600">
            <ApperIcon name="Phone" size={16} />
            <a 
              href={`tel:${contact.phone}`} 
              className="hover:text-primary-600 cursor-pointer"
            >
              {contact.phone}
            </a>
          </div>
        )}
      </div>

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {contact.tags.slice(0, 3).map((tag, idx) => (
            <Badge key={idx} className="bg-secondary-100 text-secondary-700 text-xs">
              {tag}
            </Badge>
          ))}
          {contact.tags.length > 3 && (
            <Badge className="bg-secondary-100 text-secondary-600 text-xs">
              +{contact.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-secondary-100">
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon="Edit"
            onClick={() => handleEditContact(contact)}
            className="text-secondary-600 hover:text-primary-600"
          />
          <Button
            variant="ghost"
            size="sm"
            icon="Mail"
            onClick={() => handleEmailContact(contact)}
            className="text-secondary-600 hover:text-primary-600"
          />
          {contact.phone && (
            <Button
              variant="ghost"
              size="sm"
              icon="Phone"
              onClick={() => handleCallContact(contact)}
              className="text-secondary-600 hover:text-primary-600"
            />
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon="Trash2"
          onClick={() => handleDeleteContact(contact)}
          className="text-secondary-600 hover:text-red-600"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary-700 to-secondary-900 bg-clip-text text-transparent">
              Contacts ({filteredContacts.length})
            </h1>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-1 bg-secondary-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView("grid")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  currentView === "grid" 
                    ? "bg-white text-primary-600 shadow-sm" 
                    : "text-secondary-600 hover:text-secondary-900"
                )}
              >
                <ApperIcon name="Grid3X3" size={18} />
              </button>
              <button
                onClick={() => setCurrentView("list")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  currentView === "list" 
                    ? "bg-white text-primary-600 shadow-sm" 
                    : "text-secondary-600 hover:text-secondary-900"
                )}
              >
                <ApperIcon name="List" size={18} />
              </button>
              <button
                onClick={() => setCurrentView("table")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  currentView === "table" 
                    ? "bg-white text-primary-600 shadow-sm" 
                    : "text-secondary-600 hover:text-secondary-900"
                )}
              >
                <ApperIcon name="Table" size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="secondary" icon="Download" size="sm">
              Import
            </Button>
            <Button variant="secondary" icon="Upload" size="sm">
              Export
            </Button>
            <Button onClick={handleAddContact} icon="UserPlus" className="shadow-lg">
              New Contact
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Filters Sidebar */}
        <div className={cn(
          "bg-white border-r border-secondary-200 transition-all duration-300",
          sidebarCollapsed ? "w-0 overflow-hidden" : "w-80"
        )}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-secondary-900">Filters</h2>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 rounded hover:bg-secondary-100"
              >
                <ApperIcon name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"} size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Search Contacts
                </label>
                <SearchBar
                  onSearch={(value) => handleFilterChange("search", value)}
                  placeholder="Search by name, email, company..."
                  className="w-full"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full"
                >
                  <option value="all">All Statuses</option>
                  <option value="Lead">Lead</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Customer">Customer</option>
                  <option value="Former Customer">Former Customer</option>
                </Select>
              </div>

              {/* Source Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Source
                </label>
                <Select
                  value={filters.source}
                  onChange={(e) => handleFilterChange("source", e.target.value)}
                  className="w-full"
                >
                  <option value="all">All Sources</option>
                  {uniqueValues.sources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </Select>
              </div>

              {/* Assigned To Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Assigned To
                </label>
                <Select
                  value={filters.assignedTo}
                  onChange={(e) => handleFilterChange("assignedTo", e.target.value)}
                  className="w-full"
                >
                  <option value="all">All Assignees</option>
                  {uniqueValues.assignees.map(assignee => (
                    <option key={assignee} value={assignee}>{assignee}</option>
                  ))}
                </Select>
              </div>

              {/* Company Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Company
                </label>
                <Select
                  value={filters.company}
                  onChange={(e) => handleFilterChange("company", e.target.value)}
                  className="w-full"
                >
                  <option value="all">All Companies</option>
                  {uniqueValues.companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Date Added
                </label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                    placeholder="From date"
                  />
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                    placeholder="To date"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <Button 
                variant="secondary" 
                onClick={clearAllFilters}
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Collapse Sidebar Button (when collapsed) */}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="fixed left-4 top-1/2 z-10 p-2 bg-white border border-secondary-200 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <ApperIcon name="ChevronRight" size={20} />
            </button>
          )}

          <div className="p-6">
            {/* Table View */}
            {currentView === "table" && (
              <ContactTable
                contacts={filteredContacts}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
              />
            )}

            {/* Grid/List View */}
            {(currentView === "grid" || currentView === "list") && (
              <div className={cn(
                "grid gap-6",
                currentView === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              )}>
                {filteredContacts.map(contact => (
                  <ContactCard key={contact.Id} contact={contact} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredContacts.length === 0 && (
              <div className="text-center py-12">
                <ApperIcon name="Search" size={48} className="mx-auto text-secondary-400 mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">
                  No contacts found
                </h3>
                <p className="text-secondary-600">
                  Try adjusting your filters or search criteria.
                </p>
                <Button 
                  variant="secondary" 
                  onClick={clearAllFilters}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <ContactForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitContact}
        contact={editingContact}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Contact"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Are you sure you want to delete <strong>{getContactName(deleteConfirm)}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              className="flex-1"
            >
              Delete Contact
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
};

export default Contacts;