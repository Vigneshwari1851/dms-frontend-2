import AppLayout from "../../components/layout/AppLayout";
import StatCard from "../../components/dashboard/StatCard";
import DealsTable from "../../components/dashboard/DealsTable";
import dealstoday from "../../assets/dashboard/dealstoday.svg"
import buyamount from "../../assets/dashboard/buyamount.svg"
import sellamount from "../../assets/dashboard/sellamount.svg"
import profit from "../../assets/dashboard/profit.svg"
import add from "../../assets/dashboard/add.svg"

export default function Dashboard() {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-white text-2xl font-semibold">Dashboard</h1>
        <button className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-blue-600 h-10 text-white px-4 py-2 rounded-md text-sm font-medium">
          <img src={add} alt="add" className="w-5 h-5" />
          Create New Deal
        </button>
      </div>

      <p className="text-gray-400 mb-6">Welcome back!</p>

      <div className="grid grid-cols-4 gap-5">
        <StatCard
          title="Total Deals Today"
          value="24"
          change="+12% from yesterday"
          icon={dealstoday}
        />

        <StatCard
          title="Total Buy Amount"
          value="$482,500"
          change="+8.4 from yesterday"
          icon={buyamount}
        />

        <StatCard
          title="Total Sell Amount"
          value="$482,500"
          change="-1.2% from yesterday"
          icon={sellamount}
        />

        <StatCard
          title="Total Profit (TZS)"
          value="12,458,000"
          change="+15.2 from yesterday"
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
