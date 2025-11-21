import { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Modal from '@/components/molecules/Modal';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const DealForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  contacts = [],
  companies = []
}) => {
  const [formData, setFormData] = useState({
    dealName: '',
    contactId: '',
    companyId: '',
    amount: '',
    closeDate: '',
    stage: 'Lead',
    probability: '',
    source: 'Inbound',
    priority: 'Medium',
    assignedTo: '',
    products: [],
    description: '',
    nextStep: '',
    competitors: ''
  });

  const [productForm, setProductForm] = useState({
    name: '',
    quantity: 1,
    unitPrice: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stageOptions = [
    { value: 'Lead', label: 'Lead' },
    { value: 'Qualified', label: 'Qualified' },
    { value: 'Proposal', label: 'Proposal' },
    { value: 'Negotiation', label: 'Negotiation' },
    { value: 'Closed Won', label: 'Closed Won' },
    { value: 'Closed Lost', label: 'Closed Lost' }
  ];

  const sourceOptions = [
    { value: 'Inbound', label: 'Inbound' },
    { value: 'Outbound', label: 'Outbound' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Partner', label: 'Partner' },
    { value: 'Other', label: 'Other' }
  ];

  const priorityOptions = [
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        dealName: initialData.dealName || '',
        contactId: initialData.contactId || '',
        companyId: initialData.companyId || '',
        amount: initialData.amount || '',
        closeDate: initialData.closeDate || '',
        stage: initialData.stage || 'Lead',
        probability: initialData.probability || '',
        source: initialData.source || 'Inbound',
        priority: initialData.priority || 'Medium',
        assignedTo: initialData.assignedTo || '',
        products: initialData.products || [],
        description: initialData.description || '',
        nextStep: initialData.nextStep || '',
        competitors: initialData.competitors || ''
      });
    } else {
      // Reset form for new deal
      setFormData({
        dealName: '',
        contactId: '',
        companyId: '',
        amount: '',
        closeDate: '',
        stage: 'Lead',
        probability: '',
        source: 'Inbound',
        priority: 'Medium',
        assignedTo: '',
        products: [],
        description: '',
        nextStep: '',
        competitors: ''
      });
    }
    setErrors({});
    setProductForm({ name: '', quantity: 1, unitPrice: '' });
  }, [initialData, isOpen]);

  // Auto-calculate probability based on stage
  useEffect(() => {
    const stageProbabilities = {
      'Lead': 10,
      'Qualified': 25,
      'Proposal': 50,
      'Negotiation': 75,
      'Closed Won': 100,
      'Closed Lost': 0
    };
    
    if (!initialData && stageProbabilities[formData.stage]) {
      setFormData(prev => ({
        ...prev,
        probability: stageProbabilities[formData.stage]
      }));
    }
  }, [formData.stage, initialData]);

  // Auto-fill company when contact is selected
  useEffect(() => {
    if (formData.contactId && contacts.length > 0) {
      const selectedContact = contacts.find(c => c.Id === parseInt(formData.contactId));
      if (selectedContact && selectedContact.companyId) {
        setFormData(prev => ({
          ...prev,
          companyId: selectedContact.companyId
        }));
      }
    }
  }, [formData.contactId, contacts]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleProductFormChange = (field, value) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addProduct = () => {
    if (!productForm.name || !productForm.unitPrice) return;
    
    const quantity = parseInt(productForm.quantity) || 1;
    const unitPrice = parseFloat(productForm.unitPrice) || 0;
    const total = quantity * unitPrice;
    
    const newProduct = {
      id: Date.now(),
      name: productForm.name,
      quantity,
      unitPrice,
      total
    };
    
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));
    
    setProductForm({ name: '', quantity: 1, unitPrice: '' });
  };

  const removeProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
  };

  const calculateTotalAmount = () => {
    return formData.products.reduce((total, product) => total + product.total, 0);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.dealName.trim()) {
      newErrors.dealName = 'Deal name is required';
    }
    
    if (!formData.contactId) {
      newErrors.contactId = 'Contact is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Deal value must be positive';
    }
    
    if (!formData.closeDate) {
      newErrors.closeDate = 'Close date is required';
    } else {
      const closeDate = new Date(formData.closeDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (closeDate < today) {
        newErrors.closeDate = 'Close date cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, addAnother = false) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        contactId: parseInt(formData.contactId),
        companyId: formData.companyId ? parseInt(formData.companyId) : null,
        probability: parseInt(formData.probability) || 0
      };
      
      await onSubmit(submitData, addAnother);
      
      if (!addAnother) {
        onClose();
      } else {
        // Reset form for adding another
        setFormData({
          dealName: '',
          contactId: '',
          companyId: '',
          amount: '',
          closeDate: '',
          stage: 'Lead',
          probability: 10,
          source: 'Inbound',
          priority: 'Medium',
          assignedTo: '',
          products: [],
          description: '',
          nextStep: '',
          competitors: ''
        });
        setProductForm({ name: '', quantity: 1, unitPrice: '' });
      }
    } catch (error) {
      console.error('Error submitting deal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={initialData ? "Edit Deal" : "New Deal"}
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Deal Name <span className="text-error">*</span>
            </label>
            <Input
              value={formData.dealName}
              onChange={(e) => handleChange('dealName', e.target.value)}
              placeholder="e.g., ABC Corp - Website Redesign"
              className={cn(errors.dealName && "border-error focus:border-error focus:ring-error")}
            />
            {errors.dealName && (
              <p className="text-error text-xs mt-1">{errors.dealName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Deal Value <span className="text-error">*</span>
            </label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              placeholder="25000"
              className={cn(errors.amount && "border-error focus:border-error focus:ring-error")}
            />
            {errors.amount && (
              <p className="text-error text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Associated Contact <span className="text-error">*</span>
            </label>
            <Select
              value={formData.contactId}
              onChange={(e) => handleChange('contactId', e.target.value)}
              className={cn(errors.contactId && "border-error focus:border-error focus:ring-error")}
            >
              <option value="">Select Contact</option>
              {contacts.map(contact => (
                <option key={contact.Id} value={contact.Id}>
                  {contact.name} - {contact.email}
                </option>
              ))}
            </Select>
            {errors.contactId && (
              <p className="text-error text-xs mt-1">{errors.contactId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Associated Company
            </label>
            <Select
              value={formData.companyId}
              onChange={(e) => handleChange('companyId', e.target.value)}
            >
              <option value="">Select Company</option>
              {companies.map(company => (
                <option key={company.Id} value={company.Id}>
                  {company.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Expected Close Date <span className="text-error">*</span>
            </label>
            <Input
              type="date"
              value={formData.closeDate}
              onChange={(e) => handleChange('closeDate', e.target.value)}
              min={getTodayDate()}
              className={cn(errors.closeDate && "border-error focus:border-error focus:ring-error")}
            />
            {errors.closeDate && (
              <p className="text-error text-xs mt-1">{errors.closeDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Deal Stage
            </label>
            <Select
              value={formData.stage}
              onChange={(e) => handleChange('stage', e.target.value)}
            >
              {stageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Win Probability (%)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => handleChange('probability', e.target.value)}
              placeholder="75"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Deal Source
            </label>
            <Select
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
            >
              {sourceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Priority
            </label>
            <Select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Assigned To
            </label>
            <Input
              value={formData.assignedTo}
              onChange={(e) => handleChange('assignedTo', e.target.value)}
              placeholder="Deal owner"
            />
          </div>
        </div>

        {/* Product Line Items */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Product Line Items</h3>
          
          {/* Add Product Form */}
          <div className="bg-secondary-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Input
                  placeholder="Product name"
                  value={productForm.name}
                  onChange={(e) => handleProductFormChange('name', e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Quantity"
                  min="1"
                  value={productForm.quantity}
                  onChange={(e) => handleProductFormChange('quantity', e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Unit Price"
                  min="0"
                  step="0.01"
                  value={productForm.unitPrice}
                  onChange={(e) => handleProductFormChange('unitPrice', e.target.value)}
                />
              </div>
              <div>
                <Button
                  type="button"
                  onClick={addProduct}
                  disabled={!productForm.name || !productForm.unitPrice}
                  className="w-full"
                >
                  <ApperIcon name="Plus" size={16} className="mr-2" />
                  Add Product
                </Button>
              </div>
            </div>
          </div>

          {/* Product List */}
          {formData.products.length > 0 && (
            <div className="space-y-2 mb-4">
              {formData.products.map((product) => (
                <div key={product.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                  <div className="flex-1">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-secondary-500 ml-2">
                      {product.quantity} × {formatCurrency(product.unitPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatCurrency(product.total)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(product.id)}
                      className="text-error hover:text-error hover:bg-red-50"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end pt-2 border-t">
                <div className="text-lg font-semibold">
                  Total: {formatCurrency(calculateTotalAmount())}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Description/Notes
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Deal description and notes..."
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Next Step
              </label>
              <Input
                value={formData.nextStep}
                onChange={(e) => handleChange('nextStep', e.target.value)}
                placeholder="What needs to happen next?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Competitors
              </label>
              <Input
                value={formData.competitors}
                onChange={(e) => handleChange('competitors', e.target.value)}
                placeholder="Competing solutions or vendors"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          
          <div className="flex-1" />
          
          {!initialData && (
            <Button
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Save & Add Another
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            {isSubmitting ? (
              <>
                <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                {initialData ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              initialData ? 'Update Deal' : 'Create Deal'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DealForm;