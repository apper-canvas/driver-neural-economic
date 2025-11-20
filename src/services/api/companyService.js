const STORAGE_KEY = 'crm-companies';

// Mock data for companies
const mockCompanies = [
  {
    Id: 1,
    companyName: "TechCorp Solutions",
    website: "https://techcorp.com",
    industry: "Technology",
    companySize: "51-200",
    annualRevenue: 2500000,
    phone: "(555) 123-4567",
    email: "info@techcorp.com",
    address: {
      street: "123 Innovation Drive",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "USA"
    },
    description: "Leading technology solutions provider specializing in enterprise software development and digital transformation.",
    socialLinks: {
      linkedin: "https://linkedin.com/company/techcorp",
      twitter: "https://twitter.com/techcorp",
      facebook: "https://facebook.com/techcorp"
    },
    tags: ["Enterprise", "Software", "Innovation"],
    assignedTo: "John Smith",
    contactCount: 8,
    dealCount: 3,
    dealValue: 450000,
    logo: null,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  },
  {
    Id: 2,
    companyName: "HealthFirst Medical",
    website: "https://healthfirst.com",
    industry: "Healthcare",
    companySize: "201-500",
    annualRevenue: 15000000,
    phone: "(555) 987-6543",
    email: "contact@healthfirst.com",
    address: {
      street: "456 Medical Center Blvd",
      city: "Boston",
      state: "MA",
      zip: "02101",
      country: "USA"
    },
    description: "Comprehensive healthcare services with focus on patient-centered care and innovative medical solutions.",
    socialLinks: {
      linkedin: "https://linkedin.com/company/healthfirst",
      twitter: "",
      facebook: "https://facebook.com/healthfirst"
    },
    tags: ["Healthcare", "Medical", "Patient Care"],
    assignedTo: "Sarah Johnson",
    contactCount: 12,
    dealCount: 2,
    dealValue: 890000,
    logo: null,
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString()
  },
  {
    Id: 3,
    companyName: "GlobalBank Financial",
    website: "https://globalbank.com",
    industry: "Finance",
    companySize: "1000+",
    annualRevenue: 50000000,
    phone: "(555) 246-8135",
    email: "info@globalbank.com",
    address: {
      street: "789 Financial District",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA"
    },
    description: "International banking and financial services company providing comprehensive solutions for businesses and individuals.",
    socialLinks: {
      linkedin: "https://linkedin.com/company/globalbank",
      twitter: "https://twitter.com/globalbank",
      facebook: ""
    },
    tags: ["Banking", "Finance", "Investment"],
    assignedTo: "Michael Chen",
    contactCount: 25,
    dealCount: 5,
    dealValue: 1200000,
    logo: null,
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString()
  }
];

// Initialize localStorage with mock data if empty
const initializeStorage = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCompanies));
    return mockCompanies;
  }
  return JSON.parse(stored);
};

// Get all companies
export const getAll = async () => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  const companies = initializeStorage();
  return [...companies]; // Return a copy to prevent mutations
};

// Get company by ID
export const getById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const companies = initializeStorage();
  const company = companies.find(c => c.Id === parseInt(id));
  return company ? { ...company } : null;
};

// Create new company
export const create = async (companyData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const companies = initializeStorage();
  
  // Generate new ID
  const maxId = companies.length > 0 ? Math.max(...companies.map(c => c.Id)) : 0;
  const newCompany = {
    ...companyData,
    Id: maxId + 1,
    contactCount: 0,
    dealCount: 0,
    dealValue: 0,
    logo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  companies.push(newCompany);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  
  return { ...newCompany };
};

// Update company
export const update = async (id, updateData) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const companies = initializeStorage();
  const index = companies.findIndex(c => c.Id === parseInt(id));
  
  if (index === -1) {
    throw new Error('Company not found');
  }
  
  companies[index] = {
    ...companies[index],
    ...updateData,
    Id: parseInt(id), // Ensure ID doesn't change
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  return { ...companies[index] };
};

// Delete company
export const deleteCompany = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const companies = initializeStorage();
  const index = companies.findIndex(c => c.Id === parseInt(id));
  
  if (index === -1) {
    throw new Error('Company not found');
  }
  
  companies.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  
  return true;
};

// Export named functions for consistency with other services
export { deleteCompany as delete };