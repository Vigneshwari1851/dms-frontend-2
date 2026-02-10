import { useState, useEffect, useRef } from "react";
import down from "../../assets/dashboard/down.svg";
import download from "../../assets/dashboard/download.svg";
import uparrowIcon from "../../assets/up_arrow.svg";
import downarrowIcon from "../../assets/down_arrow.svg";
import Dropdown from "../common/Dropdown";
import leftArrow from "../../assets/Common/left.svg";
import rightArrow from "../../assets/Common/right.svg";
import Pagination from "../common/Pagination";
import pdf from "../../assets/Common/pdf.svg";
import excel from "../../assets/Common/excel.svg";
import { fetchDeals, exportDeals } from "../../api/deals";
import { useNavigate } from "react-router-dom";
import { fetchCurrencies } from "../../api/currency/currency";
import EmptyState from "../common/EmptyState";
import todayDealBg from "../../assets/Common/empty/todaydeal.svg";
import add from "../../assets/dashboard/add.svg";

export default function DealsTable() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currencyList, setCurrencyList] = useState(["All Currencies"]);

  const exportRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setExportOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        const response = await fetchDeals({ dateFilter: "today" });

        // Transform API response to match table structure (use backend-provided amounts)
        const transformedData = response.data.map((deal) => {
          const isBuy = deal.deal_type === "buy";
          const buyAmtValue = Number(isBuy ? deal.amount : deal.amount_to_be_paid);
          const sellAmtValue = Number(isBuy ? deal.amount_to_be_paid : deal.amount);

          return {
            id: deal.deal_number,
            date: new Date(deal.created_at).toLocaleDateString("en-IN"),
            type: deal.deal_type === "buy" ? "Buy" : "Sell",
            customer: deal.customer.name,
            buyAmt: buyAmtValue > 0 ? buyAmtValue.toLocaleString() : "--------",
            currency: deal.buyCurrency.code || "---",
            exchange_rate: deal.exchange_rate,
            sellAmt: sellAmtValue > 0 ? sellAmtValue.toLocaleString() : "--------",
            currency1: deal.sellCurrency.code || "---",
            status: deal.status,
            dealId: deal.id,
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
        const list = ["All Currencies", ...currencies.map(c => c.code)];

        setCurrencyList(list);
      } catch (err) {
        console.error("Failed to load currencies", err);
        setCurrencyList(["All Currencies"]);
      }
    };

    loadCurrencies();
    loadDeals();
  }, []);

  const mockData = [
    {
      id: "D001",
      date: "2025/01/26",
      type: "Buy",
      customer: "Krishna",
      buyAmt: "50,000",
      currency: "USD",
      exchange_rate: "81.90",
      sellAmt: "30,000",
      currency1: "TZS",
      status: "Pending",
    },
    {
      id: "D002",
      date: "2025/01/26",
      type: "Sell",
      customer: "XYZ",
      buyAmt: "--------",
      currency: "GBP",
      rate: "92.10",
      sellAmt: "40,000",
      currency1: "EUR",
      status: "Completed",
    },
    {
      id: "D002",
      date: "2025/01/26",
      type: "Sell",
      customer: "XYZ",
      buyAmt: "30,000",
      currency: "GBP",
      rate: "92.10",
      sellAmt: "40,000",
      currency1: "EUR",
      status: "Completed",
    },
    {
      id: "D002",
      date: "2025/01/26",
      type: "Sell",
      customer: "XYZ",
      buyAmt: "30,000",
      currency: "GBP",
      rate: "92.10",
      sellAmt: "--------",
      currency1: "EUR",
      status: "Completed",
    },
    {
      id: "D002",
      date: "2025/01/26",
      type: "Sell",
      customer: "XYZ",
      buyAmt: "30,000",
      currency: "GBP",
      rate: "92.10",
      sellAmt: "40,000",
      currency1: "USD",
      status: "Completed",
    },
    {
      id: "D001",
      date: "2025/01/26",
      type: "Buy",
      customer: "Krishna",
      buyAmt: "50,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "60,000",
      currency1: "EUR",
      status: "Pending",
    },
    {
      id: "D001",
      date: "2025/01/26",
      type: "Buy",
      customer: "Krishna",
      buyAmt: "50,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "60,000",
      currency1: "EUR",
      status: "Pending",
    },
    {
      id: "D001",
      date: "2025/01/26",
      type: "Buy",
      customer: "Krishna",
      buyAmt: "50,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "60,000",
      currency1: "EUR",
      status: "Pending",
    },
    {
      id: "D001",
      date: "2025/01/26",
      type: "Buy",
      customer: "Krishna",
      buyAmt: "50,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "60,000",
      currency1: "EUR",
      status: "Completed",
    },
    {
      id: "D001",
      date: "2025/01/26",
      type: "Buy",
      customer: "Krishna",
      buyAmt: "50,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "60,000",
      currency1: "EUR",
      status: "Pending",
    },
    {
      id: "D001",
      date: "2025/01/26",
      type: "Buy",
      customer: "Krishna",
      buyAmt: "50,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "60,000",
      currency1: "EUR",
      status: "Pending",
    },
    {
      id: "D001",
      date: "2025/01/26",
      type: "Buy",
      customer: "Krishna",
      buyAmt: "50,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "60,000",
      currency1: "EUR",
      status: "Pending",
    },
  ];

  const statusColors = {
    Pending: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]",
    Completed: "bg-[#1D4CB53D] text-[##88ACFC] border border-[#88ACFC]",
  };

  const typeColors = {
    Buy: "bg-[#10B93524] text-[#10B935] border border-[#10B935]",
    Sell: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]",
  };

  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currencyFilter, setCurrencyFilter] = useState("All Currencies");
  const [exporting, setExporting] = useState(false);

  const [sortBy, setSortBy] = useState(null);     // "type" | "currency"
  const [sortAsc, setSortAsc] = useState(true);   // true = asc, false = desc

  const statuses = ["All Status", "Pending", "Completed"];
  const currencies = ["All Currencies", "USD", "EUR", "GBP"];

  const filteredData = deals.filter(
    (item) =>
      (statusFilter === "All Status" || item.status === statusFilter) &&
      (currencyFilter === "All Currencies" ||
        item.currency === currencyFilter)
  );

  let filteredAndSortedData = [...filteredData];

  if (sortBy === "type") {
    filteredAndSortedData.sort((a, b) =>
      sortAsc
        ? a.type.localeCompare(b.type)
        : b.type.localeCompare(a.type)
    );
  }

  if (sortBy === "currency") {
    filteredAndSortedData.sort((a, b) =>
      sortAsc
        ? a.currency.localeCompare(b.currency)
        : b.currency.localeCompare(a.currency)
    );
  }


  // -------- Pagination Logic --------
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = (deal) => {
    if (deal?.dealId) {
      navigate(`/deals/edit-deal/${deal.dealId}`);
    }
  };

  // const handleExport = async (format) => {
  //   try {
  //     setExporting(true);
  //     setExportOpen(false);

  //     await exportDeals(format, { dateFilter: "today" });

  //   } catch (e) {
  //     console.error("Export failed", e);
  //   } finally {
  //     setExporting(false);
  //   }
  // };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      setExportOpen(false);

      // Pass "today" as a string
      const blob = await exportDeals(format, "today");

      if (!blob) return;



    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setExporting(false);
    }
  };



  // -----------------------------------

  if (loading) {
    return (
      <div className="mt-6 bg-[#1A1F24] p-5 rounded-xl border border-[#2A2F33]">
        <div className="text-center text-gray-400 py-10">Loading deals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 bg-[#1A1F24] p-5 rounded-xl border border-[#2A2F33]">
        <div className="text-center text-red-400 py-10">{error}</div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-[#1A1F24] p-4 lg:p-5 rounded-xl">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
        <h2 className="text-white text-[16px] font-semibold">
          Today’s Deals
        </h2>

        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
          <Dropdown
            label="All Status"
            options={statuses}
            selected={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            className="w-full lg:w-[150px]"
          />

          <Dropdown
            label="All Currencies"
            options={currencyList}
            selected={currencyFilter}
            onChange={(value) => setCurrencyFilter(value)}
            className="w-full lg:w-[180px]"
          />

          <div className="relative w-full lg:w-auto" ref={exportRef}>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="w-full lg:px-5 py-2 bg-[#1D4CB5] hover:bg-[#173B8B] rounded-lg text-white font-medium flex items-center justify-center lg:justify-start gap-2 cursor-pointer"
            >
              <img src={download} alt="download" className="w-6 h-6" /> Export
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-2 w-full lg:w-28 bg-[#2E3439] border border-[#2A2D31] rounded-lg shadow-lg z-20 ">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-[#2A2F34] "
                  onClick={() => handleExport("pdf")}
                  disabled={exporting}
                >
                  <img src={pdf} alt="pdf" className="w-4 h-4" />
                  PDF
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-[#2A2F34]"
                  onClick={() => handleExport("excel")}
                  disabled={exporting}
                >
                  <img src={excel} alt="excel" className="w-4 h-4" />
                  Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t-[3px] border-[#16191C]  mt-4 pt-4 -mx-4 lg:-mx-5 px-4 lg:px-5"></div>

      {/* Table Container with Overflow */}
      <div className="-mx-4 lg:-mx-5 overflow-x-auto scrollbar-grey">
        {paginatedData.length === 0 ? (
          <EmptyState
            imageSrc={todayDealBg}
            message="No deals found for today"
            description="Get started by creating your first deal of the day"
            action={
              <button
                onClick={() => navigate("/deals/create-deal")}
                className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors mx-auto"
              >
                <img src={add} alt="add" className="w-5 h-5" />
                Create New Deal
              </button>
            }
          />
        ) : (
          <table className="min-w-[1000px] lg:min-w-full w-full text-center text-[#8F8F8F] font-normal text-[13px] border-collapse">
            <thead>
              <tr className="text-[#FFFFFF] text-[12px] font-normal">
                <th className="py-3 text-left pl-5">Deal ID</th>
                <th>Date</th>

                {/* TYPE SORT */}
                <th
                  className="py-3  cursor-pointer select-none "
                  onClick={() => {
                    if (sortBy === "type") setSortAsc(!sortAsc);
                    else {
                      setSortBy("type");
                      setSortAsc(true);
                    }
                  }}
                >
                  <div className="flex items-center gap-1 ml-2 justify-center ">
                    Type
                    <span className="flex flex-col ">
                      <img
                        src={uparrowIcon}
                        className={`w-3 h-3 -mt-[5px] ${!sortAsc ? "opacity-100" : "opacity-30"
                          }`}
                      />
                      <img
                        src={downarrowIcon}
                        className={`w-3 h-3 -mt-3 ml-1.5 ${sortAsc ? "opacity-100" : "opacity-30"
                          }`}
                      />
                    </span>
                  </div>
                </th>

                <th>Customer Name</th>
                <th>Buy Amount</th>

                {/* CURRENCY SORT */}
                <th
                  className="py-3 cursor-pointer select-none"
                  onClick={() => {
                    if (sortBy === "currency") setSortAsc(!sortAsc);
                    else {
                      setSortBy("currency");
                      setSortAsc(true);
                    }
                  }}

                >
                  <div className="flex items-center gap-1 ml-5 justify-center">
                    Currency
                    <span className="flex flex-col">
                      <img
                        src={uparrowIcon}
                        className={`w-3 h-3 -mt-[5px] ${!sortAsc ? "opacity-100" : "opacity-30"
                          }`}
                      />
                      <img
                        src={downarrowIcon}
                        className={`w-3 h-3 -mt-3 ml-1.5 ${sortAsc ? "opacity-100" : "opacity-30"
                          }`}
                      />
                    </span>
                  </div>
                </th>

                <th>Rate</th>
                <th>Sell Amount</th>
                <th >Currency</th>
                <th className="pr-5">Status</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className="rounded-2xl border-gray-800 hover:bg-[#151517] transition-colors cursor-pointer"
                  onClick={() => handleRowClick(item)}
                >
                  <td className="py-3 text-[#92B4FF] font-bold text-[14px] text-left pl-5">
                    {item.id}
                  </td>
                  <td>{item.date}</td>

                  <td>
                    <div className="flex justify-center items-center">
                      <span
                        className={`px-3 py-1 rounded-2xl text-xs font-medium ${typeColors[item.type]}`}
                      >
                        {item.type}
                      </span>
                    </div>
                  </td>

                  <td>{item.customer}</td>
                  <td>{item.buyAmt}</td>
                  <td>{item.currency}</td>
                  <td>{item.exchange_rate}</td>
                  <td>{item.sellAmt}</td>
                  <td>{item.currency1}</td>

                  <td>
                    <div className="flex justify-center items-center">
                      <span
                        className={`px-3 py-1 rounded-2xl text-xs font-medium ${statusColors[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ------------ Pagination (Right-Aligned) ------------ */}
      <div className="border-t-[3px] border-[#16191C]  mt-4 pt-4 -mx-5 px-5">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        />
      </div>

      {/* ------------------------------------------------------ */}
    </div>
  );
}
