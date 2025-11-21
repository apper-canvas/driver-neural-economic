import React, { useEffect, useState } from "react";
import { contactService } from "@/services/api/contactService";
import { toast } from "react-toastify";
import { create as createCompany, getAll as getAllCompanies, update as updateCompany } from "@/services/api/companyService";
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
  const [viewMode, setViewMode] = useState('board');
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [stageMetrics, setStageMetrics] = useState({});

  const stages = [
    { id: 'Lead', label: 'Lead', color: 'from-secondary-500 to-secondary-600' },
    { id: 'Qualified', label: 'Qualified', color: 'from-blue-500 to-blue-600' },
    { id: 'Proposal', label: 'Proposal', color: 'from-yellow-500 to-yellow-600' },
    { id: 'Negotiation', label: 'Negotiation', color: 'from-orange-500 to-orange-600' },
    { id: 'Closed Won', label: 'Closed Won', color: 'from-green-500 to-green-600' },
    { id: 'Closed Lost', label: 'Closed Lost', color: 'from-red-500 to-red-600' }
  ];

  async function loadDeals() {
    try {
      setLoading(true);
      setError(null);
      const [dealsData, contactsData, companiesData, metricsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll(),
        getAllCompanies(),
        dealService.getStageMetrics()
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
      setCompanies(companiesData);
      setStageMetrics(metricsData);
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

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(deal =>
        deal.dealName.toLowerCase().includes(term) ||
        deal.description.toLowerCase().includes(term) ||
        deal.assignedTo.toLowerCase().includes(term)
      );
    }

    if (stageFilter) {
      filtered = filtered.filter(deal => deal.stage === stageFilter);
    }

    if (priorityFilter) {
      filtered = filtered.filter(deal => deal.priority === priorityFilter);
    }

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
      
      // Refresh metrics
      const metricsData = await dealService.getStageMetrics();
      setStageMetrics(metricsData);
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
        
        // Refresh metrics
        const metricsData = await dealService.getStageMetrics();
        setStageMetrics(metricsData);
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

  function handleNewDeal(stage) {
    setEditingDeal({ stage });
    setIsFormOpen(true);
  }

  async function handleDragStart(e, deal) {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  }

  function handleDragEnd(e) {
    e.target.style.opacity = '1';
    setDraggedDeal(null);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  async function handleDrop(e, newStage) {
    e.preventDefault();
    
    if (!draggedDeal || draggedDeal.stage === newStage) {
      return;
    }

    try {
      const updatedDeal = await dealService.updateDealStage(draggedDeal.Id, newStage);
      setDeals(prev => prev.map(deal => 
        deal.Id === draggedDeal.Id ? updatedDeal : deal
      ));
      
      // Refresh metrics
      const metricsData = await dealService.getStageMetrics();
      setStageMetrics(metricsData);
      
      toast.success(`Deal moved to ${newStage}`);
    } catch (error) {
      console.error('Error updating deal stage:', error);
      toast.error('Failed to update deal stage');
    }
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

  function getPriorityIcon(priority) {
    const icons = {
      'High': 'AlertTriangle',
      'Medium': 'Minus',
      'Low': 'ArrowDown'
    };
    return icons[priority] || 'Minus';
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getDaysInStage(deal) {
    const now = new Date();
    const updatedDate = deal.updatedAt ? new Date(deal.updatedAt) : new Date(deal.createdAt);
    const diffTime = Math.abs(now - updatedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function getDealsForStage(stage) {
    return filteredDeals.filter(deal => deal.stage === stage);
  }

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="space-y-6">
      <Header
        title="Sales Pipeline"
        count={deals.length}
        onAddClick={() => {
          setEditingDeal(null);
          setIsFormOpen(true);
        }}
        addButtonLabel="New Deal"
      >
        <div className="flex items-center gap-3">
          <div className="flex bg-secondary-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'board' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('board')}
              className="h-8 px-3"
            >
              <ApperIcon name="Columns" size={16} className="mr-1" />
              Board
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <ApperIcon name="List" size={16} className="mr-1" />
              List
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="h-8"
          >
            <ApperIcon name="Filter" size={16} className="mr-1" />
            Filter
          </Button>
        </div>
      </Header>

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

      {/* Content based on view mode */}
      {viewMode === 'board' ? (
        // Kanban Board View
        <div className="overflow-x-auto">
          <div className="flex gap-6 min-w-max pb-6">
            {stages.map((stage) => {
              const stageDeals = getDealsForStage(stage.id);
              const metrics = stageMetrics[stage.id] || { count: 0, value: 0 };
              
              return (
                <div
                  key={stage.id}
                  className="flex-shrink-0 w-80"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Stage Header */}
                  <div className={cn(
                    "bg-gradient-to-r rounded-t-xl p-4 text-white shadow-sm",
                    stage.color
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{stage.label}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleNewDeal(stage.id)}
                        className="text-white hover:bg-white/20 h-8 w-8 p-0"
                      >
                        <ApperIcon name="Plus" size={16} />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm opacity-90">
                      <span>{metrics.count} {metrics.count === 1 ? 'deal' : 'deals'}</span>
                      <span>{formatCurrency(metrics.value)}</span>
                    </div>
                  </div>

                  {/* Deals Column */}
                  <div className="bg-secondary-50 rounded-b-xl min-h-[400px] p-4 border-l border-r border-b border-secondary-200">
                    <div className="space-y-3">
                      {stageDeals.length === 0 ? (
                        <div className="text-center py-8 text-secondary-500">
                          <ApperIcon name="Package" size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No deals in this stage</p>
                        </div>
                      ) : (
                        stageDeals.map((deal) => (
                          <div
                            key={deal.Id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, deal)}
                            onDragEnd={handleDragEnd}
                            className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 cursor-move hover:shadow-md transition-shadow group"
                          >
                            {/* Deal Header */}
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-secondary-900 text-sm line-clamp-2 flex-1 mr-2">
                                {deal.dealName}
                              </h4>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(deal);
                                  }}
                                  className="h-6 w-6 p-0 text-secondary-400 hover:text-primary-600"
                                >
                                  <ApperIcon name="Pencil" size={12} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(deal);
                                  }}
                                  className={cn(
                                    "h-6 w-6 p-0 transition-colors",
                                    deleteConfirm?.Id === deal.Id
                                      ? "text-red-600 bg-red-50"
                                      : "text-secondary-400 hover:text-red-600"
                                  )}
                                >
                                  <ApperIcon 
                                    name={deleteConfirm?.Id === deal.Id ? "Check" : "Trash2"} 
                                    size={12} 
                                  />
                                </Button>
                              </div>
                            </div>

                            {/* Company & Contact */}
                            <div className="space-y-1 mb-3">
                              <div className="flex items-center gap-2 text-sm">
                                <ApperIcon name="Building2" size={12} className="text-secondary-400" />
                                <span className="text-secondary-600 truncate">
                                  {getCompanyName(deal.companyId)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <ApperIcon name="User" size={12} className="text-secondary-400" />
                                <span className="text-secondary-600 truncate">
                                  {getContactName(deal.contactId)}
                                </span>
                              </div>
                            </div>

                            {/* Deal Value */}
                            <div className="mb-3">
                              <div className="text-xl font-bold text-secondary-900">
                                {formatCurrency(deal.amount)}
                              </div>
                            </div>

                            {/* Deal Details */}
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary-500">Close Date:</span>
                                <span className="text-secondary-700 font-medium">
                                  {formatDate(deal.closeDate)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary-500">Days in Stage:</span>
                                <span className="text-secondary-700 font-medium">
                                  {getDaysInStage(deal)} days
                                </span>
                              </div>
                              {deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost' && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-secondary-500">Win Probability:</span>
                                  <span className="text-secondary-700 font-medium">
                                    {deal.probability}%
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-secondary-100">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <ApperIcon 
                                    name={getPriorityIcon(deal.priority)} 
                                    size={12} 
                                    className={cn(
                                      deal.priority === 'High' && 'text-red-500',
                                      deal.priority === 'Medium' && 'text-yellow-500',
                                      deal.priority === 'Low' && 'text-green-500'
                                    )}
                                  />
                                  <Badge className={cn("text-xs px-2 py-1", getPriorityColor(deal.priority))}>
                                    {deal.priority}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {deal.assignedTo && (
                                  <div className="flex items-center gap-1 text-xs text-secondary-500">
                                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                                      <span className="text-primary-600 font-medium text-xs">
                                        {deal.assignedTo.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <span className="truncate max-w-20">
                                      {deal.assignedTo}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // List View (existing table)
        filteredDeals.length === 0 ? (
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
        )
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