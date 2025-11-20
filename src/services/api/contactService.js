import contactsData from "@/services/mockData/contacts.json";

const STORAGE_KEY = "crm-contacts";

// Initialize localStorage with default data if empty
const initializeStorage = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contactsData));
    return contactsData;
  }
  return JSON.parse(stored);
};

// Get all contacts from localStorage
const getStoredContacts = () => {
  return initializeStorage();
};

// Save contacts to localStorage
const saveContacts = (contacts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const contactService = {
  async getAll() {
    await delay(200);
    const contacts = getStoredContacts();
    return [...contacts];
  },

  async getById(id) {
    await delay(150);
    const contacts = getStoredContacts();
    const contact = contacts.find(c => c.Id === parseInt(id));
    if (!contact) {
      throw new Error("Contact not found");
    }
    return { ...contact };
  },

async create(contactData) {
    await delay(300);
    const contacts = getStoredContacts();
    
    // Check for duplicate email
    const existingContact = contacts.find(c => 
      c.email.toLowerCase() === contactData.email.toLowerCase()
    );
    if (existingContact) {
      throw new Error("Contact with this email already exists");
    }
    
    const maxId = contacts.length > 0 ? Math.max(...contacts.map(c => c.Id)) : 0;
    const newId = maxId + 1;
    
    const newContact = {
      id: `CONT-${String(newId).padStart(4, '0')}`,
      Id: newId,
      firstName: contactData.firstName || "",
      lastName: contactData.lastName || "",
      email: contactData.email || "",
      phone: contactData.phone || "",
      jobTitle: contactData.jobTitle || "",
      companyId: contactData.companyId || null,
      companyName: contactData.companyName || "",
      source: contactData.source || "Website",
      status: contactData.status || "Lead",
      address: contactData.address || {},
      socialLinks: contactData.socialLinks || {},
      tags: contactData.tags || [],
      assignedTo: contactData.assignedTo || "Current User",
      notes: contactData.notes || "",
      createdDate: new Date().toISOString(),
      createdBy: "Current User",
      modifiedDate: new Date().toISOString(),
      // Legacy fields for backward compatibility
      name: `${contactData.firstName} ${contactData.lastName}`.trim(),
      company: contactData.companyName || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    contacts.push(newContact);
    saveContacts(contacts);
    return { ...newContact };
  },

  async update(id, contactData) {
    await delay(250);
    const contacts = getStoredContacts();
    const index = contacts.findIndex(c => c.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Contact not found");
    }
    
    contacts[index] = {
      ...contacts[index],
      ...contactData,
      updatedAt: new Date().toISOString()
    };
    
    saveContacts(contacts);
    return { ...contacts[index] };
  },

  async delete(id) {
    await delay(200);
    const contacts = getStoredContacts();
    const index = contacts.findIndex(c => c.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Contact not found");
    }
    
    const deletedContact = contacts[index];
    contacts.splice(index, 1);
    saveContacts(contacts);
    return { ...deletedContact };
  }
};