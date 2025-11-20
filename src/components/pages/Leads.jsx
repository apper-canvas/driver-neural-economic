import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { leadService } from "@/services/api/leadService";
import { create, getAll, update } from "@/services/api/companyService";
import Modal from "@/components/molecules/Modal";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import LeadForm from "@/components/organisms/LeadForm";
import LeadTable from "@/components/organisms/LeadTable";
import Header from "@/components/organisms/Header";
import Button from "@/components/atoms/Button";

const Leads = () => {
const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [convertConfirm, setConvertConfirm] = useState(null);
  const loadLeads = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await leadService.getAll();
      setLeads(data);
    } catch (err) {
      setError("Failed to load leads. Please try again.");
      console.error("Error loading leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleAddLead = () => {
    setEditingLead(null);
    setIsFormOpen(true);
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleDeleteLead = (lead) => {
    setDeleteConfirm(lead);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await leadService.delete(deleteConfirm.Id);
      setLeads(prev => prev.filter(l => l.Id !== deleteConfirm.Id));
      toast.success("Lead deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete lead. Please try again.");
      console.error("Error deleting lead:", err);
    } finally {
      setDeleteConfirm(null);
    }
  };

const handleSubmitLead = async (formData) => {
    try {
      if (editingLead) {
        const updatedLead = await leadService.update(editingLead.Id, formData);
        setLeads(prev => prev.map(l => l.Id === updatedLead.Id ? updatedLead : l));
        toast.success("Lead updated successfully!");
      } else {
        const newLead = await leadService.create(formData);
        setLeads(prev => [...prev, newLead]);
        toast.success("Lead added successfully!");
      }
    } catch (err) {
      toast.error("Failed to save lead. Please try again.");
      console.error("Error saving lead:", err);
      throw err;
    }
  };
  
  const handleConvertLead = (lead) => {
    setConvertConfirm(lead);
  };
  
  const confirmConvert = async () => {
    try {
      // In a real app, this would call a conversion service
      // For now, we'll just show success and update status
      const updatedLead = await leadService.update(convertConfirm.Id, { 
        leadStatus: "Qualified" 
      });
      setLeads(prev => prev.map(l => l.Id === updatedLead.Id ? updatedLead : l));
      toast.success("Lead converted to deal successfully!");
      setConvertConfirm(null);
    } catch (err) {
      toast.error("Failed to convert lead. Please try again.");
      console.error("Error converting lead:", err);
    }
  };


if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadLeads} />;
  }

  if (leads.length === 0) {
    return (
      <div className="min-h-screen">
        <Header 
          title="Leads" 
          onAddClick={handleAddLead}
          addButtonLabel="Add Lead"
          addButtonIcon="UserPlus"
        />
        <div className="p-6">
          <Empty
            icon="TrendingUp"
            title="No leads found"
            description="Start tracking potential customers by adding your first lead."
            actionLabel="Add Lead"
            onAction={handleAddLead}
          />
        </div>
        
        <LeadForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmitLead}
          lead={editingLead}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Leads" 
        onAddClick={handleAddLead}
        addButtonLabel="Add Lead"
        addButtonIcon="UserPlus"
      />
<LeadTable
        leads={leads}
        onEdit={handleEditLead}
        onDelete={handleDeleteLead}
        onConvert={handleConvertLead}
      />
      
      <LeadForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitLead}
        lead={editingLead}
      />
<Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Lead"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Are you sure you want to delete <strong>{deleteConfirm?.leadName}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              className="flex-1"
            >
              Delete Lead
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!convertConfirm}
        onClose={() => setConvertConfirm(null)}
        title="Convert Lead to Deal"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Convert <strong>{convertConfirm?.leadName}</strong> from <strong>{convertConfirm?.companyName}</strong> to a deal?
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">This will create:</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Contact record (if doesn't exist)</li>
              <li>• Company record (if doesn't exist)</li>
              <li>• Deal/Opportunity record</li>
              <li>• Mark lead as "Qualified"</li>
            </ul>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setConvertConfirm(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmConvert}
              className="flex-1"
            >
              Convert to Deal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Leads;