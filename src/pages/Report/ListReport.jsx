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
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  const convertDMYtoYMD = (dmy) => {
    if (!dmy) return "";
    const [day, month, year] = dmy.split("-");
    return `${year}-${month}-${day}`;
  };

  const fetchReportData = async (page = pagination.page) => {
    try {
      const apiDateFilter = dateRange.toLowerCase().replace(" ", "");
      const { data, pagination: pag } = await fetchDeals({
        page,
        limit: pagination.limit,
        dateFilter: apiDateFilter === "custom" ? "custom" : apiDateFilter,
        ...(apiDateFilter === "custom" && { startDate: customFrom, endDate: customTo }),
        currency: currencyFilter !== "All Currencies" ? currencyFilter : undefined,
      });

      setReportRows(data || []);
      setPagination((prev) => ({
        ...prev,
        page: pag.page || page,
        totalPages: pag.totalPages || 1,
      }));
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    }
  };

  const handleApplyFilters = async () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setDateRange(tempDateRange);
    setStatusFilter(tempStatusFilter);
    setCurrencyFilter(tempCurrencyFilter);

    await fetchReportData(1);
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
        <h1 className="text-white text-lg lg:text-2xl font-semibold">Reports & Analytics</h1>
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
        <div className="flex flex-row items-end gap-3 lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="flex flex-col flex-1 lg:flex-none">
            <label className="text-gray-300 mb-2 text-sm">Date Range</label>
            <Dropdown
              label={tempDateRange}
              options={dateRanges}
              onChange={(value) => {
                setTempDateRange(value);
                if (value === "Custom") setShowCustomModal(true);
              }}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-300 mb-2 text-sm">Status</label>
            <Dropdown
              label={tempStatusFilter}
              options={statuses}
              onChange={(value) => setTempStatusFilter(value)}
            />
          </div>

          <div className="flex lg:mt-6">
            <button
              className="bg-[#1D4CB5] hover:bg-[#173B8B] text-white px-4 h-10 rounded-md text-sm font-medium whitespace-nowrap"
              onClick={handleApplyFilters}
            >
              Apply
            </button>
          </div>

          {/* Mobile Export Button */}
          <div className="relative lg:hidden" ref={mobileExportRef}>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="bg-[#1D4CB5] hover:bg-[#173B8B] text-white w-10 h-10 rounded-md flex items-center justify-center"
            >
              <img src={download} alt="download" className="w-5 h-5" />
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-[#2E3439] border border-[#2A2D31] rounded-lg shadow-lg z-20 cursor-pointer">
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
                    const formatted = convertDMYtoYMD(date);
                    console.log("formattedFrom:", formatted);
                    setCustomFrom(formatted);
                  }}
                />
              </div>

              <div className="flex-1">
                <label className="text-gray-300 mb-2 text-sm">To:</label>
                <CalendarMini
                  selectedDate={customTo}
                  onDateSelect={(date) => {
                    console.log("todate:", date);
                    const formatted = convertDMYtoYMD(date);
                    console.log("formattedTo:", formatted);
                    setCustomTo(formatted);
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
                onClick={() => {
                  setShowCustomModal(false);
                  setTempDateRange("Custom");
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-2 bg-[#1A1F24] p-5 rounded-xl overflow-x-auto">
        {paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <img src={bgIcon} alt="No Data" className="w-72 opacity-80" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-[16px] font-semibold">
                {dateRange === "Today" && "Today's Report"}
                {dateRange === "Last 7 days" && "This Week's Report"}
                {dateRange === "Last 30 days" && "This Month's Report"}
                {dateRange === "Last 90 days" && "Three Month's Report"}
                {dateRange === "Custom" && "Custom Report"}
              </h2>
            </div>

            <table className="w-full text-center text-[#8F8F8F] font-normal text-[13px] min-w-[1000px]">
              <thead>
                <tr className="text-[#FFFFFF] text-[12px] font-normal">
                  <th className="py-3">Deal ID</th>
                  <th>Date</th>

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

                  <th>Customer</th>
                  <th>Buy Amount</th>

                  {/* CURRENCY SORT */}
                  <th
                    className="py-3 cursor-pointer select-none"
                    onClick={() => handleSort("buyCurrency")}
                  >
                    <div className="flex items-center gap-1 justify-center">
                      Currency
                      <span className="flex flex-col">
                        <img
                          src={uparrowIcon}
                          className={`w-3 h-3 -mt-[5px] ${sortBy === "buyCurrency" && !sortAsc ? "opacity-100" : "opacity-30"
                            }`}
                        />
                        <img
                          src={downarrowIcon}
                          className={`w-3 h-3 -mt-3 ml-1.5 ${sortBy === "buyCurrency" && sortAsc ? "opacity-100" : "opacity-30"
                            }`}
                        />
                      </span>
                    </div>
                  </th>

                  <th>Rate</th>
                  <th>Sell Amount</th>
                  <th>Currency</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((item, index) => (
                  <tr
                    key={index}
                    className="rounded-2xl hover:bg-[#151517] transition-colors cursor-pointer"
                    onClick={() => navigate(`/deals/edit-deal/${item.id}`)}
                  >
                    <td className="py-3 text-[#92B4FF] font-bold text-[14px]">
                      {item.deal_number}
                    </td>

                    <td>{new Date(item.created_at).toLocaleDateString()}</td>

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

                    <td>{item.customer?.name}</td>

                    <td>{item.buyAmount}</td>
                    <td>{item.buyCurrency.code}</td>

                    <td>{item.exchange_rate}</td>

                    <td>{item.sellAmount}</td>
                    <td>{item.sellCurrency.code}</td>

                    {/* STATUS */}
                    <td>
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
          </>
        )}
      </div>

    </>
  );
}
