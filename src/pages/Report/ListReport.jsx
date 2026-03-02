import { useState, useEffect, useRef } from "react";
import bgIcon from "../../assets/report/bgimage.svg";
import download from "../../assets/dashboard/download.svg";
import pdf from "../../assets/Common/pdf.svg";
import excel from "../../assets/Common/excel.svg";
import Dropdown from "../../components/common/Dropdown";
import Pagination from "../../components/common/Pagination";
import uparrowIcon from "../../assets/up_arrow.svg";
import downarrowIcon from "../../assets/down_arrow.svg";
import CalendarMini from "../../components/common/CalendarMini";
import { fetchDeals, exportDeals } from "../../api/deals.jsx";
import { useNavigate } from "react-router-dom";
import dealEmptyBg from "../../assets/Common/empty/deal-bg.svg";
import EmptyState from "../../components/common/EmptyState";

export default function ListReport() {
  const navigate = useNavigate();
  const [tempDateRange, setTempDateRange] = useState("Today");
  const [tempStatusFilter, setTempStatusFilter] = useState("All Status");
  const [tempCurrencyFilter, setTempCurrencyFilter] = useState("All Currencies");
  const statuses = ["All Status", "Pending", "Completed"];
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    limit: 10,
  });

  const [dateRange, setDateRange] = useState("Today");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currencyFilter, setCurrencyFilter] = useState("All Currencies");
  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [format, setFormat] = useState("PDF report");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [sortBy, setSortBy] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [reportRows, setReportRows] = useState([]);
  const exportRef = useRef(null);
  const mobileExportRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        exportRef.current &&
        !exportRef.current.contains(event.target) &&
        (!mobileExportRef.current || !mobileExportRef.current.contains(event.target))
      ) {
        setExportOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dateRanges = ["Today", "Last 7 days", "Last 30 days", "Last 90 days", "Custom"];
  const formats = [
    { label: "PDF report", icon: pdf },
    { label: "Excel report", icon: excel },
  ];

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchReportData = async (page = pagination.page, currentFilters = {}) => {
    try {
      // Use overrides if provided (for immediate apply), otherwise fall back to state
      const activeDateRange = currentFilters.dateRange !== undefined ? currentFilters.dateRange : dateRange;
      const activeCurrency = currentFilters.currency !== undefined ? currentFilters.currency : currencyFilter;
      const activeStatus = currentFilters.status !== undefined ? currentFilters.status : statusFilter;

      const apiDateFilter = activeDateRange.toLowerCase().replace(" ", "");
      const { data, pagination: pag } = await fetchDeals({
        page,
        limit: pagination.limit,
        dateFilter: apiDateFilter === "custom" ? "custom" : apiDateFilter,
        ...(apiDateFilter === "custom" && { startDate: formatDate(customFrom), endDate: formatDate(customTo) }),
        currency: activeCurrency !== "All Currencies" ? activeCurrency : undefined,
        status: activeStatus !== "All Status" ? activeStatus : undefined // Ensure status is also passed if needed
      });

      const transformedData = (data || []).map(deal => {
        const isBuy = deal.deal_type?.toLowerCase() === "buy";
        const bAmt = isBuy ? (Number(deal.amount) || 0) : (Number(deal.amount_to_be_paid) || 0);
        const sAmt = isBuy ? (Number(deal.amount_to_be_paid) || 0) : (Number(deal.amount) || 0);

        return {
          ...deal,
          customerName: deal.customer?.name || "",
          buyAmount: bAmt.toLocaleString(),
          sellAmount: sAmt.toLocaleString(),
          buyAmountNumeric: bAmt,
          sellAmountNumeric: sAmt,
        };
      });

      setReportRows(transformedData);
      setPagination((prev) => ({
        ...prev,
        page: pag.page || page,
        totalPages: pag.totalPages || 1,
      }));
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    }
  };

  const handleApplyFilters = async (overrideDateRange = null) => {
    setPagination((prev) => ({ ...prev, page: 1 }));

    // Use the override ONLY if it's a valid string (e.g. "Custom" from modal)
    // Ignore if it's an Event object (from onClick) or null
    const effectiveDateRange = (typeof overrideDateRange === 'string') ? overrideDateRange : tempDateRange;

    setDateRange(effectiveDateRange);
    setStatusFilter(tempStatusFilter);
    setCurrencyFilter(tempCurrencyFilter);

    await fetchReportData(1, {
      dateRange: effectiveDateRange,
      status: tempStatusFilter,
      currency: tempCurrencyFilter
    });
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      setExportOpen(false);

      // Pass "today" as a string
      const blob = await exportDeals(format);

      if (!blob) return;



    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setExporting(false);
    }
  };

  const filteredData = reportRows.filter((item) => {
    if (statusFilter === "All Status") return true;
    return item.status === statusFilter;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0;

    if (sortBy === "pair") {
      const isBuyA = a.deal_type.toLowerCase() === "buy";
      const isBuyB = b.deal_type.toLowerCase() === "buy";
      const pairA = isBuyA ? `${a.buyCurrency?.code}/${a.sellCurrency?.code}` : `${a.sellCurrency?.code}/${a.buyCurrency?.code}`;
      const pairB = isBuyB ? `${b.buyCurrency?.code}/${b.sellCurrency?.code}` : `${b.sellCurrency?.code}/${b.buyCurrency?.code}`;
      return sortAsc ? pairA.localeCompare(pairB) : pairB.localeCompare(pairA);
    }

    if (sortBy === "buyAmount") {
      return sortAsc ? a.buyAmountNumeric - b.buyAmountNumeric : b.buyAmountNumeric - a.buyAmountNumeric;
    }

    if (sortBy === "sellAmount") {
      return sortAsc ? a.sellAmountNumeric - b.sellAmountNumeric : b.sellAmountNumeric - a.sellAmountNumeric;
    }

    if (sortBy === "exchange_rate") {
      const rateA = Number(a.exchange_rate) || 0;
      const rateB = Number(b.exchange_rate) || 0;
      return sortAsc ? rateA - rateB : rateB - rateA;
    }

    let valA = a[sortBy];
    let valB = b[sortBy];

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusColors = {
    Pending: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]",
    Completed: "bg-[#1D4CB53D] text-[#88ACFC] border border-[#88ACFC]",
  };
  const typeColors = {
    buy: "bg-[#10B93524] text-[#10B935] border border-[#10B935]",
    sell: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]",
  };

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(columnKey);
      setSortAsc(true);
    }
  };

  return (
    <>
      <div className="flex flex-row items-center justify-between gap-4">
        <h1 className="text-white text-lg lg:text-[20px] font-semibold">Reports & Analytics</h1>
        <div className="relative hidden lg:block" ref={exportRef}>
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="p-2 lg:px-5 lg:py-2 bg-[#1D4CB5] hover:bg-[#173B8B] rounded-lg text-white font-medium flex items-center gap-2 cursor-pointer"
          >
            <img src={download} alt="download" className="w-6 h-6" />
            <span className="hidden lg:inline">Export</span>
          </button>

          {exportOpen && (
            <div className="absolute right-0 mt-2 w-28 bg-[#2E3439] border border-[#2A2D31] rounded-lg shadow-lg z-20 cursor-pointer">
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

      <p className="text-gray-400 mb-6">
        Generate insights and export business data
      </p>

      {/* Filters */}
      <div className="bg-[#1A1D23] p-4 lg:p-5 rounded-xl mt-4">

        {/* MOBILE LAYOUT */}
        <div className="flex flex-col gap-4 lg:hidden">

          {/* Date + Status in same row */}
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-gray-300 text-sm">Date Range</label>
              <Dropdown
                label={tempDateRange}
                options={dateRanges}
                onChange={(value) => {
                  setTempDateRange(value);
                  if (value === "Custom") setShowCustomModal(true);
                }}
              />
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <label className="text-gray-300 text-sm">Status</label>
              <Dropdown
                label={tempStatusFilter}
                options={statuses}
                onChange={(value) => setTempStatusFilter(value)}
              />
            </div>
          </div>

          {/* Apply */}
          <button
            className="w-full bg-[#1D4CB5] hover:bg-[#173B8B] text-white h-10 rounded-md text-sm font-medium"
            onClick={handleApplyFilters}
          >
            Apply
          </button>

          {/* Export */}
          <div className="relative" ref={mobileExportRef}>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="w-full bg-[#1D4CB5] hover:bg-[#173B8B] text-white h-10 rounded-md flex items-center justify-center gap-2"
            >
              <img src={download} className="w-5 h-5" />
              Export
            </button>

            {exportOpen && (
              <div className="absolute mt-2 w-full bg-[#2E3439] border border-[#2A2D31] rounded-lg z-20">
                <button
                  className="w-full px-4 py-2 text-sm text-white hover:bg-[#2A2F34] flex gap-2"
                  onClick={() => handleExport("pdf")}
                >
                  <img src={pdf} className="w-4 h-4" /> PDF
                </button>
                <button
                  className="w-full px-4 py-2 text-sm text-white hover:bg-[#2A2F34] flex gap-2"
                  onClick={() => handleExport("excel")}
                >
                  <img src={excel} className="w-4 h-4" /> Excel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP LAYOUT – UNTOUCHED */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">

          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-sm">Date Range</label>
            <Dropdown
              label={tempDateRange}
              options={dateRanges}
              onChange={(value) => {
                setTempDateRange(value);
                if (value === "Custom") setShowCustomModal(true);
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-sm">Status</label>
            <Dropdown
              label={tempStatusFilter}
              options={statuses}
              onChange={(value) => setTempStatusFilter(value)}
            />
          </div>

          <div className="flex items-end">
            <button
              className="bg-[#1D4CB5] hover:bg-[#173B8B] text-white px-4 h-10 rounded-md text-sm font-medium"
              onClick={handleApplyFilters}
            >
              Apply
            </button>
          </div>

        </div>
      </div>


      {/* CUSTOM DATE MODAL */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1D23] p-6 rounded-xl w-full max-w-[650px] mx-4 border border-[#2A2D33] shadow-lg">
            <h2 className="text-white text-lg font-semibold mb-4">
              Select Date Range
            </h2>

            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="flex-1">
                <label className="text-gray-300 mb-2 text-sm">From:</label>
                <CalendarMini
                  selectedDate={customFrom}
                  onDateSelect={(date) => {
                    console.log("fromdate:", date);
                    setCustomFrom(date);
                  }}
                />
              </div>

              <div className="flex-1">
                <label className="text-gray-300 mb-2 text-sm">To:</label>
                <CalendarMini
                  selectedDate={customTo}
                  onDateSelect={(date) => {
                    console.log("todate:", date);
                    setCustomTo(date);
                  }}
                  disabled={!customFrom}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded-md"
                onClick={() => {
                  setShowCustomModal(false);
                  setTempDateRange("Today");
                }}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-[#1D4CB5] hover:bg-[#173B8B] text-white rounded-md disabled:opacity-40"
                onClick={async () => {
                  setShowCustomModal(false);
                  setTempDateRange("Custom");
                  await handleApplyFilters("Custom");
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="mt-2 w-full scrollbar-grey">
        {paginatedData.length === 0 ? (
          <div className="bg-[#1A1F24] p-5 rounded-xl overflow-x-auto scrollbar-grey text-center">
            <EmptyState
              imageSrc={dealEmptyBg}
              message="Looks like no report data is available"
            />
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-[#1A1F24] rounded-t-lg px-3 lg:px-5 py-4">
              <div className="flex justify-between items-center text-left">
                <h2 className="text-white text-[16px] font-semibold">
                  {dateRange === "Today" && "Today's Report"}
                  {dateRange === "Last 7 days" && "This Week's Report"}
                  {dateRange === "Last 30 days" && "This Month's Report"}
                  {dateRange === "Last 90 days" && "Three Month's Report"}
                  {dateRange === "Custom" && "Custom Report"}
                </h2>
              </div>
            </div>

            {/* Table Body */}
            <div className="bg-[#1A1F24] mt-[1.5px] overflow-x-auto scrollbar-grey">
              <table className="w-full text-center text-[#8F8F8F] font-normal text-[13px] min-w-[1000px]">
                <thead>
                  <tr className="text-[#FFFFFF] text-[12px] font-normal">
                    <th className="py-3 text-left pl-5">Deal ID</th>
                    <th className="text-left">Date</th>

                    {/* TYPE SORT */}
                    <th
                      className="py-3 cursor-pointer select-none"
                      onClick={() => handleSort("deal_type")}
                    >
                      <div className="flex items-center gap-1 justify-center">
                        Type
                        <span className="flex flex-col">
                          <img
                            src={uparrowIcon}
                            className={`w-3 h-3 -mt-[5px] ${sortBy === "deal_type" && !sortAsc ? "opacity-100" : "opacity-30"
                              }`}
                          />
                          <img
                            src={downarrowIcon}
                            className={`w-3 h-3 -mt-3 ml-1.5 ${sortBy === "deal_type" && sortAsc ? "opacity-100" : "opacity-30"
                              }`}
                          />
                        </span>
                      </div>
                    </th>

                    <th className="text-left">Customer</th>
                    {/* CURRENCY SORT */}
                    <th className="text-left">Currency Pair</th>
                    <th className="text-left">Buy Amount</th>
                    <th className="text-left">Rate</th>
                    <th className="text-left">Sell Amount</th>
                    <th className="text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.map((item, index) => (
                    <tr
                      key={index}
                      className="h-11 rounded-2xl odd:bg-[#16191C] hover:bg-[#151517] transition-colors cursor-pointer"
                      onClick={() => navigate(`/deals/edit-deal/${item.id}`)}
                    >
                      <td className="py-1.5 text-left pl-5 text-white text-[14px]">
                        {item.deal_number}
                      </td>

                      <td className="text-left">{new Date(item.created_at).toLocaleDateString()}</td>

                      {/* TYPE PILL */}
                      <td>
                        <div className="flex justify-center items-center">
                          <span
                            className={`px-3 py-1 rounded-2xl text-xs font-medium ${typeColors[item.deal_type]
                              }`}
                          >
                            {item.deal_type.toUpperCase()}
                          </span>
                        </div>
                      </td>

                      <td className="text-left">{item.customer?.name}</td>
                      <td className="text-left">
                        {item.deal_type.toLowerCase() === "buy"
                          ? `${item.buyCurrency?.code}/${item.sellCurrency?.code}`
                          : `${item.sellCurrency?.code}/${item.buyCurrency?.code}`
                        }
                      </td>
                      <td className="text-left">{item.buyAmount}</td>
                      <td className="text-left">{item.exchange_rate}</td>
                      <td className="text-left">{item.sellAmount}</td>

                      {/* STATUS */}
                      <td className="text-left">
                        <div className="flex justify-center items-center">
                          <span
                            className={`px-3 py-1 rounded-2xl text-xs font-medium ${statusColors[item.status]
                              }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Section */}
            <div className="bg-[#1A1F24] rounded-b-lg mt-[1.5px] p-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPrev={() => {
                  if (pagination.page > 1) fetchReportData(pagination.page - 1);
                }}
                onNext={() => {
                  if (pagination.page < pagination.totalPages) fetchReportData(pagination.page + 1);
                }}
              />
            </div>
          </>
        )}
      </div>

    </>
  );
}
