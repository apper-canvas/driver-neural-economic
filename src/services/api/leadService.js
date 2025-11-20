import leadsData from "@/services/mockData/leads.json";

const STORAGE_KEY = "crm-leads";

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
      leadName: leadData.leadName,
      companyName: leadData.companyName || "",
      jobTitle: leadData.jobTitle || "",
      email: leadData.email,
      phone: leadData.phone,
      leadSource: leadData.leadSource || "Other",
      leadStatus: leadData.leadStatus || "New",
      leadScore: parseInt(leadData.leadScore) || 0,
      priority: leadData.priority || "Medium",
      industry: leadData.industry || "",
      companySize: leadData.companySize || "",
      expectedDealValue: parseFloat(leadData.expectedDealValue) || 0,
      expectedCloseDate: leadData.expectedCloseDate || null,
      assignedTo: leadData.assignedTo || "",
      notes: leadData.notes || "",
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
    
    const updatedData = {};
    if (leadData.leadName !== undefined) updatedData.leadName = leadData.leadName;
    if (leadData.companyName !== undefined) updatedData.companyName = leadData.companyName;
    if (leadData.jobTitle !== undefined) updatedData.jobTitle = leadData.jobTitle;
    if (leadData.email !== undefined) updatedData.email = leadData.email;
    if (leadData.phone !== undefined) updatedData.phone = leadData.phone;
    if (leadData.leadSource !== undefined) updatedData.leadSource = leadData.leadSource;
    if (leadData.leadStatus !== undefined) updatedData.leadStatus = leadData.leadStatus;
    if (leadData.leadScore !== undefined) updatedData.leadScore = parseInt(leadData.leadScore) || 0;
    if (leadData.priority !== undefined) updatedData.priority = leadData.priority;
    if (leadData.industry !== undefined) updatedData.industry = leadData.industry;
    if (leadData.companySize !== undefined) updatedData.companySize = leadData.companySize;
    if (leadData.expectedDealValue !== undefined) updatedData.expectedDealValue = parseFloat(leadData.expectedDealValue) || 0;
    if (leadData.expectedCloseDate !== undefined) updatedData.expectedCloseDate = leadData.expectedCloseDate;
    if (leadData.assignedTo !== undefined) updatedData.assignedTo = leadData.assignedTo;
    if (leadData.notes !== undefined) updatedData.notes = leadData.notes;
    if (leadData.contactId !== undefined) updatedData.contactId = leadData.contactId ? parseInt(leadData.contactId) : null;
    
    leads[index] = {
      ...leads[index],
      ...updatedData,
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