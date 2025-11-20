import { useState } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Modal from "@/components/molecules/Modal";

const ContactForm = ({ isOpen, onClose, onSubmit, contact = null }) => {
  const [formData, setFormData] = useState({
    name: contact?.name || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    company: contact?.company || "",
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
      setFormData({ name: "", email: "", phone: "", company: "" });
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
      title={contact ? "Edit Contact" : "Add New Contact"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name *"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          placeholder="Enter full name"
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
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          error={errors.phone}
          placeholder="Enter phone number"
        />
        
        <Input
          label="Company"
          value={formData.company}
          onChange={(e) => handleChange("company", e.target.value)}
          error={errors.company}
          placeholder="Enter company name"
        />
        
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
            {contact ? "Update Contact" : "Add Contact"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ContactForm;