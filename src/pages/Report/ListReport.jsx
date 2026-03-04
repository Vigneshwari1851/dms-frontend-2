import { useState, useEffect, useRef } from "react";
import bgIcon from "../../assets/report/bgimage.svg";
import download from "../../assets/dashboard/download.svg";
import pdf from "../../assets/Common/pdf.svg";
import excel from "../../assets/Common/excel.svg";
import Dropdown from "../../components/common/Dropdown";
import Pagination from "../../components/common/Pagination";
import uparrowIcon from "../../assets/up_arrow.svg";
import downarrowIcon from "../../assets/down_arrow.svg";
import { format } from "date-fns";
import { fetchDeals, exportDeals } from "../../api/deals.jsx";
import { fetchReconcoliation, exportReconciliation } from "../../api/reconcoliation";
import { fetchExpenses, exportExpenses } from "../../api/expense";
import { searchCustomers } from "../../api/customers";
import { useNavigate, useOutletContext } from "react-router-dom";
import dealEmptyBg from "../../assets/Common/empty/deal-bg.svg";
import reconEmptyBg from "../../assets/Common/empty/recon-bg.svg";
import expensesEmptyBg from "../../assets/Common/empty/expenses-bg.svg";
import pnlEmptyBg from "../../assets/Common/empty/pnl-bg.svg";
import reportEmptyBg from "../../assets/Common/empty/report-bg.svg";
import EmptyState from "../../components/common/EmptyState";
import CalendarMini from "../../components/common/CalendarMini.jsx";

export default function ListReport() {
  const navigate = useNavigate();
  const { setSidebarHidden } = useOutletContext() || {};
  const [tempDateRange, setTempDateRange] = useState("Today");
  const [tempStatusFilter, setTempStatusFilter] = useState("All Status");
  const [tempCurrencyFilter, setTempCurrencyFilter] = useState("All Currencies");
  const [tempReportType, setTempReportType] = useState("Deals");
  const [reportType, setReportType] = useState("Deals");

  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [tempSelectedCustomer, setTempSelectedCustomer] = useState(null);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const searchTimeoutRef = useRef(null);

  const [tempTxnType, setTempTxnType] = useState("All");
  const [txnType, setTxnType] = useState("All");

  const reportTypes = ["Deals", "Reconciliation", "Expenses", "PnL", "Customer"];

  const getStatusesForReport = (type) => {
    switch (type) {
      case "Deals":
        return ["All Status", "Pending", "Completed"];
      case "Reconciliation":
        return ["All Status", "Tallied", "Short", "Excess"];
      default:
        return [];
    }
  };

  const statuses = getStatusesForReport(tempReportType);
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
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (setSidebarHidden) {
      setSidebarHidden(showCustomModal);
    }
    // Cleanup to ensure sidebar is shown when leaving the page or unmounting
    return () => {
      if (setSidebarHidden) setSidebarHidden(false);
    };
  }, [showCustomModal, setSidebarHidden]);

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

  useEffect(() => {
    fetchReportData();
  }, [pagination.page, dateRange, statusFilter, currencyFilter, reportType]);

  useEffect(() => {
    // Reset page and sorting when report type changes
    setPagination(prev => ({ ...prev, page: 1 }));
    setSortBy("");
  }, [reportType]);

  const fetchReportData = async (page = pagination.page, currentFilters = {}) => {
    try {
      setLoading(true);
      const activeDateRange = currentFilters.dateRange !== undefined ? currentFilters.dateRange : dateRange;
      const activeCurrency = currentFilters.currency !== undefined ? currentFilters.currency : currencyFilter;
      const activeStatus = currentFilters.status !== undefined ? currentFilters.status : statusFilter;
      const activeReportType = currentFilters.reportType !== undefined ? currentFilters.reportType : reportType;
      const activeSelectedCustomer = currentFilters.selectedCustomer !== undefined ? currentFilters.selectedCustomer : selectedCustomer;
      const activeTxnType = currentFilters.txnType !== undefined ? currentFilters.txnType : txnType;

      const now = new Date();
      let start = null;
      let end = new Date(now.setHours(23, 59, 59, 999));

      // Calculate dates for APIs that might need them or for custom mapping
      if (activeDateRange === "Today") {
        start = new Date(now.setHours(0, 0, 0, 0));
      } else if (activeDateRange === "Last 7 days") {
        start = new Date();
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
      } else if (activeDateRange === "Last 30 days") {
        start = new Date();
        start.setDate(now.getDate() - 30);
        start.setHours(0, 0, 0, 0);
      } else if (activeDateRange === "Last 90 days") {
        start = new Date();
        start.setDate(now.getDate() - 90);
        start.setHours(0, 0, 0, 0);
      } else if (activeDateRange === "Custom") {
        start = customFrom;
        end = customTo;
      }

      const params = {
        page,
        limit: pagination.limit,
      };

      let response;
      if (activeReportType === "Deals") {
        // Deals supports: today, last7, last30, last90, custom
        const dealDateFilter = activeDateRange === "Today" ? "today" :
          activeDateRange === "Last 7 days" ? "last7" :
            activeDateRange === "Last 30 days" ? "last30" :
              activeDateRange === "Last 90 days" ? "last90" :
                activeDateRange === "Custom" ? "custom" : "";

        response = await fetchDeals({
          ...params,
          dateFilter: dealDateFilter,
          startDate: dealDateFilter === "custom" ? formatDate(start) : undefined,
          endDate: dealDateFilter === "custom" ? formatDate(end) : undefined,
          currency: activeCurrency !== "All Currencies" ? activeCurrency : undefined,
          status: activeStatus !== "All Status" ? activeStatus : undefined,
          dealType: activeTxnType !== "All" ? activeTxnType : undefined,
        });
      } else if (activeReportType === "Customer") {
        const dealDateFilter = activeDateRange === "Today" ? "today" :
          activeDateRange === "Last 7 days" ? "last7" :
            activeDateRange === "Last 30 days" ? "last30" :
              activeDateRange === "Last 90 days" ? "last90" :
                activeDateRange === "Custom" ? "custom" : "";

        response = await fetchDeals({
          ...params,
          dateFilter: dealDateFilter,
          startDate: dealDateFilter === "custom" ? formatDate(start) : undefined,
          endDate: dealDateFilter === "custom" ? formatDate(end) : undefined,
          customer_id: activeSelectedCustomer?.id,
          dealType: activeTxnType !== "All" ? activeTxnType : undefined,
          status: activeStatus !== "All Status" ? activeStatus : undefined
        });
      } else if (activeReportType === "Reconciliation" || activeReportType === "PnL") {
        // Reconciliation supports: today, yesterday, last7, last30, last90, thisMonth, custom
        let reconDateFilter = "custom";
        if (activeDateRange === "Today") reconDateFilter = "today";
        else if (activeDateRange === "Last 7 days") reconDateFilter = "last7";
        else if (activeDateRange === "Last 30 days") reconDateFilter = "last30";
        else if (activeDateRange === "Last 90 days") reconDateFilter = "last90";

        response = await fetchReconcoliation({
          ...params,
          dateFilter: reconDateFilter,
          startDate: start,
          endDate: end,
          currency: activeCurrency !== "All Currencies" ? activeCurrency : undefined,
        });
      } else if (activeReportType === "Expenses") {
        const expenseDateFilter = activeDateRange === "Today" ? "today" :
          activeDateRange === "Last 7 days" ? "last7" :
            activeDateRange === "Last 30 days" ? "last30" :
              activeDateRange === "Last 90 days" ? "last90" :
                activeDateRange === "Custom" ? "custom" : "";

        response = await fetchExpenses({
          ...params,
          dateFilter: expenseDateFilter,
          dateRange: expenseDateFilter === "custom" ? { start, end } : undefined
        });
      }

      const { data, pagination: pag } = response || { data: [], pagination: { totalPages: 1 } };

      let transformedData = [];
      if (activeReportType === "Deals" || activeReportType === "Customer") {
        transformedData = (data || []).map(deal => {
          const isBuy = deal.deal_type?.toLowerCase() === "buy";
          const bAmt = isBuy ? (Number(deal.amount) || 0) : (Number(deal.amount_to_be_paid) || 0);
          const sAmt = isBuy ? (Number(deal.amount_to_be_paid) || 0) : (Number(deal.amount) || 0);

          const buyCurr = deal.buyCurrency?.code || "";
          const sellCurr = deal.sellCurrency?.code || "";

          const pair = isBuy
            ? `${buyCurr}/${sellCurr}`
            : `${sellCurr}/${buyCurr}`;

          const buyAmtCurr = isBuy ? buyCurr : sellCurr;
          const sellAmtCurr = isBuy ? sellCurr : buyCurr;

          return {
            ...deal,
            customerName: deal.customer?.name || "",
            pair,
            buyAmount: bAmt > 0 ? `${bAmt.toLocaleString()} ${buyAmtCurr}` : "—",
            sellAmount: sAmt > 0 ? `${sAmt.toLocaleString()} ${sellAmtCurr}` : "—",
            buyAmountNumeric: bAmt,
            sellAmountNumeric: sAmt,
          };
        });
      } else {
        transformedData = (data || []).map(item => ({
          ...item,
          // Common normalization if needed
        }));
      }

      setReportRows(transformedData);
      setPagination((prev) => ({
        ...prev,
        page: pag.page || page,
        totalPages: pag.totalPages || 1,
      }));
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async (overrideDateRange) => {
    setPagination({ ...pagination, page: 1 });
    setCurrentPage(1);
    setSortBy("");

    // Commit temp filters to active filters
    setDateRange(overrideDateRange === "Custom" ? "Custom" : tempDateRange);
    setStatusFilter(tempStatusFilter);
    setCurrencyFilter(tempCurrencyFilter);
    setReportType(tempReportType);
    setSelectedCustomer(tempSelectedCustomer);
    setTxnType(tempTxnType);

    await fetchReportData(1, {
      dateRange: overrideDateRange === "Custom" ? "Custom" : tempDateRange,
      status: tempStatusFilter,
      currency: tempCurrencyFilter,
      reportType: tempReportType,
      selectedCustomer: tempSelectedCustomer,
      txnType: tempTxnType
    });
  };

  const handleCustomerSearch = async (value) => {
    setCustomerQuery(value);
    if (!value || value.trim().length === 0) {
      setTempSelectedCustomer(null);
      setCustomerResults([]);
      setCustomerDropdownOpen(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setCustomerSearchLoading(true);
        const isNumeric = /^\d+$/.test(value.trim());
        const searchType = isNumeric ? "phone" : "name";
        const response = await searchCustomers(value.trim(), searchType);
        if (response.success) {
          setCustomerResults(response.data || []);
          setCustomerDropdownOpen(true);
        }
      } finally {
        setCustomerSearchLoading(false);
      }
    }, 300);
  };

  const handleExport = async (exportFormat) => {
    try {
      setExporting(true);
      setExportOpen(false);

      let blob;
      const dateFilterMap = {
        "Today": "today",
        "Last 7 days": "last7",
        "Last 30 days": "last30",
        "Last 90 days": "last90",
        "Custom": "custom"
      };

      const exportParams = {
        format: exportFormat,
        dateFilter: dateFilterMap[dateRange] || dateRange.toLowerCase().replace(/ /g, ""),
        startDate: customFrom ? format(customFrom, "yyyy-MM-dd") : null,
        endDate: customTo ? format(customTo, "yyyy-MM-dd") : null,
        status: statusFilter === "All Status" ? "" : statusFilter,
        currency: currencyFilter === "All Currencies" ? "" : currencyFilter,
      };

      if (reportType === "Deals" || reportType === "Customer") {
        blob = await exportDeals({
          ...exportParams,
          customer_id: selectedCustomer?.id,
          dealType: txnType,
        });
      } else if (reportType === "Reconciliation" || reportType === "PnL") {
        blob = await exportReconciliation(exportParams);
      } else if (reportType === "Expenses") {
        blob = await exportExpenses(exportParams);
      }

      if (!blob) return;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType.toLowerCase()}_report_${Date.now()}.${exportFormat === "excel" ? "xlsx" : "pdf"}`);
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

  const filteredData = reportRows.filter((item) => {
    if (statusFilter === "All Status") return true;
    // For deals
    if (reportType === "Deals") return item.status === statusFilter;
    // For reconciliation
    if (reportType === "Reconciliation") return item.status === statusFilter;
    return true;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0;

    if (reportType === "Deals") {
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
    }

    let valA = a[sortBy];
    let valB = b[sortBy];

    if (valA === undefined || valB === undefined) return 0;

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

          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-sm">Report Type</label>
            <Dropdown
              label={tempReportType}
              options={reportTypes}
              onChange={(value) => {
                setTempReportType(value);
                setTempStatusFilter("All Status"); // Reset status when type changes
              }}
            />
          </div>

          {(tempReportType === "Customer" || tempReportType === "Deals") && (
            <>
              {tempReportType === "Customer" && (
                <div className="flex flex-col gap-2 relative">
                  <label className="text-gray-300 text-sm">Select Customer</label>
                  <input
                    className="w-full bg-[#16191C] h-10 rounded-lg px-3 py-2 text-white outline-none text-sm"
                    placeholder="Search by name or phone"
                    value={customerQuery}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    onFocus={() => { if (customerResults.length > 0) setCustomerDropdownOpen(true); }}
                  />
                  {customerDropdownOpen && (
                    <ul className="absolute left-0 right-0 top-full mt-1 bg-[#2E3439] rounded-lg z-50 max-h-48 overflow-y-auto shadow-xl border border-[#3E4449]">
                      {customerSearchLoading && <li className="px-4 py-2 text-sm text-gray-300 italic">Searching...</li>}
                      {!customerSearchLoading && customerResults.length === 0 && <li className="px-4 py-2 text-sm text-gray-400 italic">No customers found</li>}
                      {customerResults.map((c) => (
                        <li
                          key={c.id}
                          className="px-4 py-2 hover:bg-[#1D4CB5] cursor-pointer text-white text-sm border-b border-[#3E4449] last:border-0"
                          onClick={() => {
                            setTempSelectedCustomer(c);
                            setCustomerQuery(c.name);
                            setCustomerDropdownOpen(false);
                          }}
                        >
                          {c.name} ({c.phone_number})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-gray-300 text-sm">TxnType</label>
                <Dropdown
                  label={tempTxnType}
                  options={["All", "Buy", "Sell"]}
                  onChange={(val) => setTempTxnType(val)}
                />
              </div>
            </>
          )}

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

            {statuses.length > 0 && tempReportType !== "Customer" && (
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-gray-300 text-sm">Status</label>
                <Dropdown
                  label={tempStatusFilter}
                  options={statuses}
                  onChange={(value) => setTempStatusFilter(value)}
                />
              </div>
            )}
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
        <div className={`hidden lg:grid ${tempReportType === "Customer" ? "lg:grid-cols-5" : (tempReportType === "Deals" ? "lg:grid-cols-5" : "lg:grid-cols-4")} lg:gap-6`}>

          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-sm">Report Type</label>
            <Dropdown
              label={tempReportType}
              options={reportTypes}
              onChange={(value) => {
                setTempReportType(value);
                setTempStatusFilter("All Status");
                if (value !== "Customer") {
                  setTempSelectedCustomer(null);
                  setCustomerQuery("");
                }
              }}
            />
          </div>

          {(tempReportType === "Customer" || tempReportType === "Deals") && (
            <>
              {tempReportType === "Customer" && (
                <div className="flex flex-col gap-2 relative">
                  <label className="text-gray-300 text-sm">Select Customer</label>
                  <input
                    className="w-full bg-[#16191C] h-10 rounded-lg px-3 py-2 text-white outline-none text-sm"
                    placeholder="Search by name or phone"
                    value={customerQuery}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    onFocus={() => { if (customerResults.length > 0) setCustomerDropdownOpen(true); }}
                  />
                  {customerDropdownOpen && (
                    <ul className="absolute left-0 right-0 top-full mt-1 bg-[#2E3439] rounded-lg z-50 max-h-48 overflow-y-auto shadow-xl border border-[#3E4449]">
                      {customerSearchLoading && <li className="px-4 py-2 text-sm text-gray-300 italic">Searching...</li>}
                      {!customerSearchLoading && customerResults.length === 0 && <li className="px-4 py-2 text-sm text-gray-400 italic">No customers found</li>}
                      {customerResults.map((c) => (
                        <li
                          key={c.id}
                          className="px-4 py-2 hover:bg-[#1D4CB5] cursor-pointer text-white text-sm border-b border-[#3E4449] last:border-0"
                          onClick={() => {
                            setTempSelectedCustomer(c);
                            setCustomerQuery(c.name);
                            setCustomerDropdownOpen(false);
                          }}
                        >
                          {c.name} ({c.phone_number})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-gray-300 text-sm">Txn Type</label>
                <Dropdown
                  label={tempTxnType}
                  options={["All", "Buy", "Sell"]}
                  onChange={(val) => setTempTxnType(val)}
                />
              </div>
            </>
          )}

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

          {statuses.length > 0 && tempReportType !== "Customer" ? (
            <div className="flex flex-col gap-2">
              <label className="text-gray-300 text-sm">Status</label>
              <Dropdown
                label={tempStatusFilter}
                options={statuses}
                onChange={(value) => setTempStatusFilter(value)}
              />
            </div>
          ) : (
            <div className="flex items-end">
              <button
                className="bg-[#1D4CB5] hover:bg-[#173B8B] text-white px-8 h-10 rounded-md text-sm font-medium w-full"
                onClick={handleApplyFilters}
              >
                Apply
              </button>
            </div>
          )}

          {statuses.length > 0 && tempReportType !== "Customer" && (
            <div className="flex items-end">
              <button
                className="bg-[#1D4CB5] hover:bg-[#173B8B] text-white px-8 h-10 rounded-md text-sm font-medium"
                onClick={handleApplyFilters}
              >
                Apply
              </button>
            </div>
          )}

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
                <label className="text-gray-300 mb-2 text-sm block">From:</label>
                <CalendarMini
                  selectedDate={customFrom}
                  onDateSelect={(date) => setCustomFrom(date)}
                />
              </div>

              <div className="flex-1">
                <label className="text-gray-300 mb-2 text-sm block">To:</label>
                <CalendarMini
                  selectedDate={customTo}
                  onDateSelect={(date) => setCustomTo(date)}
                  disabled={!customFrom}
                  month={customTo ? undefined : customFrom?.getMonth()}
                  year={customTo ? undefined : customFrom?.getFullYear()}
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
              imageSrc={
                reportType === "Reconciliation" ? reconEmptyBg :
                  reportType === "Expenses" ? expensesEmptyBg :
                    reportType === "PnL" ? pnlEmptyBg :
                      reportType === "Customer" ? reportEmptyBg :
                        dealEmptyBg
              }
              message={`No ${reportType} report data found for the selected filters`}
            />
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-[#1A1F24] rounded-t-lg px-3 lg:px-5 py-4">
              <div className="flex justify-between items-center text-left">
                <h2 className="text-white text-[16px] font-semibold">
                  {reportType} - {dateRange === "Today" && "Today's Report"}
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
                    {(reportType === "Deals" || reportType === "Customer") && (
                      <>
                        <th className="py-3 text-left pl-5">Deal ID</th>
                        <th className="text-left">Date</th>
                        <th className="py-3 cursor-pointer select-none" onClick={() => handleSort("deal_type")}>
                          <div className="flex items-center gap-1 justify-center">Type</div>
                        </th>
                        <th className="text-left">Customer</th>
                        <th className="text-left">Currency Pair</th>
                        <th className="text-left">Buy Amount</th>
                        <th className="text-left">Rate</th>
                        <th className="text-left">Sell Amount</th>
                        <th className="text-left">Status</th>
                      </>
                    )}
                    {reportType === "Reconciliation" && (
                      <>
                        <th className="py-3 text-left pl-5">Date</th>
                        <th className="text-left">Total Deals</th>
                        <th className="text-left">Status</th>
                        <th className="text-left">Profit/Loss (TZS)</th>
                        <th className="text-left">Variances</th>
                      </>
                    )}
                    {reportType === "Expenses" && (
                      <>
                        <th className="py-3 text-left pl-5">Date</th>
                        <th className="text-left">Category</th>
                        <th className="text-left">Description</th>
                        <th className="text-left">Amount</th>
                        <th className="text-left">Rate</th>
                      </>
                    )}
                    {reportType === "PnL" && (
                      <>
                        <th className="py-3 text-left pl-5">Date</th>
                        <th className="text-left">Deals</th>
                        <th className="text-left">Valuation Rate</th>
                        <th className="text-left">Opening Value</th>
                        <th className="text-left">Closing Value</th>
                        <th className="text-left">Profit/Loss</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.map((item, index) => (
                    <tr
                      key={index}
                      className="h-11 rounded-2xl odd:bg-[#16191C] hover:bg-[#151517] transition-colors cursor-pointer"
                      onClick={() => {
                        if (reportType === "Deals") navigate(`/deals/edit-deal/${item.id}`);
                        if (reportType === "Reconciliation") navigate(`/reconciliation`);
                        if (reportType === "Expenses") navigate(`/expenses`);
                        if (reportType === "PnL") navigate(`/pnl`);
                      }}
                    >
                      {(reportType === "Deals" || reportType === "Customer") && (
                        <>
                          <td className="py-1.5 text-left pl-5 text-white text-[14px]">{item.deal_number}</td>
                          <td className="text-left">{new Date(item.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="flex justify-center items-center">
                              <span className={`px-3 py-1 rounded-2xl text-xs font-medium ${typeColors[item.deal_type] || ""}`}>
                                {item.deal_type?.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="text-left">{item.customer?.name}</td>
                          <td className="text-left">{item.pair || "—"}</td>
                          <td className="text-left">{item.buyAmount}</td>
                          <td className="text-left">{item.exchange_rate}</td>
                          <td className="text-left">{item.sellAmount}</td>
                          <td className="text-left">
                            <div className="flex justify-center items-center">
                              <span className={`px-3 py-1 rounded-2xl text-xs font-medium ${statusColors[item.status] || ""}`}>
                                {item.status}
                              </span>
                            </div>
                          </td>
                        </>
                      )}
                      {reportType === "Reconciliation" && (
                        <>
                          <td className="py-1.5 text-left pl-5 text-white text-[14px]">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                          <td className="text-left">{item.total_transactions}</td>
                          <td className="text-left">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] border ${item.status === "Tallied" ? "bg-[#10B935]/10 text-[#10B935] border-[#10B935]/20" :
                              item.status === "Short" ? "bg-[#F7626E]/10 text-[#F7626E] border-[#F7626E]/20" :
                                "bg-[#D8AD00]/10 text-[#D8AD00] border-[#D8AD00]/20"
                              }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="text-left">{Number(item.profitLoss).toLocaleString()}</td>
                          <td className="text-left text-[11px]">
                            {/* Simplified variances view */}
                            {item.openingEntries?.length > 0 ? "Variance tracked" : "No entries"}
                          </td>
                        </>
                      )}
                      {reportType === "Expenses" && (
                        <>
                          <td className="py-1.5 text-left pl-5 text-white text-[14px]">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="text-left">{item.category}</td>
                          <td className="text-left">{item.description}</td>
                          <td className="text-left">{item.currency?.code} {Number(item.amount).toLocaleString()}</td>
                          <td className="text-left">{item.rate || "—"}</td>
                        </>
                      )}
                      {reportType === "PnL" && (
                        <>
                          <td className="py-1.5 text-left pl-5 text-white text-[14px]">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                          <td className="text-left">{item.total_transactions}</td>
                          <td className="text-left">{Number(item.setRate).toFixed(2)}</td>
                          <td className="text-left">{Number(item.totalOpeningValue).toLocaleString()}</td>
                          <td className="text-left">{Number(item.totalClosingValue).toLocaleString()}</td>
                          <td className="text-left">
                            <span className={item.profitLoss >= 0 ? "text-[#10B935]" : "text-[#F7626E]"}>
                              {item.profitLoss >= 0 ? "▲" : "▼"} {Math.abs(Number(item.profitLoss)).toLocaleString()}
                            </span>
                          </td>
                        </>
                      )}
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
