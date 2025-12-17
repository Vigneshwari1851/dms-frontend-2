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
      dealCount: 0,
      buyAmount: 0,
      sellAmount: 0,
      profit: 0,
    },
    yesterdayPercentage: {
      dealCount: 0,
      buyAmount: 0,
      sellAmount: 0,
      profit: 0,
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getChangeText = (percentage) => {
    if (percentage === 0) return "No change from yesterday";
    return `${percentage >= 0 ? "+" : ""}${percentage}% from yesterday`;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-white text-2xl font-semibold">Welcome back!</h1>
        <button
          className="
    flex items-center 
    w-[173px] h-10 
    bg-[#1D4CB5] hover:bg-blue-600 
    text-white 
    px-2 py-2 
    rounded-lg 
    gap-2.5
    text-sm font-medium 
    cursor-pointer
  "
          onClick={() => navigate('/deals/create-deal')}
        >
          <img src={add} alt="add" className="w-5 h-5" />
          Create New Deal
        </button>

      </div>

      {/* <p className="text-gray-400 mb-6">Welcome back!</p> */}

      <div className="grid grid-cols-4 gap-10">
        <StatCard
          title="Total Deals Today"
          value={stats.today?.dealCount || 0}
          change={getChangeText(stats.yesterdayPercentage?.dealCount)}
          icon={dealstoday}
        />

        <StatCard
          title="Total Buy Amount"
          value={formatCurrency(stats.today?.buyAmount || 0)}
          change={getChangeText(stats.yesterdayPercentage?.buyAmount)}
          icon={buyamount}
        />

        <StatCard
          title="Total Sell Amount"
          value={formatCurrency(stats.today?.sellAmount || 0)}
          change={getChangeText(stats.yesterdayPercentage?.sellAmount)}
          icon={sellamount}
        />

        <StatCard
          title="Total Profit (TZS)"
          value={Number(stats.today?.profit || 0).toLocaleString()}
          change={getChangeText(stats.yesterdayPercentage?.profit)}
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
