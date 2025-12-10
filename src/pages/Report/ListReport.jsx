import { useState } from "react";
import bgIcon from "../../assets/report/bgimage.svg";
import downloadIcon from "../../assets/dashboard/download.svg";
import pdf from "../../assets/common/pdf.svg";
import excel from "../../assets/common/excel.svg";
import Dropdown from "../../components/common/Dropdown";
import Pagination from "../../components/common/Pagination";
import uparrowIcon from "../../assets/up_arrow.svg";
import downarrowIcon from "../../assets/down_arrow.svg";
import CalendarMini from "../../components/common/CalendarMini";
import { fetchDeals } from "../../api/deals";

export default function ListReport() {
  const [tempDateRange, setTempDateRange] = useState("Today");
  const [tempStatusFilter, setTempStatusFilter] = useState("All Status");
  const [tempCurrencyFilter, setTempCurrencyFilter] = useState("All Currencies");

  const [dateRange, setDateRange] = useState("Today");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currencyFilter, setCurrencyFilter] = useState("All Currencies");

  const [format, setFormat] = useState("PDF report");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [sortBy, setSortBy] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [reportRows, setReportRows] = useState([]);

  const dateRanges = ["Today", "Last 7 days", "Last 30 days", "Last 90 days", "Custom"];
  const formats = [
    { label: "PDF report", icon: pdf },
    { label: "Excel report", icon: excel },
  ];

  const formatDate = (date) => {
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  const handleApplyFilters = async () => {
    let apiDateFilter = "";
    let finalStart = "";
    let finalEnd = "";

    const today = formatDate(new Date());

    if (tempDateRange === "Today") {
      apiDateFilter = "custom";
      finalStart = today;
      finalEnd = today;

      setCustomFrom(today);
      setCustomTo(today);
    }

    else if (tempDateRange === "Last 7 days") apiDateFilter = "last7";
    else if (tempDateRange === "Last 30 days") apiDateFilter = "last30";
    else if (tempDateRange === "Last 90 days") apiDateFilter = "last90";

    else if (tempDateRange === "Custom") {
      apiDateFilter = "custom";
      finalStart = customFrom;
      finalEnd = customTo;
    }

    setDateRange(tempDateRange);
    setStatusFilter(tempStatusFilter);
    setCurrencyFilter(tempCurrencyFilter);
    setCurrentPage(1);

    const { data } = await fetchDeals({
      dateFilter: apiDateFilter,
      ...(apiDateFilter === "custom" && {
        startDate: finalStart,
        endDate: finalEnd,
      }),
    });

    setReportRows(data || []);
  };

  const filteredData = reportRows.filter(
    (item) =>
      (statusFilter === "All Status" || item.status === statusFilter) &&
      (currencyFilter === "All Currencies" || item.buyCurrency === currencyFilter) &&
      (item.deal_number?.toLowerCase().includes(search.toLowerCase()) ||
        item.customer_name?.toLowerCase().includes(search.toLowerCase()))
  );

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
      <div className="flex items-center justify-between">
        <h1 className="text-white text-2xl font-semibold">Reports & Analytics</h1>
        <button className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-md text-sm font-medium">
          <img src={downloadIcon} alt="export" className="w-5 h-5" />
          Export
        </button>
      </div>

      <p className="text-gray-400 mb-6">
        Generate insights and export business data
      </p>

      {/* Filters */}
      <div className="bg-[#1A1D23] p-5 rounded-xl mt-4">
        <div className="grid grid-cols-3 gap-6">
          <div className="flex flex-col">
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
            <label className="text-gray-300 mb-2 text-sm">Format</label>
            <Dropdown
              label={format}
              options={formats}
              onChange={(value) => setFormat(value.label)}
              renderOption={(option) => (
                <div className="flex items-center gap-2">
                  <img src={option.icon} alt={option.label} className="w-4 h-4" />
                  <span>{option.label}</span>
                </div>
              )}
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              className="bg-[#1D4CB5] hover:bg-[#173B8B] text-white px-5 h-10 rounded-md text-sm font-medium"
              onClick={handleApplyFilters}
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>

      {/* CUSTOM DATE MODAL */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1D23] p-6 rounded-xl w-[650px] border border-[#2A2D33] shadow-lg">
            <h2 className="text-white text-lg font-semibold mb-4">
              Select Date Range
            </h2>

            <div className="flex justify-between gap-6">
              <div className="flex-1">
                <label className="text-gray-300 mb-2 text-sm">From:</label>
                <CalendarMini
                  selectedDate={customFrom}
                  onDateSelect={(date) => {
                    console.log("fromdate", date);               // log the raw date
                    setCustomFrom(formatDate(date)); // save formatted date
                  }}/>
              </div>

              <div className="flex-1">
                <label className="text-gray-300 mb-2 text-sm">To:</label>
                <CalendarMini
                  selectedDate={customTo}
                  onDateSelect={(date) => {
                                        console.log("todate", date);            
                                        setCustomTo(formatDate(date))}}
  disabled={customFrom === null} // disabled only if from is not selected
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
      <div className="mt-2 bg-[#1A1F24] p-5 rounded-xl">
        {reportRows.length === 0 ? (
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

            <table className="w-full text-center text-[#8F8F8F] font-normal text-[13px]">
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
                          className={`w-3 h-3 -mt-[5px] ${
                            sortBy === "deal_type" && !sortAsc ? "opacity-100" : "opacity-30"
                          }`}
                        />
                        <img
                          src={downarrowIcon}
                          className={`w-3 h-3 -mt-3 ml-1.5 ${
                            sortBy === "deal_type" && sortAsc ? "opacity-100" : "opacity-30"
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
                          className={`w-3 h-3 -mt-[5px] ${
                            sortBy === "buyCurrency" && !sortAsc ? "opacity-100" : "opacity-30"
                          }`}
                        />
                        <img
                          src={downarrowIcon}
                          className={`w-3 h-3 -mt-3 ml-1.5 ${
                            sortBy === "buyCurrency" && sortAsc ? "opacity-100" : "opacity-30"
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
                    className="rounded-2xl hover:bg-[#151517] transition-colors"
                  >
                    <td className="py-3 text-[#92B4FF] font-bold text-[14px]">
                      {item.deal_number}
                    </td>

                    <td>{new Date(item.created_at).toLocaleDateString()}</td>

                    {/* TYPE PILL */}
                    <td>
                      <div className="flex justify-center items-center">
                        <span
                          className={`px-3 py-1 rounded-2xl text-xs font-medium ${
                            typeColors[item.deal_type]
                          }`}
                        >
                          {item.deal_type.toUpperCase()}
                        </span>
                      </div>
                    </td>

                    <td>{item.customer_name}</td>

                    <td>{item.buyAmount}</td>
                    <td>{item.buyCurrency}</td>

                    <td>{item.rate}</td>

                    <td>{item.sellAmount}</td>
                    <td>{item.sellCurrency}</td>

                    {/* STATUS */}
                    <td>
                      <div className="flex justify-center items-center">
                        <span
                          className={`px-3 py-1 rounded-2xl text-xs font-medium ${
                            statusColors[item.status]
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
              currentPage={currentPage}
              totalPages={totalPages}
              onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            />
          </>
        )}
      </div>

    </>
  );
}
