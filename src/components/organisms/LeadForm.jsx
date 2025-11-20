import { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Modal from "@/components/molecules/Modal";
import { contactService } from "@/services/api/contactService";

const leadSources = [
  "Website", "Referral", "Cold Call", "Social Media", 
  "LinkedIn", "Event", "Advertisement", "Partner", "Other"
];

const leadStatuses = [
  "New", "Contacted", "Qualified", "Unqualified", "Lost"
];

const priorities = ["High", "Medium", "Low"];

const industries = [
  "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
  "Retail", "Construction", "Real Estate", "Consulting", "Other"
];

const companySizes = [
  "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"
];

const mockUsers = [
  { id: "user1", name: "John Smith" },
  { id: "user2", name: "Sarah Johnson" },
  { id: "user3", name: "Mike Davis" },
  { id: "user4", name: "Emily Brown" }
];
const LeadForm = ({ isOpen, onClose, onSubmit, lead = null }) => {
const [formData, setFormData] = useState({
    leadName: lead?.leadName || "",
    companyName: lead?.companyName || "",
    jobTitle: lead?.jobTitle || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    leadSource: lead?.leadSource || "Website",
    leadStatus: lead?.leadStatus || "New",
    leadScore: lead?.leadScore || 0,
    priority: lead?.priority || "Medium",
    industry: lead?.industry || "",
    companySize: lead?.companySize || "",
    expectedDealValue: lead?.expectedDealValue || "",
    expectedCloseDate: lead?.expectedCloseDate || "",
    assignedTo: lead?.assignedTo || "",
    notes: lead?.notes || "",
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
const [contacts, setContacts] = useState([]);
  
  useEffect(() => {
    if (lead) {
      setFormData({
        leadName: lead.leadName || "",
        companyName: lead.companyName || "",
        jobTitle: lead.jobTitle || "",
        email: lead.email || "",
        phone: lead.phone || "",
        leadSource: lead.leadSource || "Website",
        leadStatus: lead.leadStatus || "New",
        leadScore: lead.leadScore || 0,
        priority: lead.priority || "Medium",
        industry: lead.industry || "",
        companySize: lead.companySize || "",
        expectedDealValue: lead.expectedDealValue || "",
        expectedCloseDate: lead.expectedCloseDate || "",
        assignedTo: lead.assignedTo || "",
        notes: lead.notes || "",
      });
    }
  }, [lead]);

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
    
    if (!formData.leadName.trim()) {
      newErrors.leadName = "Lead name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
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
      setFormData({ 
        leadName: "",
        companyName: "",
        jobTitle: "",
        email: "",
        phone: "",
        leadSource: "Website",
        leadStatus: "New",
        leadScore: 0,
        priority: "Medium",
        industry: "",
        companySize: "",
        expectedDealValue: "",
        expectedCloseDate: "",
        assignedTo: "",
        notes: "",
      });
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
<form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Lead Name *"
            value={formData.leadName}
            onChange={(e) => handleChange("leadName", e.target.value)}
            error={errors.leadName}
            placeholder="Enter lead name"
          />
          
          <Input
            label="Company Name"
            value={formData.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            placeholder="Enter company name"
          />
          
          <Input
            label="Job Title"
            value={formData.jobTitle}
            onChange={(e) => handleChange("jobTitle", e.target.value)}
            placeholder="Enter job title"
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
            label="Phone *"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            error={errors.phone}
            placeholder="Enter phone number"
          />
          
          <Select
            label="Lead Source"
            value={formData.leadSource}
            onChange={(e) => handleChange("leadSource", e.target.value)}
          >
            {leadSources.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </Select>
          
          <Select
            label="Lead Status"
            value={formData.leadStatus}
            onChange={(e) => handleChange("leadStatus", e.target.value)}
          >
            {leadStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Select>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary-600">
              Lead Score (0-100)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.leadScore}
                onChange={(e) => handleChange("leadScore", e.target.value)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-secondary-900 min-w-[3rem]">
                {formData.leadScore}
              </span>
            </div>
          </div>
          
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </Select>
          
          <Select
            label="Industry"
            value={formData.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
          >
            <option value="">Select Industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </Select>
          
          <Select
            label="Company Size"
            value={formData.companySize}
            onChange={(e) => handleChange("companySize", e.target.value)}
          >
            <option value="">Select Company Size</option>
            {companySizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </Select>
          
          <Input
            label="Expected Deal Value"
            type="number"
            value={formData.expectedDealValue}
            onChange={(e) => handleChange("expectedDealValue", e.target.value)}
            placeholder="Enter expected value"
          />
          
          <Input
            label="Expected Close Date"
            type="date"
            value={formData.expectedCloseDate}
            onChange={(e) => handleChange("expectedCloseDate", e.target.value)}
          />
          
          <Select
            label="Assigned To"
            value={formData.assignedTo}
            onChange={(e) => handleChange("assignedTo", e.target.value)}
          >
            <option value="">Select User</option>
            {mockUsers.map((user) => (
              <option key={user.id} value={user.name}>{user.name}</option>
            ))}
          </Select>
        </div>
        
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
        
        <div className="flex gap-3 pt-4 border-t">
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