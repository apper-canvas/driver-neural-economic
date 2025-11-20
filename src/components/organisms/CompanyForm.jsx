import { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Modal from '@/components/molecules/Modal';
import { cn } from '@/utils/cn';

const CompanyForm = ({ isOpen, onClose, onSubmit, company = null }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    industry: '',
    companySize: '',
    annualRevenue: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA'
    },
    description: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: ''
    },
    tags: '',
    assignedTo: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Industry options
  const industries = [
    'Technology',
    'Healthcare', 
    'Finance',
    'Retail',
    'Manufacturing',
    'Real Estate',
    'Education',
    'Other'
  ];

  // Company size options
  const companySizes = [
    '1-10',
    '11-50', 
    '51-200',
    '201-500',
    '500+',
    '1000+'
  ];

  // Reset form when modal opens/closes or company changes
  useEffect(() => {
    if (isOpen) {
      if (company) {
        setFormData({
          companyName: company.companyName || '',
          website: company.website || '',
          industry: company.industry || '',
          companySize: company.companySize || '',
          annualRevenue: company.annualRevenue ? company.annualRevenue.toString() : '',
          phone: company.phone || '',
          email: company.email || '',
          address: {
            street: company.address?.street || '',
            city: company.address?.city || '',
            state: company.address?.state || '',
            zip: company.address?.zip || '',
            country: company.address?.country || 'USA'
          },
          description: company.description || '',
          socialLinks: {
            linkedin: company.socialLinks?.linkedin || '',
            twitter: company.socialLinks?.twitter || '',
            facebook: company.socialLinks?.facebook || ''
          },
          tags: Array.isArray(company.tags) ? company.tags.join(', ') : (company.tags || ''),
          assignedTo: company.assignedTo || ''
        });
      } else {
        setFormData({
          companyName: '',
          website: '',
          industry: '',
          companySize: '',
          annualRevenue: '',
          phone: '',
          email: '',
          address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: 'USA'
          },
          description: '',
          socialLinks: {
            linkedin: '',
            twitter: '',
            facebook: ''
          },
          tags: '',
          assignedTo: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, company]);

  // Handle input changes
  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    // URL validation for website
    if (formData.website && formData.website.trim()) {
      const urlPattern = /^https?:\/\/[^\s$.?#].[^\s]*$/i;
      if (!urlPattern.test(formData.website.trim())) {
        newErrors.website = 'Please enter a valid URL (including http:// or https://)';
      }
    }

    // Email validation
    if (formData.email && formData.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // URL validation for social links
    const socialFields = ['linkedin', 'twitter', 'facebook'];
    socialFields.forEach(field => {
      const value = formData.socialLinks[field];
      if (value && value.trim()) {
        const urlPattern = /^https?:\/\/[^\s$.?#].[^\s]*$/i;
        if (!urlPattern.test(value.trim())) {
          newErrors[`socialLinks.${field}`] = 'Please enter a valid URL';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e, addAnother = false) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        annualRevenue: formData.annualRevenue ? parseFloat(formData.annualRevenue) : 0,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      };

      await onSubmit(submitData, addAnother);
      
      if (!addAnother) {
        onClose();
      } else {
        // Reset form for next entry
        setFormData({
          companyName: '',
          website: '',
          industry: '',
          companySize: '',
          annualRevenue: '',
          phone: '',
          email: '',
          address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: 'USA'
          },
          description: '',
          socialLinks: {
            linkedin: '',
            twitter: '',
            facebook: ''
          },
          tags: '',
          assignedTo: ''
        });
        setErrors({});
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={company ? "Edit Company" : "Add Company"}>
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Enter company name"
              error={errors.companyName}
              required
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Website
            </label>
            <Input
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://example.com"
              error={errors.website}
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Industry
            </label>
            <Select
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
            >
              <option value="">Select industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </Select>
          </div>

          {/* Company Size */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Company Size
            </label>
            <Select
              value={formData.companySize}
              onChange={(e) => handleChange('companySize', e.target.value)}
            >
              <option value="">Select size</option>
              {companySizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </Select>
          </div>

          {/* Annual Revenue */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Annual Revenue
            </label>
            <Input
              type="number"
              value={formData.annualRevenue}
              onChange={(e) => handleChange('annualRevenue', e.target.value)}
              placeholder="1000000"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Phone
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="info@company.com"
              error={errors.email}
            />
          </div>
        </div>

        {/* Address Section */}
        <div>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Street
              </label>
              <Input
                value={formData.address.street}
                onChange={(e) => handleChange('address.street', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                City
              </label>
              <Input
                value={formData.address.city}
                onChange={(e) => handleChange('address.city', e.target.value)}
                placeholder="New York"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                State
              </label>
              <Input
                value={formData.address.state}
                onChange={(e) => handleChange('address.state', e.target.value)}
                placeholder="NY"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                ZIP Code
              </label>
              <Input
                value={formData.address.zip}
                onChange={(e) => handleChange('address.zip', e.target.value)}
                placeholder="10001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Country
              </label>
              <Input
                value={formData.address.country}
                onChange={(e) => handleChange('address.country', e.target.value)}
                placeholder="USA"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief description of the company..."
            rows={3}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                LinkedIn
              </label>
              <Input
                value={formData.socialLinks.linkedin}
                onChange={(e) => handleChange('socialLinks.linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/..."
                error={errors['socialLinks.linkedin']}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Twitter
              </label>
              <Input
                value={formData.socialLinks.twitter}
                onChange={(e) => handleChange('socialLinks.twitter', e.target.value)}
                placeholder="https://twitter.com/..."
                error={errors['socialLinks.twitter']}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Facebook
              </label>
              <Input
                value={formData.socialLinks.facebook}
                onChange={(e) => handleChange('socialLinks.facebook', e.target.value)}
                placeholder="https://facebook.com/..."
                error={errors['socialLinks.facebook']}
              />
            </div>
          </div>
        </div>

        {/* Tags and Assigned To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Tags
            </label>
            <Input
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-xs text-secondary-500 mt-1">Separate multiple tags with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Assigned To
            </label>
            <Input
              value={formData.assignedTo}
              onChange={(e) => handleChange('assignedTo', e.target.value)}
              placeholder="Account owner name"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-secondary-200">
          <Button
            type="submit"
            loading={isSubmitting}
            className="flex-1"
          >
            {company ? 'Update Company' : 'Create Company'}
          </Button>
          
          {!company && (
            <Button
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e, true)}
              loading={isSubmitting}
              className="flex-1"
            >
              Save & Add Another
            </Button>
          )}
          
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CompanyForm;