import { useEffect, useState } from "react";
import Chart from "react-apexcharts";

const LeadStatusChart = ({ leads, loading = false }) => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: "donut",
        height: 350,
        toolbar: {
          show: false,
        },
      },
      labels: ["New", "Contacted", "Qualified", "Lost"],
      colors: ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"],
      legend: {
        position: "bottom",
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        markers: {
          width: 12,
          height: 12,
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: "60%",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "16px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                color: "#374151",
              },
              value: {
                show: true,
                fontSize: "24px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                color: "#111827",
              },
              total: {
                show: true,
                showAlways: false,
                label: "Total Leads",
                fontSize: "16px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                color: "#6b7280",
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          colors: ["#ffffff"],
        },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: {
              height: 300,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  });

  useEffect(() => {
    if (leads && leads.length > 0) {
      const statusCounts = {
        new: leads.filter(lead => lead.status === "new").length,
        contacted: leads.filter(lead => lead.status === "contacted").length,
        qualified: leads.filter(lead => lead.status === "qualified").length,
        lost: leads.filter(lead => lead.status === "lost").length,
      };

      setChartData(prev => ({
        ...prev,
        series: [
          statusCounts.new,
          statusCounts.contacted,
          statusCounts.qualified,
          statusCounts.lost,
        ],
      }));
    }
  }, [leads]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200">
        <div className="animate-pulse">
          <div className="h-6 bg-secondary-200 rounded w-40 mb-4" />
          <div className="h-80 bg-secondary-100 rounded" />
        </div>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          Lead Status Distribution
        </h3>
        <div className="flex items-center justify-center h-80 text-secondary-500">
          <div className="text-center">
            <p className="text-lg mb-2">No leads data available</p>
            <p className="text-sm">Add some leads to see the distribution chart</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200">
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">
        Lead Status Distribution
      </h3>
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="donut"
        height="350"
      />
    </div>
  );
};

export default LeadStatusChart;