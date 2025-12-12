import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import down from "../../assets/dashboard/down.svg";
import download from "../../assets/dashboard/download.svg";
import add from "../../assets/dashboard/add.svg";
import uparrowIcon from "../../assets/up_arrow.svg";
import downarrowIcon from "../../assets/down_arrow.svg";
import Dropdown from "../../components/common/Dropdown";
import pdf from "../../assets/common/pdf.svg";
import excel from "../../assets/common/excel.svg";
import Pagination from "../../components/common/Pagination";
import { FiSearch } from "react-icons/fi";
import { fetchDeals, exportDeals } from "../../api/deals";
import { fetchCurrencies } from "../../api/currency/currency";

export default function DealsList() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currencyList, setCurrencyList] = useState(["All Currencies"]);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        const response = await fetchDeals({});

        // Transform API response to match table structure
        const transformedData = response.data.map((deal) => {
          const buyAmtValue = Number(deal.buyAmount);
          const sellAmtValue = Number(deal.sellAmount);

          return {
            id: deal.deal_number,
            date: new Date(deal.created_at).toLocaleDateString("en-IN"),
            type: deal.deal_type === "buy" ? "Buy" : "Sell",
            customer: deal.customer.name,
            buyAmt: buyAmtValue > 0 ? buyAmtValue.toLocaleString() : "--------",
            currency: deal.buyCurrency || "---",
            rate: deal.rate,
            sellAmt: sellAmtValue > 0 ? sellAmtValue.toLocaleString() : "--------",
            currency1: deal.sellCurrency || "---",
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
      rate: "81.90",
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
      id: "D003",
      date: "2025/01/26",
      type: "Buy",
      customer: "John",
      buyAmt: "30,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "60,000",
      currency1: "EUR",
      status: "Pending",
    },
    {
      id: "D004",
      date: "2025/01/27",
      type: "Sell",
      customer: "ABC",
      buyAmt: "40,000",
      currency: "GBP",
      rate: "92.10",
      sellAmt: "--------",
      currency1: "EUR",
      status: "Completed",
    },
    {
      id: "D005",
      date: "2025/01/27",
      type: "Buy",
      customer: "Smith",
      buyAmt: "25,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "50,000",
      currency1: "USD",
      status: "Pending",
    },
    {
      id: "D006",
      date: "2025/01/27",
      type: "Sell",
      customer: "David",
      buyAmt: "35,000",
      currency: "GBP",
      rate: "92.10",
      sellAmt: "45,000",
      currency1: "EUR",
      status: "Completed",
    },
    {
      id: "D007",
      date: "2025/01/28",
      type: "Buy",
      customer: "Emma",
      buyAmt: "45,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "70,000",
      currency1: "EUR",
      status: "Pending",
    },
    {
      id: "D008",
      date: "2025/01/28",
      type: "Sell",
      customer: "Michael",
      buyAmt: "--------",
      currency: "GBP",
      rate: "92.10",
      sellAmt: "55,000",
      currency1: "USD",
      status: "Completed",
    },
    {
      id: "D009",
      date: "2025/01/28",
      type: "Buy",
      customer: "Sarah",
      buyAmt: "20,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "40,000",
      currency1: "EUR",
      status: "Pending",
    },
    {
      id: "D010",
      date: "2025/01/29",
      type: "Sell",
      customer: "Robert",
      buyAmt: "50,000",
      currency: "GBP",
      rate: "92.10",
      sellAmt: "65,000",
      currency1: "USD",
      status: "Completed",
    },
  ];

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
      (currencyFilter === "All Currencies" || item.currency === currencyFilter) &&
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
        ? a.currency.localeCompare(b.currency)
        : b.currency.localeCompare(a.currency)
    );
  }

  // Pagination Logic
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
      navigate(`/edit-deal/${deal.dealId}`);
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
    navigate(`/edit-deal/${dealId}`);
    setOpenMenu(null);
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      setExportOpen(false);
      await exportDeals(format);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = (dealId) => {
    console.log("Delete deal", dealId);
    setOpenMenu(null);
  };



  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-semibold">Deals Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and review all deals</p>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() => navigate("/create-deal")}
            className="
    flex items-center 
    w-[173px] h-10 
    bg-[#1D4CB5] hover:bg-blue-600 
    text-white font-medium text-sm
    px-2 py-2 
    gap-2.5
    rounded-lg
    cursor-pointer
  "

          >
            <img src={add} alt="add" className="w-5 h-5" />
            Create New Deal
          </button>

        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#1A1F24] p-5 rounded-xl">
        {/* Filters Row */}
        {/* Filters Row */}
        <div className="flex justify-between items-center mb-4">
          {/* Left side: Deal Records + Search */}
          <div className="flex items-center gap-4">
            <h2 className="text-white text-[16px] font-semibold">
              Deal Records
            </h2>

            {/* Search Box with icon */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search deals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[396px] h-8 pl-10 pr-3 rounded-lg bg-[#16191C] text-white  text-sm outline-none"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ABABAB] text-lg" strokeWidth={2.5} />
            </div>
          </div>

          {/* Right side: Filters and buttons */}
          <div className="flex items-center gap-3">
            <Dropdown
              label="All Status"
              options={statuses}
              selected={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              className="w-[150px]"
            />

            <Dropdown
              label="All Currencies"
              options={currencyList}
              selected={currencyFilter}
              onChange={(value) => setCurrencyFilter(value)}
              className="w-[180px]"
            />

            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="px-5 py-2 bg-[#1D4CB5] rounded-lg text-white font-medium flex items-center gap-2 cursor-pointer"
              >
                <img src={download} alt="download" className="w-6 h-6" /> Export
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
        </div>

        <div className="border-t-[3px] border-[#16191C]  mt-4 pt-4 -mx-5 px-5"></div>

        {/* Table */}
        <div className="-mx-5">
          <table className="w-full text-center text-[#8F8F8F] font-normal text-[13px] border-collapse">
            <thead>
              <tr className="text-[#FFFFFF] text-[12px] font-normal">
              <th className="py-3 text-left pl-5">Deal ID</th>
              <th>Date</th>

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
                <div className="flex items-center gap-1 ml-2 justify-center">
                  Currency
                  <span className="flex flex-col">
                    <img
                      src={uparrowIcon}
                      className={`w-3 h-3 -mt-[5px] ${sortBy === "currency" && !sortAsc
                        ? "opacity-100"
                        : "opacity-30"
                        }`}
                    />
                    <img
                      src={downarrowIcon}
                      className={`w-3 h-3 -mt-3 ml-1.5 ${sortBy === "currency" && sortAsc
                        ? "opacity-100"
                        : "opacity-30"
                        }`}
                    />
                  </span>
                </div>
              </th>

              <th>Rate</th>
              <th>Sell Amount</th>
              <th>Currency</th>
              <th>Status</th>
              <th className="pr-5">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={index}
                className="rounded-2xl hover:bg-[#151517] transition-colors cursor-pointer"
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
              <td>{item.rate}</td>
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

              <td className="relative pr-5">
                <button
                  onClick={(e) => handleActionClick(item.id, e)}
                  className="p-2 hover:bg-[#2A2F34] rounded-lg transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="8" cy="4" r="1.5" fill="#8F8F8F" />
                    <circle cx="8" cy="8" r="1.5" fill="#8F8F8F" />
                    <circle cx="8" cy="12" r="1.5" fill="#8F8F8F" />
                  </svg>
                </button>

                {openMenu === item.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setOpenMenu(null)}
                    ></div>
                    <div className="absolute right-10 mt-1 w-30 bg-[#2E3439] border border-[#2A2D31] rounded-lg shadow-lg z-20">
                      <button
                        onClick={() => handleRowClick(item.id)}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#2A2F34] first:rounded-t-lg"
                      >
                        Review Deal
                      </button>
                      {/* <button
                        onClick={() => handleViewSlip(item.id)}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#2A2F34]"
                      >
                        View Deal Slip
                      </button> */}

                      <button
                        onClick={() => handleEdit(item.dealId)}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#2A2F34] last:rounded-b-lg"
                      >
                        Edit Deal
                      </button>
                    </div>
                  </>
                )}
              </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t-[3px] border-[#16191C]  mt-4 pt-4 -mx-5 px-5">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          />
        </div>
      </div>
    </>
  );
}

