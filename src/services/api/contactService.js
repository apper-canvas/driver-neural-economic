import contactsData from "@/services/mockData/contacts.json";

const STORAGE_KEY = "crm_contacts";

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
    const maxId = contacts.length > 0 ? Math.max(...contacts.map(c => c.Id)) : 0;
    
    const newContact = {
      Id: maxId + 1,
      ...contactData,
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