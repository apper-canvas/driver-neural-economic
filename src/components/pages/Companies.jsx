import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { cn } from '@/utils/cn';
import Header from '@/components/organisms/Header';
import CompanyForm from '@/components/organisms/CompanyForm';
import SearchBar from '@/components/molecules/SearchBar';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import Error from '@/components/ui/Error';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import * as companyService from '@/services/api/companyService';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [viewMode, setViewMode] = useState('cards');
  
  // Filters
  const [filters, setFilters] = useState({
    industry: '',
    companySize: '',
    assignedTo: '',
    revenueMin: '',
    revenueMax: ''
  });

  // Load companies
  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyService.getAll();
      setCompanies(data);
      setFilteredCompanies(data);
    } catch (err) {
      setError(err.message || 'Failed to load companies');
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...companies];

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Industry filter
    if (filters.industry) {
      filtered = filtered.filter(company => company.industry === filters.industry);
    }

    // Company size filter
    if (filters.companySize) {
      filtered = filtered.filter(company => company.companySize === filters.companySize);
    }

    // Assigned to filter
    if (filters.assignedTo) {
      filtered = filtered.filter(company => company.assignedTo === filters.assignedTo);
    }

    // Revenue range filter
    if (filters.revenueMin) {
      filtered = filtered.filter(company => company.annualRevenue >= parseFloat(filters.revenueMin));
    }
    if (filters.revenueMax) {
      filtered = filtered.filter(company => company.annualRevenue <= parseFloat(filters.revenueMax));
    }

    setFilteredCompanies(filtered);
  }, [companies, searchTerm, filters]);

  // Handle form submission
  const handleFormSubmit = async (formData, addAnother) => {
    try {
      if (editingCompany) {
        await companyService.update(editingCompany.Id, formData);
        toast.success('Company updated successfully');
      } else {
        await companyService.create(formData);
        toast.success('Company created successfully');
      }
      
      await loadCompanies();
      
      if (!addAnother) {
        setShowForm(false);
        setEditingCompany(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save company');
    }
  };

  // Handle delete
  const handleDelete = async (company) => {
    if (!confirm(`Are you sure you want to delete ${company.companyName}?`)) {
      return;
    }

    try {
      await companyService.delete(company.Id);
      toast.success('Company deleted successfully');
      await loadCompanies();
    } catch (err) {
      toast.error(err.message || 'Failed to delete company');
    }
  };

  // Handle edit
  const handleEdit = (company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  // Get unique values for filters
  const getUniqueValues = (field) => {
    return [...new Set(companies.map(company => company[field]).filter(Boolean))];
  };

  const industries = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Real Estate', 'Education', 'Other'];
  const companySizes = ['1-10', '11-50', '51-200', '201-500', '500+', '1000+'];
  const assignedUsers = getUniqueValues('assignedTo');

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get company initials for logo
  const getCompanyInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) return <Loading className="min-h-screen" />;
  if (error) return <Error message={error} onRetry={loadCompanies} className="min-h-screen" />;

  return (
    <div className="flex-1 flex flex-col bg-secondary-50 min-h-screen">
      <Header 
        title="Companies" 
        count={filteredCompanies.length}
        onAddClick={() => setShowForm(true)}
        addButtonLabel="Add Company"
        addButtonIcon="Plus"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                onSearch={setSearchTerm}
                placeholder="Search companies..."
                className="w-full"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-secondary-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-all",
                    viewMode === 'cards'
                      ? "bg-white text-primary-600 shadow-sm"
                      : "text-secondary-600 hover:text-secondary-900"
                  )}
                >
                  <ApperIcon name="Grid3X3" size={16} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-all",
                    viewMode === 'table'
                      ? "bg-white text-primary-600 shadow-sm"
                      : "text-secondary-600 hover:text-secondary-900"
                  )}
                >
                  <ApperIcon name="Table" size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-all",
                    viewMode === 'list'
                      ? "bg-white text-primary-600 shadow-sm"
                      : "text-secondary-600 hover:text-secondary-900"
                  )}
                >
                  <ApperIcon name="List" size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select
              value={filters.industry}
              onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
              className="w-full"
            >
              <option value="">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </Select>

            <Select
              value={filters.companySize}
              onChange={(e) => setFilters(prev => ({ ...prev, companySize: e.target.value }))}
              className="w-full"
            >
              <option value="">All Sizes</option>
              {companySizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </Select>

            <Select
              value={filters.assignedTo}
              onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
              className="w-full"
            >
              <option value="">All Assigned</option>
              {assignedUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </Select>

            <input
              type="number"
              placeholder="Min Revenue"
              value={filters.revenueMin}
              onChange={(e) => setFilters(prev => ({ ...prev, revenueMin: e.target.value }))}
              className="px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />

            <input
              type="number"
              placeholder="Max Revenue"
              value={filters.revenueMax}
              onChange={(e) => setFilters(prev => ({ ...prev, revenueMax: e.target.value }))}
              className="px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Companies Display */}
        {filteredCompanies.length === 0 ? (
          <Empty
            icon="Building2"
            title="No companies found"
            description="No companies match your current filters. Try adjusting your search criteria."
          />
        ) : (
          <>
            {/* Cards View */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCompanies.map((company) => (
                  <div
                    key={company.Id}
                    className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {getCompanyInitials(company.companyName)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                            {company.companyName}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {company.industry}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(company);
                          }}
                        >
                          <ApperIcon name="Edit" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(company);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary-500">Size:</span>
                        <span className="font-medium">{company.companySize}</span>
                      </div>
                      
                      {company.website && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-secondary-500">Website:</span>
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Visit
                          </a>
                        </div>
                      )}
                      
                      {company.phone && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-secondary-500">Phone:</span>
                          <span className="font-medium">{company.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm border-t pt-3">
                        <div className="text-center">
                          <div className="font-semibold text-secondary-900">{company.contactCount}</div>
                          <div className="text-xs text-secondary-500">Contacts</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-secondary-900">{company.dealCount}</div>
                          <div className="text-xs text-secondary-500">Deals</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{formatCurrency(company.dealValue)}</div>
                          <div className="text-xs text-secondary-500">Value</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary-500">Assigned to:</span>
                        <span className="font-medium">{company.assignedTo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary-50 border-b border-secondary-200">
                      <tr>
                        <th className="text-left py-4 px-6 font-medium text-secondary-900">Company</th>
                        <th className="text-left py-4 px-6 font-medium text-secondary-900">Industry</th>
                        <th className="text-left py-4 px-6 font-medium text-secondary-900">Size</th>
                        <th className="text-left py-4 px-6 font-medium text-secondary-900">Revenue</th>
                        <th className="text-left py-4 px-6 font-medium text-secondary-900">Contacts</th>
                        <th className="text-left py-4 px-6 font-medium text-secondary-900">Deals</th>
                        <th className="text-left py-4 px-6 font-medium text-secondary-900">Assigned To</th>
                        <th className="text-right py-4 px-6 font-medium text-secondary-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200">
                      {filteredCompanies.map((company) => (
                        <tr key={company.Id} className="hover:bg-secondary-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">
                                  {getCompanyInitials(company.companyName)}
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-secondary-900">{company.companyName}</div>
                                {company.website && (
                                  <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary-600 hover:text-primary-700"
                                  >
                                    {company.website}
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="secondary">{company.industry}</Badge>
                          </td>
                          <td className="py-4 px-6 text-secondary-900">{company.companySize}</td>
                          <td className="py-4 px-6 font-medium text-green-600">{formatCurrency(company.annualRevenue)}</td>
                          <td className="py-4 px-6 text-secondary-900">{company.contactCount}</td>
                          <td className="py-4 px-6">
                            <div className="text-secondary-900">{company.dealCount}</div>
                            <div className="text-sm text-green-600">{formatCurrency(company.dealValue)}</div>
                          </td>
                          <td className="py-4 px-6 text-secondary-900">{company.assignedTo}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(company)}
                              >
                                <ApperIcon name="Edit" size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(company)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <ApperIcon name="Trash2" size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-xl shadow-sm border border-secondary-200 divide-y divide-secondary-200">
                {filteredCompanies.map((company) => (
                  <div key={company.Id} className="p-6 hover:bg-secondary-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {getCompanyInitials(company.companyName)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-secondary-900 mb-1">{company.companyName}</h3>
                          <div className="flex items-center gap-4 text-sm text-secondary-600">
                            <span>{company.industry}</span>
                            <span>•</span>
                            <span>{company.companySize}</span>
                            <span>•</span>
                            <span>{formatCurrency(company.annualRevenue)}</span>
                            <span>•</span>
                            <span>{company.contactCount} contacts</span>
                            <span>•</span>
                            <span>{company.dealCount} deals ({formatCurrency(company.dealValue)})</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-secondary-600">Assigned to: {company.assignedTo}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(company)}
                        >
                          <ApperIcon name="Edit" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(company)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Company Form Modal */}
      <CompanyForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCompany(null);
        }}
        onSubmit={handleFormSubmit}
        company={editingCompany}
      />
    </div>
  );
};

export default Companies;