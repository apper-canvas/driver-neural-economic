import leadsData from "@/services/mockData/leads.json";

const STORAGE_KEY = "crm_leads";

// Initialize localStorage with default data if empty
const initializeStorage = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leadsData));
    return leadsData;
  }
  return JSON.parse(stored);
};

// Get all leads from localStorage
const getStoredLeads = () => {
  return initializeStorage();
};

// Save leads to localStorage
const saveLeads = (leads) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const leadService = {
  async getAll() {
    await delay(200);
    const leads = getStoredLeads();
    return [...leads];
  },

  async getById(id) {
    await delay(150);
    const leads = getStoredLeads();
    const lead = leads.find(l => l.Id === parseInt(id));
    if (!lead) {
      throw new Error("Lead not found");
    }
    return { ...lead };
  },

  async create(leadData) {
    await delay(300);
    const leads = getStoredLeads();
    const maxId = leads.length > 0 ? Math.max(...leads.map(l => l.Id)) : 0;
    
    const newLead = {
      Id: maxId + 1,
      ...leadData,
      contactId: leadData.contactId ? parseInt(leadData.contactId) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    leads.push(newLead);
    saveLeads(leads);
    return { ...newLead };
  },

  async update(id, leadData) {
    await delay(250);
    const leads = getStoredLeads();
    const index = leads.findIndex(l => l.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Lead not found");
    }
    
    leads[index] = {
      ...leads[index],
      ...leadData,
      contactId: leadData.contactId ? parseInt(leadData.contactId) : null,
      updatedAt: new Date().toISOString()
    };
    
    saveLeads(leads);
    return { ...leads[index] };
  },

  async delete(id) {
    await delay(200);
    const leads = getStoredLeads();
    const index = leads.findIndex(l => l.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Lead not found");
    }
    
    const deletedLead = leads[index];
    leads.splice(index, 1);
    saveLeads(leads);
    return { ...deletedLead };
  },

  async updateStatus(id, status) {
    await delay(200);
    const leads = getStoredLeads();
    const index = leads.findIndex(l => l.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Lead not found");
    }
    
    leads[index] = {
      ...leads[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    saveLeads(leads);
    return { ...leads[index] };
  }
};