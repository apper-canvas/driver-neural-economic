import MetricCard from "@/components/molecules/MetricCard";

const DashboardStats = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-secondary-200 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-secondary-200 rounded w-20" />
                <div className="h-8 bg-secondary-200 rounded w-12" />
              </div>
              <div className="w-12 h-12 bg-secondary-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Contacts"
        value={stats.totalContacts}
        icon="Users"
        trend={stats.contactsTrend && {
          type: "increase",
          value: `+${stats.contactsTrend}% this month`
        }}
      />
      
      <MetricCard
        title="Total Leads"
        value={stats.totalLeads}
        icon="TrendingUp"
        trend={stats.leadsTrend && {
          type: "increase",
          value: `+${stats.leadsTrend}% this month`
        }}
      />
      
      <MetricCard
        title="Qualified Leads"
        value={stats.qualifiedLeads}
        icon="Target"
        trend={stats.qualifiedTrend && {
          type: "increase",
          value: `+${stats.qualifiedTrend}% this month`
        }}
      />
      
      <MetricCard
        title="Conversion Rate"
        value={`${stats.conversionRate}%`}
        icon="TrendingUp"
        trend={stats.conversionTrend && {
          type: stats.conversionTrend > 0 ? "increase" : "decrease",
          value: `${stats.conversionTrend > 0 ? "+" : ""}${stats.conversionTrend}% this month`
        }}
      />
    </div>
  );
};

export default DashboardStats;