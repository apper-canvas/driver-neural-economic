const STORAGE_KEY = 'crm-deals';

// Mock data for deals
const mockDeals = [
  {
    Id: 1,
    dealName: "ABC Corp - Website Redesign",
    contactId: 1,
    companyId: 1,
    amount: 25000,
    closeDate: "2024-03-15",
    stage: "Qualified",
    probability: 75,
    source: "Inbound",
    priority: "High",
    assignedTo: "John Smith",
    products: [
      { id: 1, name: "Website Design", quantity: 1, unitPrice: 15000, total: 15000 },
      { id: 2, name: "Development", quantity: 1, unitPrice: 10000, total: 10000 }
    ],
    description: "Complete website redesign with modern UI/UX and responsive design",
    nextStep: "Schedule design review meeting",
    competitors: "WebFlow, SquareSpace",
    createdDate: "2024-01-15T10:00:00Z",
    modifiedDate: "2024-01-15T10:00:00Z",
    wonDate: null,
    lostDate: null,
    lostReason: null
  },
  {
    Id: 2,
    dealName: "TechStart Inc - CRM Implementation",
    contactId: 2,
    companyId: 2,
    amount: 50000,
    closeDate: "2024-04-20",
    stage: "Proposal",
    probability: 60,
    source: "Referral",
    priority: "Medium",
    assignedTo: "Sarah Johnson",
    products: [
      { id: 1, name: "CRM License", quantity: 50, unitPrice: 500, total: 25000 },
      { id: 2, name: "Implementation Services", quantity: 1, unitPrice: 25000, total: 25000 }
    ],
    description: "Full CRM implementation for growing tech startup",
    nextStep: "Present proposal to stakeholders",
    competitors: "Salesforce, HubSpot",
    createdDate: "2024-01-10T14:30:00Z",
    modifiedDate: "2024-01-12T09:15:00Z",
    wonDate: null,
    lostDate: null,
    lostReason: null
  },
  {
    Id: 3,
    dealName: "GlobalCorp - Training Program",
    contactId: 3,
    companyId: 1,
    amount: 15000,
    closeDate: "2024-02-28",
    stage: "Negotiation",
    probability: 85,
    source: "Outbound",
    priority: "High",
    assignedTo: "Mike Davis",
    products: [
      { id: 1, name: "Training Sessions", quantity: 10, unitPrice: 1200, total: 12000 },
      { id: 2, name: "Training Materials", quantity: 1, unitPrice: 3000, total: 3000 }
    ],
    description: "Comprehensive sales training program for enterprise team",
    nextStep: "Finalize contract terms",
    competitors: "SalesTraining Pro",
    createdDate: "2024-01-08T11:20:00Z",
    modifiedDate: "2024-01-14T16:45:00Z",
    wonDate: null,
    lostDate: null,
    lostReason: null
  }
];

function initializeStorage() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDeals));
  }
}

function getStoredDeals() {
  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveDeals(deals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getAll() {
  await delay(300);
  const deals = getStoredDeals();
  return [...deals];
}

export async function getById(id) {
  await delay(200);
  const deals = getStoredDeals();
  const deal = deals.find(d => d.Id === parseInt(id));
  return deal ? { ...deal } : null;
}

export async function create(dealData) {
  await delay(400);
  const deals = getStoredDeals();
  const maxId = deals.length > 0 ? Math.max(...deals.map(d => d.Id)) : 0;
  
  const newDeal = {
    ...dealData,
    Id: maxId + 1,
    createdDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
    wonDate: null,
    lostDate: null,
    lostReason: null
  };
  
  deals.push(newDeal);
  saveDeals(deals);
  return { ...newDeal };
}

export async function update(id, dealData) {
  await delay(400);
  const deals = getStoredDeals();
  const index = deals.findIndex(d => d.Id === parseInt(id));
  
  if (index === -1) {
    throw new Error('Deal not found');
  }
  
  deals[index] = {
    ...deals[index],
    ...dealData,
    Id: parseInt(id),
    modifiedDate: new Date().toISOString()
  };
  
  saveDeals(deals);
  return { ...deals[index] };
}

export async function deleteDeal(id) {
  await delay(300);
  const deals = getStoredDeals();
  const filteredDeals = deals.filter(d => d.Id !== parseInt(id));
  
  if (filteredDeals.length === deals.length) {
    throw new Error('Deal not found');
  }
  
  saveDeals(filteredDeals);
  return true;
}

// Helper function to get deals by stage for pipeline view
export async function getDealsByStage() {
  const deals = await getAll();
  const stages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  
  return stages.reduce((acc, stage) => {
    acc[stage] = deals.filter(deal => deal.stage === stage);
    return acc;
  }, {});
}

export async function updateDealStage(id, newStage) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const deals = JSON.parse(localStorage.getItem('deals') || '[]');
  const dealIndex = deals.findIndex(d => d.Id === parseInt(id));
  
  if (dealIndex === -1) {
    throw new Error('Deal not found');
  }

  const stageProbabilities = {
    'Lead': 10,
    'Qualified': 25, 
    'Proposal': 50,
    'Negotiation': 75,
    'Closed Won': 100,
    'Closed Lost': 0
  };

  deals[dealIndex] = {
    ...deals[dealIndex],
    stage: newStage,
    probability: stageProbabilities[newStage] || deals[dealIndex].probability,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem('deals', JSON.stringify(deals));
  return deals[dealIndex];
}

// Helper function to calculate total pipeline value
export async function getPipelineValue() {
  const deals = await getAll();
  const activeDealStages = ['Lead', 'Qualified', 'Proposal', 'Negotiation'];
  
  return deals
    .filter(deal => activeDealStages.includes(deal.stage))
    .reduce((total, deal) => total + deal.amount, 0);
}

export async function getStageMetrics() {
  const deals = await getAll();
  const stages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  
  return stages.reduce((acc, stage) => {
    const stageDeals = deals.filter(deal => deal.stage === stage);
    acc[stage] = {
      count: stageDeals.length,
      value: stageDeals.reduce((sum, deal) => sum + deal.amount, 0)
    };
    return acc;
  }, {});
}

// Default export object for component imports
const dealService = {
  getAll,
  getById,
  create,
  update,
  deleteDeal,
  getDealsByStage,
  getPipelineValue
};

export default dealService;