import { useState } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Modal from "@/components/molecules/Modal";

const ContactForm = ({ isOpen, onClose, onSubmit, contact = null }) => {
  const [formData, setFormData] = useState({
    firstName: contact?.firstName || "",
    lastName: contact?.lastName || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    jobTitle: contact?.jobTitle || "",
    companyId: contact?.companyId || "",
    companyName: contact?.companyName || "",
    source: contact?.source || "Website",
    status: contact?.status || "Lead",
    address: contact?.address || {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "US"
    },
    socialLinks: contact?.socialLinks || {
      linkedin: "",
      twitter: "",
      facebook: ""
    },
    tags: contact?.tags || [],
    assignedTo: contact?.assignedTo || "Current User",
    notes: contact?.notes || ""
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveAndAddAnother, setSaveAndAddAnother] = useState(false);
  const validateForm = () => {
const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
} else if (!/^[+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-()]/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e, addAnother = false) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setSaveAndAddAnother(addAnother);
    
    try {
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        jobTitle: "",
        companyId: "",
        companyName: "",
        source: "Website",
        status: "Lead",
        address: {
          street: "",
          city: "",
          state: "",
          zip: "",
          country: "US"
        },
        socialLinks: {
          linkedin: "",
          twitter: "",
          facebook: ""
        },
        tags: [],
        assignedTo: "Current User",
        notes: ""
      });
      setErrors({});
      
      if (!addAnother) {
        onClose();
      }
    } catch (error) {
      if (error.message && error.message.includes("email already exists")) {
        setErrors({ email: "Contact with this email already exists. Please check existing contacts." });
      }
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
      setSaveAndAddAnother(false);
    }
  };

const handleChange = (field, value) => {
    if (field.includes('.')) {
      // Handle nested objects like address.street or socialLinks.linkedin
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
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

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={contact ? "Edit Contact" : "New Contact"}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
{/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name *"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            error={errors.firstName}
            placeholder="Enter first name"
          />
          <Input
            label="Last Name *"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            error={errors.lastName}
            placeholder="Enter last name"
          />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4">
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
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            error={errors.phone}
            placeholder="Enter phone number"
          />
        </div>

        {/* Professional Info */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Job Title"
            value={formData.jobTitle}
            onChange={(e) => handleChange("jobTitle", e.target.value)}
            placeholder="Enter job title"
          />
          <Input
            label="Company"
            value={formData.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            placeholder="Enter company name"
          />
        </div>

        {/* Source and Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Contact Source</label>
            <select
              value={formData.source}
              onChange={(e) => handleChange("source", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Event">Event</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Contact Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="Lead">Lead</option>
              <option value="Prospect">Prospect</option>
              <option value="Customer">Customer</option>
              <option value="Former Customer">Former Customer</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Address</h3>
          <Input
            label="Street"
            value={formData.address.street}
            onChange={(e) => handleChange("address.street", e.target.value)}
            placeholder="Enter street address"
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="City"
              value={formData.address.city}
              onChange={(e) => handleChange("address.city", e.target.value)}
              placeholder="Enter city"
            />
            <Input
              label="State"
              value={formData.address.state}
              onChange={(e) => handleChange("address.state", e.target.value)}
              placeholder="Enter state"
            />
            <Input
              label="ZIP"
              value={formData.address.zip}
              onChange={(e) => handleChange("address.zip", e.target.value)}
              placeholder="Enter ZIP code"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Social Links</h3>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="LinkedIn"
              value={formData.socialLinks.linkedin}
              onChange={(e) => handleChange("socialLinks.linkedin", e.target.value)}
              placeholder="LinkedIn profile URL"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Twitter"
                value={formData.socialLinks.twitter}
                onChange={(e) => handleChange("socialLinks.twitter", e.target.value)}
                placeholder="Twitter handle"
              />
              <Input
                label="Facebook"
                value={formData.socialLinks.facebook}
                onChange={(e) => handleChange("socialLinks.facebook", e.target.value)}
                placeholder="Facebook profile"
              />
            </div>
          </div>
        </div>

        {/* Tags and Assignment */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tags"
            value={formData.tags.join(", ")}
            onChange={(e) => handleChange("tags", e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag))}
            placeholder="Enter tags (comma separated)"
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Assigned To</label>
            <select
              value={formData.assignedTo}
              onChange={(e) => handleChange("assignedTo", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="Current User">Current User</option>
              <option value="Sales Team">Sales Team</option>
              <option value="Marketing Team">Marketing Team</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Add any additional notes about this contact"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
        </div>
        
        <div className="flex gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          {!contact && (
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => handleSubmit(e, true)}
              loading={loading && saveAndAddAnother}
              className="flex-1"
            >
              Save & Add Another
            </Button>
          )}
          <Button
            type="submit"
            loading={loading && !saveAndAddAnother}
            className="flex-1 bg-primary-500 hover:bg-primary-600"
          >
            {contact ? "Update Contact" : "Save Contact"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ContactForm;