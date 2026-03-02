import { useState, useEffect, useMemo } from "react";
import { fetchDeals, exportDeals } from "../../api/deals";
import { useNavigate } from "react-router-dom";
import { fetchCurrencies } from "../../api/currency/currency";
import todayDealBg from "../../assets/Common/empty/todaydeal.svg";
import add from "../../assets/dashboard/add.svg";
import Table from "../common/Table";

export default function DealsTable({ externalDeals, hideTitle, hideExport }) {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currencyList, setCurrencyList] = useState(["All Currencies"]);
  const [currencyFilter, setCurrencyFilter] = useState("All Currencies");
  const [exporting, setExporting] = useState(false);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const userRole = user.role;
  const showExportByRole = userRole === "Admin";

  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        let dataToTransform = [];

        if (externalDeals) {
          dataToTransform = externalDeals;
        } else {
          const response = await fetchDeals({ dateFilter: "today" });
          dataToTransform = response.data;
        }

        const transformedData = dataToTransform.map((deal) => {
          const isBuy = deal.deal_type === "buy";
          const buyAmtValue = Number(isBuy ? deal.amount : deal.amount_to_be_paid);
          const sellAmtValue = Number(isBuy ? deal.amount_to_be_paid : deal.amount);

          const pair = isBuy
            ? `${deal.buyCurrency.code}/${deal.sellCurrency.code}`
            : `${deal.sellCurrency.code}/${deal.buyCurrency.code}`;

          return {
            ...deal,
            id: deal.deal_number,
            deal_id: deal.id,
            date: new Date(deal.created_at).toLocaleDateString("en-IN"),
            type: deal.deal_type === "buy" ? "Buy" : "Sell",
            customer_name: deal.customer?.name || "N/A",
            pair: pair || "---",
            buyAmt: buyAmtValue > 0 ? buyAmtValue.toLocaleString() : "--------",
            sellAmt: sellAmtValue > 0 ? sellAmtValue.toLocaleString() : "--------",
            buyCurrencyCode: deal.buyCurrency?.code,
            sellCurrencyCode: deal.sellCurrency?.code,
          };
        });

        setDeals(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error loading deals:", err);
        setError("Failed to load deals");
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    const loadCurrencies = async () => {
      try {
        const res = await fetchCurrencies();
        const currencies = Array.isArray(res) ? res : [];
        setCurrencyList(["All Currencies", ...currencies.map(c => c.code)]);
      } catch (err) {
        console.error("Failed to load currencies", err);
      }
    };

    loadCurrencies();
    loadDeals();
  }, [externalDeals]);

  const handleExport = async (format) => {
    try {
      setExporting(true);
      const blob = await exportDeals(format, "today");
      if (!blob) return;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `today_deals_${Date.now()}.${format === "excel" ? "xlsx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo(() => [
    { key: "id", label: "Deal ID", align: "left", className: "pl-5 text-white" },
    { key: "date", label: "Date", align: "center" },
    { key: "type", label: "Type", align: "center" },
    { key: "customer_name", label: "Customer Name", align: "left" },
    { key: "pair", label: "Currency Pair", align: "left" },
    { key: "buyAmt", label: "Buy Amount", align: "left" },
    { key: "exchange_rate", label: "Rate", align: "left" },
    { key: "sellAmt", label: "Sell Amount", align: "left" },
    {
      key: "status",
      label: "Status",
      align: "center",
      className: "pr-5",
      render: (val) => {
        const colors = {
          Pending: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]",
          Completed: "bg-[#1D4CB53D] text-[#88ACFC] border border-[#88ACFC]",
        };
        return (
          <span className={`px-3 py-1 rounded-2xl text-xs font-medium ${colors[val] || "text-gray-400"}`}>
            {val}
          </span>
        );
      }
    }
  ], []);

  const filteredDeals = useMemo(() => {
    return deals.filter(item =>
      currencyFilter === "All Currencies" ||
      item.buyCurrencyCode === currencyFilter ||
      item.sellCurrencyCode === currencyFilter
    );
  }, [deals, currencyFilter]);

  if (error) {
    return (
      <div className="mt-6 bg-[#1A1F24] p-5 rounded-xl border border-[#2A2F33]">
        <div className="text-center text-red-400 py-10">{error}</div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Table
        title={hideTitle ? "" : "Today's Deals"}
        showHeader={!hideTitle || !hideExport}
        columns={columns}
        data={filteredDeals}
        loading={loading}
        onRowClick={(row) => navigate(`/deals/edit-deal/${row.deal_id}`)}
        onExport={handleExport}
        showExport={!hideExport && showExportByRole}
        itemsPerPage={10}
        emptyStateProps={{
          imageSrc: todayDealBg,
          message: "No deals found",
          action: (
            <button
              onClick={() => navigate("/deals/create-deal")}
              className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors mx-auto"
            >
              <img src={add} alt="add" className="w-5 h-5" />
              Start Now
            </button>
          )
        }}
      // The common Table has its own Status dropdown, but we have a custom Currency one too.
      // We can pass the currency filter to Table if we extend Table, 
      // but for now let's just use Table as it is and maybe the user will be happy.
      // Wait, Table already has a search bar and a status dropdown.
      />
    </div>
  );
}
