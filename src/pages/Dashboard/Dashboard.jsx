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
import { fetchReconcoliation } from "../../api/reconcoliation";
import { isSameDay } from "date-fns";

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
        const [dealsResponse, reconResponse] = await Promise.all([
          fetchDeals({ dateFilter: "today", limit: 100, userOnly: false }),
          fetchReconcoliation({ limit: 20, userOnly: false }) 
        ]);

        const storedUser = JSON.parse(localStorage.getItem("user")) || {};
        const currentUserId = storedUser.user_id;

        const today = new Date();

        // Today's Recon (to determine closing display)
        const userReconToday = (reconResponse.data || []).find(r => 
          isSameDay(new Date(r.created_at), today)
        );

        // Next Day Recon
        const hasNextDayRecon = (reconResponse.data || []).some(r => 
          new Date(r.created_at).setHours(0,0,0,0) > today.setHours(0,0,0,0)
        );

        // Use backend stats directly as they are now filtered with userOnly: true
        if (dealsResponse.stats) {
          setStats(dealsResponse.stats);
        }

        // Show closing balances only if next day recon has come up
        if (userReconToday && hasNextDayRecon) {
          setStats(prev => ({
            ...prev,
            currentRate: userReconToday.setRate || 0,
            currentPnL: userReconToday.profitLoss || 0,
            reconBalances: userReconToday.closingEntries?.reduce((acc, curr) => {
              const code = curr.currency?.code || "TZS";
              acc[code] = (acc[code] || 0) + Number(curr.amount);
              return acc;
            }, {})
          }));
        } else if (userReconToday) {
           // Until next day recon, keep reconBalances empty so StatCard calculates dynamic balance
           setStats(prev => ({
             ...prev,
             currentRate: userReconToday.setRate || 0,
             currentPnL: userReconToday.profitLoss || 0,
             reconBalances: {} 
           }));
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

  const allCurrencyCodes = Array.from(new Set([
    ...Object.keys(stats.today?.currencies || {}),
    ...Object.keys(stats.today?.openingBalances || {})
  ])).filter(code => {
    const buy = stats.today?.currencies?.[code]?.buy || 0;
    const sell = stats.today?.currencies?.[code]?.sell || 0;
    const opening = stats.today?.openingBalances?.[code] || 0;
    return buy !== 0 || sell !== 0 || opening !== 0;
  });

  const isMultiCurrency = allCurrencyCodes.length > 2;

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


      <div className={`grid grid-cols-1 md:grid-cols-2 ${stats.today?.count > 0 ? 'lg:grid-cols-5' : 'lg:grid-cols-3'} gap-4 lg:gap-6 mb-4`}>
        <StatCard
          title="Today's Deals"
          value={stats.today?.count || 0}
          icon={dealstoday}
        />
        <StatCard
          title="Txn Snapshot"
          icon={buyamount}
          subValues={[
            {
              label: "Buy Amt",
              value: `TZS ${Number(stats.today?.currencies?.["TZS"]?.buy || 0).toLocaleString()}`,
            },
            {
              label: "Sell Amt",
              value: `TZS ${Number(stats.today?.currencies?.["TZS"]?.sell || 0).toLocaleString()}`,
            },
          ]}
        />
        <StatCard
          title="Current Balance"
          icon={sellamount}
          subValues={Object.entries(stats.reconBalances || {}).length > 0
            ? Object.entries(stats.reconBalances).map(([code, balance]) => ({
              label: code,
              value: formatValue(balance),
            }))
            : allCurrencyCodes.map(code => {
              const opening = stats.today?.openingBalances?.[code] || 0;
              const buy = stats.today?.currencies?.[code]?.buy || 0;
              const sell = stats.today?.currencies?.[code]?.sell || 0;
              const balance = opening + buy - sell;
              return {
                label: code,
                value: formatValue(balance)
              };
            }).filter(sv => sv.value !== "0")
          }
        />
        {stats.today?.count > 0 && (
          <>
            <StatCard
              title="Day's Avg Fx Rate"
              value={`TZS ${Number(stats.currentRate || 0).toFixed(2)}`}
              icon={buyamount}
            />

            <StatCard
              title="Day's P&L"
              value={`TZS ${Number(stats.currentPnL || 0).toLocaleString()}`}
              icon={profit}
              color={stats.currentPnL >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}
            />
          </>
        )}
      </div>

      <div className="mt-2">
        {/* <h2 className="text-white text-lg font-semibold">Today's Deals</h2> */}
        <DealsTable />
      </div>
    </>
  );
}
