import { useState, useEffect } from "react";
import DashboardStats from "@/components/organisms/DashboardStats";
import LeadStatusChart from "@/components/organisms/LeadStatusChart";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { contactService } from "@/services/api/contactService";
import { leadService } from "@/services/api/leadService";

const Dashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [contactsData, leadsData] = await Promise.all([
        contactService.getAll(),
        leadService.getAll()
      ]);
      
      setContacts(contactsData);
      setLeads(leadsData);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateStats = () => {
    const totalContacts = contacts.length;
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter(lead => lead.status === "qualified").length;
    const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

    return {
      totalContacts,
      totalLeads,
      qualifiedLeads,
      conversionRate,
      contactsTrend: 12,
      leadsTrend: 8,
      qualifiedTrend: 15,
      conversionTrend: 3,
    };
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  const stats = calculateStats();

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary-700 to-secondary-900 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-secondary-600">
          Overview of your customer relationships and lead pipeline
        </p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LeadStatusChart leads={leads} />
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {leads
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
              .slice(0, 5)
              .map((lead) => (
                <div key={lead.Id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div>
                    <p className="font-medium text-secondary-900">{lead.name}</p>
                    <p className="text-sm text-secondary-600">{lead.company}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      lead.status === "qualified" ? "bg-green-100 text-green-700" :
                      lead.status === "contacted" ? "bg-yellow-100 text-yellow-700" :
                      lead.status === "lost" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;