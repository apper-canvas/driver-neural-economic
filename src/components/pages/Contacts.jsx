import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "@/components/organisms/Header";
import ContactTable from "@/components/organisms/ContactTable";
import ContactForm from "@/components/organisms/ContactForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Modal from "@/components/molecules/Modal";
import Button from "@/components/atoms/Button";
import { contactService } from "@/services/api/contactService";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
      console.error("Error loading contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleAddContact = () => {
    setEditingContact(null);
    setIsFormOpen(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleDeleteContact = (contact) => {
    setDeleteConfirm(contact);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await contactService.delete(deleteConfirm.Id);
      setContacts(prev => prev.filter(c => c.Id !== deleteConfirm.Id));
      toast.success("Contact deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete contact. Please try again.");
      console.error("Error deleting contact:", err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleSubmitContact = async (formData) => {
    try {
      if (editingContact) {
        const updatedContact = await contactService.update(editingContact.Id, formData);
        setContacts(prev => prev.map(c => c.Id === updatedContact.Id ? updatedContact : c));
        toast.success("Contact updated successfully!");
      } else {
        const newContact = await contactService.create(formData);
        setContacts(prev => [...prev, newContact]);
        toast.success("Contact added successfully!");
      }
    } catch (err) {
      toast.error("Failed to save contact. Please try again.");
      console.error("Error saving contact:", err);
      throw err;
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadContacts} />;
  }

  if (contacts.length === 0) {
    return (
      <div className="min-h-screen">
        <Header 
          title="Contacts" 
          onAddClick={handleAddContact}
          addButtonLabel="Add Contact"
          addButtonIcon="UserPlus"
        />
        <div className="p-6">
          <Empty
            icon="Users"
            title="No contacts found"
            description="Start building your contact list by adding your first contact."
            actionLabel="Add Contact"
            onAction={handleAddContact}
          />
        </div>
        
        <ContactForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmitContact}
          contact={editingContact}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Contacts" 
        onAddClick={handleAddContact}
        addButtonLabel="Add Contact"
        addButtonIcon="UserPlus"
      />
      
      <div className="p-6">
        <ContactTable
          contacts={contacts}
          onEdit={handleEditContact}
          onDelete={handleDeleteContact}
        />
      </div>
      
      <ContactForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitContact}
        contact={editingContact}
      />

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Contact"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? 
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
              Delete Contact
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Contacts;