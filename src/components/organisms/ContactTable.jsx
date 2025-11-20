import { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import { format } from "date-fns";

const ContactTable = ({ 
  contacts, 
  onEdit, 
  onDelete, 
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    
    if (sortDirection === "asc") {
      return aValue.toString().localeCompare(bValue.toString());
    } else {
      return bValue.toString().localeCompare(aValue.toString());
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
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
      <div className="p-6 border-b border-secondary-200">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Search contacts by name, email, or company..."
          className="max-w-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50 border-b border-secondary-200">
            <tr>
              {[
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Phone" },
                { key: "company", label: "Company" },
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
            {sortedContacts.map((contact, index) => (
              <tr 
                key={contact.Id}
                className={`hover:bg-secondary-50 transition-colors duration-150 ${
                  index % 2 === 0 ? "bg-white" : "bg-secondary-25"
                }`}
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-secondary-900">
                    {contact.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-secondary-600">
                    {contact.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-secondary-600">
                    {contact.phone || "-"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-secondary-600">
                    {contact.company || "-"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-secondary-600 text-sm">
                    {format(new Date(contact.createdAt), "MMM dd, yyyy")}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Edit"
                      onClick={() => onEdit(contact)}
                      className="text-secondary-600 hover:text-primary-600"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Trash2"
                      onClick={() => onDelete(contact)}
                      className="text-secondary-600 hover:text-red-600"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedContacts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-secondary-400 mb-2">
            <ApperIcon name="Search" size={24} className="mx-auto mb-2" />
          </div>
          <p className="text-secondary-600">
            {searchTerm ? "No contacts found matching your search." : "No contacts to display."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContactTable;