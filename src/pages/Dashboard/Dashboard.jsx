import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import StatCard from "../../components/dashboard/StatCard";
import DealsTable from "../../components/dashboard/DealsTable";
import dealstoday from "../../assets/dashboard/dealstoday.svg"
import buyamount from "../../assets/dashboard/buyamount.svg"
import sellamount from "../../assets/dashboard/sellamount.svg"
import profit from "../../assets/dashboard/profit.svg"
import add from "../../assets/dashboard/add.svg"
import { useNavigate } from "react-router-dom";
import { fetchDeals } from "../../api/deals";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    today: {
      count: 0,
      buyUSD: 0,
      sellUSD: 0,
      buyTZS: 0,
      sellTZS: 0,
      openingUSD: 0,
      openingTZS: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await fetchDeals({ dateFilter: "today" });
        if (response.stats) {
          setStats(response.stats);
        }
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  const getChangeText = (percentage) => {
    if (percentage === 0) return "";
    return `${percentage >= 0 ? "+" : ""}${percentage}% from yesterday`;
  };

  const formatValue = (val) => Number(val || 0).toLocaleString();

  return (
    <>
      <div className="flex items-center justify-between mb-6 lg:mb-10">
        <h1 className="text-white text-xl lg:text-[20px] font-semibold">Welcome back!</h1>
        <button
          className="
    flex items-center justify-center 
    w-auto px-3 lg:w-[173px] h-10 
    bg-[#1D4CB5] hover:bg-blue-600 
    text-white 
    rounded-lg 
    gap-2 lg:gap-2.5
    text-sm font-medium 
    cursor-pointer
    lg:mr-0
  "
          onClick={() => navigate('/deals/create-deal')}
        >
          <img src={add} alt="add" className="w-5 h-5" />
          <span className="lg:hidden">New Deal</span>
          <span className="hidden lg:inline">Create New Deal</span>
        </button>

      </div>

      {/* <p className="text-gray-400 mb-6">Welcome back!</p> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-10">
        <StatCard
          title="Today's Deals"
          value={stats.today?.count || 0}
          icon={dealstoday}
        />

        <StatCard
          title="Buy Amount"
          subValues={[
            { label: "USD", value: formatValue(stats.today?.buyUSD) },
            { label: "TZS", value: formatValue(stats.today?.buyTZS) },
          ]}
          icon={buyamount}
        />

        <StatCard
          title="Sell Amount"
          subValues={[
            { label: "USD", value: formatValue(stats.today?.sellUSD) },
            { label: "TZS", value: formatValue(stats.today?.sellTZS) },
          ]}
          icon={sellamount}
        />

        <StatCard
          title="Current Balance"
          subValues={[
            { label: "USD", value: formatValue((stats.today?.openingUSD || 0) + (stats.today?.buyUSD || 0) - (stats.today?.sellUSD || 0)) },
            { label: "TZS", value: formatValue((stats.today?.openingTZS || 0) + (stats.today?.buyTZS || 0) - (stats.today?.sellTZS || 0)) },
          ]}
          icon={profit}
        />
      </div>

      <div className="mt-8 ">
        {/* <h2 className="text-white text-lg font-semibold">Today's Deals</h2> */}
        <DealsTable />
      </div>
    </>
  );
}
