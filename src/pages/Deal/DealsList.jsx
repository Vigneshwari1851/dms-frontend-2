import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import down from "../../assets/dashboard/down.svg";
import download from "../../assets/dashboard/download.svg";
import add from "../../assets/dashboard/add.svg";
import uparrowIcon from "../../assets/up_arrow.svg";
import downarrowIcon from "../../assets/down_arrow.svg";
import Dropdown from "../../components/common/Dropdown";
import pdf from "../../assets/Common/pdf.svg";
import excel from "../../assets/Common/excel.svg";
import Pagination from "../../components/common/Pagination";
import searchIcon from "../../assets/Common/search.svg";
import { fetchDeals, exportDeals, deleteDeal } from "../../api/deals";
import { fetchCurrencies } from "../../api/currency/currency";
import Toast from "../../components/common/Toast";
import editIcon from "../../assets/Common/edit.svg";
import EmptyState from "../../components/common/EmptyState";
import dealEmptyBg from "../../assets/Common/empty/deal-bg.svg";
import NotificationCard from "../../components/common/Notification";
import { useReconciliation } from "../../contexts/ReconciliationContext";
import ActionDropdown from "../../components/common/ActionDropdown";

export default function DealsList() {
  const navigate = useNavigate();
  const { todayRecon, openGate, openGateWithNavigation } = useReconciliation();
  const [openMenu, setOpenMenu] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currencyList, setCurrencyList] = useState(["All Currencies"]);
  const location = useLocation();

  // Role discovery for export visibility
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const userRole = user.role;
  const showExportByRole = userRole === "Admin";
  const exportRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, actionType: "delete", title: "Delete Deal", message: "", dealId: null });
  const itemsPerPage = 10;
  const [exportOpen, setExportOpen] = useState(false);

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

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);

        const response = await fetchDeals({
          page: currentPage,
          limit: itemsPerPage,
        });

        const transformedData = response.data.map((deal) => {
          const isBuy = deal.deal_type === "buy";
          const buyAmtValue = Number(isBuy ? deal.amount : deal.amount_to_be_paid);
          const sellAmtValue = Number(isBuy ? deal.amount_to_be_paid : deal.amount);
          // const buyAmtValue = Number(deal.buyAmount);
          // const sellAmtValue = Number(deal.amount_to_be_paid);

          const pair = isBuy
            ? `${deal.buyCurrency.code}/${deal.sellCurrency.code}`
            : `${deal.sellCurrency.code}/${deal.buyCurrency.code}`;

          return {
            id: deal.deal_number,
            date: new Date(deal.created_at).toLocaleDateString("en-IN"),
            type: deal.deal_type === "buy" ? "Buy" : "Sell",
            customer: deal.customer.name,
            buyAmt: buyAmtValue > 0 ? buyAmtValue.toLocaleString() : "--------",
            pair: pair || "---",
            buyCurrency: deal.buyCurrency.code,
            sellCurrency: deal.sellCurrency.code,
            exchange_rate: deal.exchange_rate,
            sellAmt: sellAmtValue > 0 ? sellAmtValue.toLocaleString() : "--------",
            status: deal.status,
            dealId: deal.id,
            createdBy: deal.createdBy?.full_name || "N/A",
          };
        });

        setDeals(transformedData);
        setTotalPages(response.pagination?.totalPages || 1); // ✅ REQUIRED
        setError(null);
      } catch (err) {
        console.error("Error loading deals:", err);
        setError("Failed to load deals");
        setDeals([]);
        setTotalPages(1); // safety
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
        setCurrencyList(["All Currencies"]);
      }
    };

    loadDeals();
    loadCurrencies();
  }, [currentPage]);

  useEffect(() => {
    // 1. Handle location state (SPA navigation)
    if (location.state?.toast) {
      setToast({
        show: true,
        message: location.state.toast.message,
        type: location.state.toast.type,
      });
      // Clear navigation state to prevent re-showing on refresh
      navigate(location.pathname, { replace: true });
    }
    // 2. Handle URL parameters (Full page reload)
    else {
      const params = new URLSearchParams(window.location.search);
      const toastMsg = params.get('msg');
      const toastType = params.get('toast');

      if (toastMsg) {
        setToast({
          show: true,
          message: decodeURIComponent(toastMsg),
          type: toastType || 'success',
        });

        // Clean URL without reloading the page
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [location.state]);

  // Handle toast timeout
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "success" });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const statusColors = {
    Pending: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]",
    Completed: "bg-[#1D4CB53D] text-[#88ACFC] border border-[#88ACFC]",
  };

  const typeColors = {
    Buy: "bg-[#10B93524] text-[#10B935] border border-[#10B935]",
    Sell: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]",
  };

  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currencyFilter, setCurrencyFilter] = useState("All Currencies");
  const [exporting, setExporting] = useState(false);

  const [sortBy, setSortBy] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const statuses = ["All Status", "Pending", "Completed"];
  const currencies = ["All Currencies", "USD", "EUR", "GBP"];
  const [search, setSearch] = useState("");
  const filteredData = deals.filter(
    (item) =>
      (statusFilter === "All Status" || item.status === statusFilter) &&
      (currencyFilter === "All Currencies" || item.buyCurrency === currencyFilter || item.sellCurrency === currencyFilter) &&
      (item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.customer.toLowerCase().includes(search.toLowerCase()))
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
        ? a.pair.localeCompare(b.pair)
        : b.pair.localeCompare(a.pair)
    );
  }

  const handleRowClick = (deal) => {
    if (deal?.dealId) {
      navigate(`/deals/edit-deal/${deal.dealId}`);
    }
  };

  const handleActionClick = (dealId, event) => {
    event.stopPropagation();
    setOpenMenu(openMenu === dealId ? null : dealId);
  };

  const handleView = (dealId) => {
    navigate(`/deal-review`);
    setOpenMenu(null);
  };

  const handleViewSlip = (dealId) => {
    navigate(`/view-slip`);
    setOpenMenu(null);
  };


  const handleEdit = (dealId) => {
    console.log("Edit deal", dealId);
    navigate(`/deals/edit-deal/${dealId}`);
    setOpenMenu(null);
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      setExportOpen(false);

      // Pass "today" as a string
      const blob = await exportDeals(format);
      if (!blob) {
        setToast({ show: true, message: "Export failed", type: "error" });
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `deals_${Date.now()}.${format === "excel" ? "xlsx" : "pdf"}`);
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



  const handleAddCustomer = () => {
    navigate("/customer-info/add-customer");
  };

  const handleCreateDeal = () => {
    if (todayRecon) {
      navigate("/deals/create-deal");
    } else {
      openGateWithNavigation("/deals/create-deal");
    }
  };

  const handleDelete = (deal) => {
    setDeleteModal({
      open: true,
      actionType: "delete",
      title: "Delete Deal",
      message: `Are you sure you want to delete deal #${deal.id}? This action cannot be undone.`,
      dealId: deal.dealId
    });
    setOpenMenu(null);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteDeal(deleteModal.dealId);
      if (res.success) {
        setToast({ show: true, message: "Deal deleted successfully", type: "success" });
        // Refresh local items
        setDeals(deals.filter((d) => d.dealId !== deleteModal.dealId));
      } else {
        setToast({ show: true, message: "Failed to delete deal", type: "error" });
      }
    } catch (err) {
      console.error("Delete error:", err);
      setToast({ show: true, message: "Error deleting deal", type: "error" });
    } finally {
      setDeleteModal({ open: false, actionType: "delete", title: "Delete Deal", message: "", dealId: null });
    }
  };



  return (
    <>
      {/* Page Header */}
      <div className="flex items-center mb-6">
        {/* Left content */}
        <div>
          <h1 className="text-white text-16px lg:text-[20px] font-semibold">
            Deals Overview
          </h1>
          <p className="text-gray-400 text-sm mt-1 hidden lg:block">
            Manage and review all deals
          </p>
        </div>

        {/* Right buttons */}
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={handleAddCustomer}
            className="flex items-center gap-2 border border-white/10 hover:bg-[#173B8B] h-9 lg:h-10 text-white px-3 lg:px-4 py-2 rounded-md text-xs lg:text-sm font-medium"
          >
            <img src={add} alt="add" className="hidden lg:block w-4 h-4 lg:w-5 lg:h-5" />
            Add Customer
          </button>

          <button
            onClick={handleCreateDeal}
            className="flex items-center justify-center h-10 bg-[#1D4CB5] hover:bg-[#173B8B] text-white font-medium text-sm px-4 py-2 gap-2 rounded-lg"
          >
            <img src={add} alt="add" className="w-5 h-5" />
            <span className="lg:hidden">New Deal</span>
            <span className="hidden lg:inline">Create New Deal</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#1A1F24] p-4 lg:p-5 rounded-xl">
        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
          {/* Left side: Deal Records + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <h2 className="text-white text-[16px] font-normal shrink-0">
              Deal List
            </h2>

            {/* Search Box with icon */}
            <div className="relative w-full lg:w-[396px]">
              <input
                type="text"
                placeholder="Search deals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-10 pr-3 rounded-lg bg-[#16191C] text-white text-sm outline-none border border-transparent focus:border-[#1D4CB5] transition-all"
              />
              <img
                src={searchIcon}
                alt="search"
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-70"
              />
            </div>
          </div>

          {/* Right side: Filters and buttons */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
            <Dropdown
              label="All Status"
              options={statuses}
              selected={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              className="w-full sm:w-[150px]"
            />

            <Dropdown
              label="All Currencies"
              options={currencyList}
              selected={currencyFilter}
              onChange={(value) => setCurrencyFilter(value)}
              className="w-full sm:w-[180px]"
            />

            {/* {showExportByRole && (
              <div className="relative w-full lg:w-auto" ref={exportRef}>
                <button
                  onClick={() => setExportOpen(!exportOpen)}
                  className="w-full lg:w-auto px-3 sm:px-5 py-2 h-10 border border-white rounded-lg text-white font-medium flex items-center justify-center gap-2 text-sm whitespace-nowrap  hover:bg-[#173B8B] hover:border-[#173B8B] transition-all"
                >
                  <img src={download} alt="download" className="w-6 h-6" /> Export
                </button>

                {exportOpen && (
                  <div className="absolute right-0 mt-2 w-full lg:w-28 bg-[#2E3439] border border-[#2A2D31] rounded-lg shadow-lg z-20 cursor-pointer">
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
            )} */}
          </div>
        </div>

        <div className="border-t-[3px] border-[#16191C]  mt-4 pt-4 -mx-4 lg:-mx-5 px-4 lg:px-5"></div>

        {/* Table Container with Overflow */}
        <div className="-mx-4 lg:-mx-5 overflow-x-auto scrollbar-grey">
          {filteredAndSortedData.length === 0 ? (
            <EmptyState
              imageSrc={dealEmptyBg}
              message="Looks like deals are not yet added"
              action={
                <button
                  onClick={handleCreateDeal}
                  className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors mx-auto"
                >
                  <img src={add} alt="add" className="w-5 h-5" />
                  Create New Deal
                </button>
              }
            />
          ) : (
            <table className="min-w-[1100px] lg:min-w-full w-full text-center text-[#8F8F8F] font-normal text-[13px] border-collapse">
              <thead>
                <tr className="text-[#FFFFFF] text-[12px] font-normal">
                  <th className="text-left pl-5">Deal ID</th>
                  <th className="text-left">Date</th>
                  <th className="text-left">Created By</th>

                  {/* TYPE SORT */}
                  <th
                    className="py-3 cursor-pointer select-none"
                    onClick={() => {
                      if (sortBy === "type") setSortAsc(!sortAsc);
                      else {
                        setSortBy("type");
                        setSortAsc(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1 ml-2 justify-center">
                      Type
                      <span className="flex flex-col">
                        <img
                          src={uparrowIcon}
                          className={`w-3 h-3 -mt-[5px] ${sortBy === "type" && !sortAsc
                            ? "opacity-100"
                            : "opacity-30"
                            }`}
                        />
                        <img
                          src={downarrowIcon}
                          className={`w-3 h-3 -mt-3 ml-1.5 ${sortBy === "type" && sortAsc
                            ? "opacity-100"
                            : "opacity-30"
                            }`}
                        />
                      </span>
                    </div>
                  </th>

                  <th className="text-left">Customer Name</th>
                  <th className="text-left">Currency Pair</th>
                  <th className="text-left">Buy Amount</th>

                  {/* CURRENCY SORT */}
                  <th className="text-left">Rate</th>
                  <th className="text-left">Sell Amount</th>
                  <th>Status</th>
                  <th className="pr-5">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredAndSortedData.map((item, index) => (
                  <tr
                    key={index}
                    className="h-9 rounded-2xl odd:bg-[#16191C] hover:bg-[#151517] transition-colors cursor-pointer"
                    onClick={() => handleRowClick(item)}
                  >
                    <td className="py-1.5 text-white text-[14px] text-left pl-5">
                      {item.id}
                    </td>
                    <td className="text-left">{item.date}</td>
                    <td className="text-left whitespace-nowrap">{item.createdBy}</td>

                    <td>
                      <div className="flex justify-center items-center">
                        <span
                          className={`px-3 py-1 rounded-2xl text-xs font-medium ${typeColors[item.type]}`}
                        >
                          {item.type}
                        </span>
                      </div>
                    </td>
                    <td className="text-left">{item.customer}</td>
                    <td className="text-left">{item.pair}</td>
                    <td className="text-left">{item.buyAmt}</td>
                    <td className="text-left">{item.exchange_rate}</td>
                    <td className="text-left">{item.sellAmt}</td>

                    <td>
                      <div className="flex justify-center items-center">
                        <span
                          className={`px-3 py-1 rounded-2xl text-xs font-medium ${statusColors[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </td>

                    <td className="relative pr-5 flex justify-center items-center h-full">
                      <ActionDropdown
                        vertical={true}
                        options={[
                          { label: "View Deal", onClick: () => handleRowClick(item) },
                          ...(item.status === "Pending" ? [{ label: "Edit Deal", onClick: () => handleEdit(item.dealId) }] : []),
                          ...(userRole === "Admin" ? [{ label: "Delete Deal", onClick: () => handleDelete(item) }] : [])
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination — only shown when there is data */}
        {filteredAndSortedData.length > 0 && (
          <div className="border-t-[3px] border-[#16191C]  mt-4 pt-4 -mx-5 px-5">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            />
          </div>
        )}
        {toast.show && (
          <Toast
            show={toast.show}
            message={toast.message}
            type={toast.type}
          />
        )}

        <NotificationCard
          confirmModal={deleteModal}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteModal({ open: false, actionType: "delete", title: "Delete Deal", message: "", dealId: null })}
        />
      </div>
    </>
  );
}

