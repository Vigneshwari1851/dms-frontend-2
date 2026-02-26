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
      currencies: {},
      openingBalances: {},
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
      <div className="flex items-center justify-between mb-4 lg:mb-4">
        <h1 className="text-white text-xl lg:text-[20px] font-semibold">Welcome back!</h1>
        <button
          className="
    flex items-center justify-center 
    w-auto px-3 lg:w-[173px] h-10 
    bg-[#1D4CB5] hover:bg-[#173B8B] 
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

      <div className="flex flex-wrap justify-center gap-4 lg:gap-10 mb-8">
        <div className="flex-1 min-w-[260px] max-w-[350px]">
          <StatCard
            title="Today's Deals"
            value={stats.today?.count || 0}
            icon={dealstoday}
          />
        </div>

        <div className="flex-1 min-w-[260px] max-w-[350px]">
          <StatCard
            title="Buy Amount"
            subValues={Object.keys(stats.today?.currencies || {}).map(code => ({
              label: code,
              value: formatValue(stats.today.currencies[code].buy)
            })).filter(sv => sv.value !== "0")}
            icon={buyamount}
          />
        </div>

        <div className="flex-1 min-w-[260px] max-w-[350px]">
          <StatCard
            title="Sell Amount"
            subValues={Object.keys(stats.today?.currencies || {}).map(code => ({
              label: code,
              value: formatValue(stats.today.currencies[code].sell)
            })).filter(sv => sv.value !== "0")}
            icon={sellamount}
          />
        </div>

        <div className="flex-1 min-w-[260px] max-w-[350px]">
          <StatCard
            title="Current Balance"
            subValues={Array.from(new Set([
              ...Object.keys(stats.today?.currencies || {}),
              ...Object.keys(stats.today?.openingBalances || {})
            ])).map(code => {
              const opening = stats.today?.openingBalances?.[code] || 0;
              const buy = stats.today?.currencies?.[code]?.buy || 0;
              const sell = stats.today?.currencies?.[code]?.sell || 0;
              return {
                label: code,
                value: formatValue(opening + buy - sell)
              };
            }).filter(sv => sv.value !== "0")}
            icon={profit}
          />
        </div>
      </div>

      <div className="mt-2">
        {/* <h2 className="text-white text-lg font-semibold">Today's Deals</h2> */}
        <DealsTable />
      </div>
    </>
  );
}
