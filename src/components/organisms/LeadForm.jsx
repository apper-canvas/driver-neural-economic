import { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Modal from "@/components/molecules/Modal";
import { contactService } from "@/services/api/contactService";

const LeadForm = ({ isOpen, onClose, onSubmit, lead = null }) => {
  const [formData, setFormData] = useState({
    name: lead?.name || "",
    email: lead?.email || "",
    company: lead?.company || "",
    status: lead?.status || "new",
    notes: lead?.notes || "",
    contactId: lead?.contactId || "",
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadContacts();
    }
  }, [isOpen]);

  const loadContacts = async () => {
    try {
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await onSubmit(formData);
      setFormData({ name: "", email: "", company: "", status: "new", notes: "", contactId: "" });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={lead ? "Edit Lead" : "Add New Lead"}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name *"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          placeholder="Enter lead name"
        />
        
        <Input
          label="Email *"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
          placeholder="Enter email address"
        />
        
        <Input
          label="Company"
          value={formData.company}
          onChange={(e) => handleChange("company", e.target.value)}
          error={errors.company}
          placeholder="Enter company name"
        />

        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="lost">Lost</option>
        </Select>

        <Select
          label="Associated Contact"
          value={formData.contactId}
          onChange={(e) => handleChange("contactId", e.target.value)}
        >
          <option value="">Select a contact (optional)</option>
          {contacts.map((contact) => (
            <option key={contact.Id} value={contact.Id}>
              {contact.name} - {contact.email}
            </option>
          ))}
        </Select>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-600">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Add any notes about this lead..."
            rows="3"
            className="block w-full px-4 py-3 text-secondary-900 bg-white border border-secondary-300 rounded-lg placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >
            {lead ? "Update Lead" : "Add Lead"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LeadForm;