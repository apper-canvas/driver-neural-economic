import React, { useEffect, useState } from "react";
import { contactService } from "@/services/api/contactService";
import { toast } from "react-toastify";
import { getAll as getAllCompanies } from "@/services/api/companyService";
import dealService from "@/services/api/dealService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Header from "@/components/organisms/Header";
import DealForm from "@/components/organisms/DealForm";
import SearchBar from "@/components/molecules/SearchBar";
import { cn } from "@/utils/cn";

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  async function loadDeals() {
    try {
      setLoading(true);
      setError(null);
const [dealsData, contactsData, companiesData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll(),
        getAllCompanies()
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
      setCompanies(companiesData);
    } catch (err) {
      console.error('Error loading deals:', err);
      setError('Failed to load deals. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeals();
  }, []);

  useEffect(() => {
    let filtered = [...deals];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(deal =>
        deal.dealName.toLowerCase().includes(term) ||
        deal.description.toLowerCase().includes(term) ||
        deal.assignedTo.toLowerCase().includes(term)
      );
    }

    // Stage filter
    if (stageFilter) {
      filtered = filtered.filter(deal => deal.stage === stageFilter);
    }

    // Priority filter
    if (priorityFilter) {
      filtered = filtered.filter(deal => deal.priority === priorityFilter);
    }

    // Source filter
    if (sourceFilter) {
      filtered = filtered.filter(deal => deal.source === sourceFilter);
    }

    setFilteredDeals(filtered);
  }, [deals, searchTerm, stageFilter, priorityFilter, sourceFilter]);

  async function handleFormSubmit(formData, addAnother) {
    try {
      if (editingDeal) {
        const updatedDeal = await dealService.update(editingDeal.Id, formData);
        setDeals(prev => prev.map(deal => 
          deal.Id === editingDeal.Id ? updatedDeal : deal
        ));
        toast.success('Deal updated successfully!');
      } else {
        const newDeal = await dealService.create(formData);
        setDeals(prev => [newDeal, ...prev]);
        toast.success('Deal created successfully!');
      }

      if (!addAnother) {
        setIsFormOpen(false);
        setEditingDeal(null);
      }
    } catch (error) {
      console.error('Error saving deal:', error);
      toast.error('Failed to save deal. Please try again.');
    }
  }

  async function handleDelete(deal) {
    if (deleteConfirm?.Id === deal.Id) {
      try {
        await dealService.deleteDeal(deal.Id);
        setDeals(prev => prev.filter(d => d.Id !== deal.Id));
        toast.success('Deal deleted successfully!');
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting deal:', error);
        toast.error('Failed to delete deal. Please try again.');
      }
    } else {
      setDeleteConfirm(deal);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  function handleEdit(deal) {
    setEditingDeal(deal);
    setIsFormOpen(true);
  }

  function getUniqueValues(field) {
    return [...new Set(deals.map(deal => deal[field]).filter(Boolean))];
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  function getStageColor(stage) {
    const colors = {
      'Lead': 'bg-secondary-100 text-secondary-800',
      'Qualified': 'bg-blue-100 text-blue-800',
      'Proposal': 'bg-yellow-100 text-yellow-800',
      'Negotiation': 'bg-orange-100 text-orange-800',
      'Closed Won': 'bg-green-100 text-green-800',
      'Closed Lost': 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-secondary-100 text-secondary-800';
  }

  function getPriorityColor(priority) {
    const colors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-secondary-100 text-secondary-800';
  }

  function getContactName(contactId) {
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? contact.name : 'Unknown Contact';
  }

  function getCompanyName(companyId) {
    const company = companies.find(c => c.Id === companyId);
    return company ? company.name : 'No Company';
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="space-y-6">
      <Header
        title="Deals"
        count={deals.length}
        onAddClick={() => {
          setEditingDeal(null);
          setIsFormOpen(true);
        }}
        addButtonText="New Deal"
      />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              onSearch={setSearchTerm}
              placeholder="Search deals by name, description, or owner..."
              className="w-full"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="min-w-[140px]"
            >
              <option value="">All Stages</option>
              {getUniqueValues('stage').map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </Select>

            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="min-w-[120px]"
            >
              <option value="">All Priorities</option>
              {getUniqueValues('priority').map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </Select>

            <Select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="min-w-[120px]"
            >
              <option value="">All Sources</option>
              {getUniqueValues('source').map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </Select>

            {(searchTerm || stageFilter || priorityFilter || sourceFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStageFilter('');
                  setPriorityFilter('');
                  setSourceFilter('');
                }}
                className="whitespace-nowrap"
              >
                <ApperIcon name="X" size={16} className="mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Deals List */}
      {filteredDeals.length === 0 ? (
        <Empty
          title="No deals found"
          description={searchTerm || stageFilter || priorityFilter || sourceFilter 
            ? "Try adjusting your filters or search terms." 
            : "Get started by creating your first deal."
          }
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Contact & Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Value & Stage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {filteredDeals.map((deal) => (
                  <tr key={deal.Id} className="hover:bg-secondary-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-secondary-900 mb-1">
                          {deal.dealName}
                        </div>
                        <div className="text-sm text-secondary-500">
                          Assigned to: {deal.assignedTo || 'Unassigned'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-secondary-900">
                          {getContactName(deal.contactId)}
                        </div>
                        <div className="text-sm text-secondary-500">
                          {getCompanyName(deal.companyId)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-secondary-900 mb-1">
                          {formatCurrency(deal.amount)}
                        </div>
                        <Badge className={cn("text-xs", getStageColor(deal.stage))}>
                          {deal.stage}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-xs", getPriorityColor(deal.priority))}>
                            {deal.priority}
                          </Badge>
                          <span className="text-xs text-secondary-500">{deal.source}</span>
                        </div>
                        <div className="text-sm text-secondary-500">
                          Close: {formatDate(deal.closeDate)}
                        </div>
                        <div className="text-sm text-secondary-500">
                          {deal.probability}% probability
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(deal)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <ApperIcon name="Pencil" size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(deal)}
                          className={cn(
                            "transition-colors duration-200",
                            deleteConfirm?.Id === deal.Id
                              ? "text-white bg-error hover:bg-red-600 border-error"
                              : "text-error hover:text-red-700 hover:bg-red-50"
                          )}
                        >
                          <ApperIcon 
                            name={deleteConfirm?.Id === deal.Id ? "Check" : "Trash2"} 
                            size={16} 
                          />
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

      {/* Deal Form Modal */}
      <DealForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDeal(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingDeal}
        contacts={contacts}
        companies={companies}
      />
    </div>
  );
};

export default Deals;