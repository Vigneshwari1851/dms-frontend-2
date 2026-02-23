import { useState, useMemo, useRef, useEffect } from "react";
import Pagination from "../common/Pagination";
import searchIcon from "../../assets/Common/search.svg";
import SortableHeader from "../common/SortableHeader";
import download from "../../assets/dashboard/download.svg";
import Dropdown from "../../components/common/Dropdown";
import pdf from "../../assets/Common/pdf.svg";
import excel from "../../assets/Common/excel.svg";
import DateFilter from "./DateFilter";
import EmptyState from "./EmptyState";

export default function Table({
  columns = [],
  data = [],
  onExport,
  showExport = true,
  itemsPerPage = 10,
  title = "Table Title",
  subtitle = "",
  onSearch,
  sortableKeys = [],
  showRightSection = true,
  showSearch = true,
  showPagination = true,
  onRowClick,
  showHeader = true,
  currentPage,
  totalPages,
  onPageChange,
  emptyStateProps = {},
}) {
  const [statusFilter, setStatusFilter] = useState("All Status");
  const statuses = ["All Status", "In_Progress", "Tallied", "Excess", "Short"];
  const exportOptions = ["pdf"];

  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, asc: true });
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const userRole = user.role;
  const showExportByRole = userRole === "Admin";
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
  const [dateFilter, setDateFilter] = useState({ from: null, to: null });

  const roleColors = {
    Maker: "text-[#33BAA6] bg-[#22998824] border-[#33BAA6] border",
    Admin: "text-[#B47AF4] bg-[#9C4DF424] border-[#B47AF4] border",
  };

  const statusColors = {
    Active: "text-[#82E890] bg-[#10B93524] border-[#82E890] border",
    Inactive: "text-[#F7626E] bg-[#BD404A24] border-[#F7626E] border",
    Tallied: "text-[#82E890] bg-[#10B93524] border-[#82E890] border",
    Excess: "text-[#D8AD00] bg-[#302700] border-[#D8AD00] border",
    Short: "text-[#F7626E] bg-[#BD404A24] border-[#F7626E] border",
    In_Progress: "bg-[#939AF024] text-[#939AF0] border-[#939AF0] border",
  };

  const handleSort = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({ key, asc: !sortConfig.asc });
    } else {
      setSortConfig({ key, asc: true });
    }
  };

  const renderCell = (col, value) => {
    if (col.key === "role")
      return (
        <span
          className={`px-3 text-sm font-medium ${roleColors[value] || ""}`}
          style={{ borderRadius: "18px" }}
        >
          {value}
        </span>
      );

    if (col.key === "status")
      return (
        <span
          className={`px-3 text-sm font-medium ${statusColors[value] || ""}`}
          style={{ borderRadius: "18px" }}
        >
          {value}
        </span>
      );

    if (col.key === "variance") {
      const sign = value?.trim().startsWith("+")
        ? "+"
        : value?.trim().startsWith("-")
          ? "-"
          : "0";

      const color =
        sign === "+"
          ? "text-[#D8AD00] mr-2"
          : sign === "-"
            ? "text-[#F93535] mr-2"
            : "text-[#8F8F8F]";

      return <span className={`font-medium ${color}`}>{value}</span>;
    }

    if (col.key === "balance") {
      const isCR = typeof value === "string" && value.toUpperCase().endsWith("CR");
      const isDB = typeof value === "string" && value.toUpperCase().endsWith("DB");

      const colorClass = isCR
        ? "text-[#82E890]"
        : isDB
          ? "text-[#F93535]"
          : "text-[#8F8F8F]";

      return <span className={`font-medium ${colorClass}`}>{value}</span>;
    }
    return value;
  };

  // --------- Filtered Data with Search, Status, and Date ----------
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Search Filter
      const matchesSearch = Object.values(row).some((val) =>
        val?.toString().toLowerCase().includes(search.toLowerCase())
      );

      // Status Filter
      const matchesStatus =
        statusFilter === "All Status" || row.status === statusFilter;

      // Date Filter (created_at column)
      let matchesDate = true;
      if (dateFilter.from && dateFilter.to) {
        const rowDate = new Date(row.created_at);

        const fromDate = new Date(dateFilter.from);
        fromDate.setHours(0, 0, 0, 0);

        const toDate = new Date(dateFilter.to);
        toDate.setHours(23, 59, 59, 999); // 🔥 IMPORTANT

        matchesDate = rowDate >= fromDate && rowDate <= toDate;


      }


      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [data, search, statusFilter, dateFilter]);

  // --------- Sorting ----------
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortConfig.key]?.toString().toLowerCase() || "";
      const valB = b[sortConfig.key]?.toString().toLowerCase() || "";
      if (valA < valB) return sortConfig.asc ? -1 : 1;
      if (valA > valB) return sortConfig.asc ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  return (
    <div className="mt-2 w-full scrollbar-grey">
      {/* HEADER */}
      {showHeader && (
        <div className="bg-[#1A1F24] rounded-t-lg px-3 sm:px-5 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between flex-wrap w-full gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 w-full lg:w-auto flex-wrap">
              <div className="min-w-0">
                <h2 className="text-white text-base sm:text-lg font-semibold">{title}</h2>
                {subtitle && (
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">{subtitle}</p>
                )}
              </div>
              {showSearch && (
                <div className="relative flex-1 sm:flex-initial min-w-0">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      onSearch && onSearch(e.target.value);
                    }}
                    placeholder="Search..."
                    className="bg-[#131619] h-9 text-white text-sm px-9 rounded-lg outline-none w-full sm:w-64 lg:w-[300px] xl:w-[400px]"
                  />
                  <img
                    src={searchIcon}
                    alt="search"
                    className="w-4 h-4 absolute left-3 top-2.5 opacity-70"
                  />
                </div>
              )}
            </div>
            {showRightSection && (
              <div className="flex flex-row flex-wrap items-center gap-3 sm:gap-4 w-full lg:w-auto relative z-20">
                {/* Date Filter */}
                <div className="flex-1 lg:flex-none">
                  <DateFilter onApply={(range) => setDateFilter(range)} />
                </div>

                {/* Status Filter */}
                <div className="flex-1 lg:flex-none">
                  <Dropdown
                    label="All Status"
                    options={statuses}
                    selected={statusFilter}
                    onChange={(value) => setStatusFilter(value)}
                    className="w-full sm:w-[130px]"
                  />
                </div>

                {/* Export */}
                {showExport && showExportByRole && onExport && (
                  <div className="flex-1 lg:flex-none">
                    {exportOptions.length === 1 ? (
                      <button
                        onClick={() => onExport(exportOptions[0])}
                        className="w-full lg:w-auto px-3 sm:px-5 py-2 h-10 bg-[#1D4CB5] rounded-lg text-white font-medium flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                      >
                        <img src={download} className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Export</span>
                        <span className="lg:hidden">Export</span>
                      </button>
                    ) : (
                      <div className="relative" ref={exportRef}>
                        <button
                          onClick={() => setExportOpen(!exportOpen)}
                          className="w-full lg:w-auto px-3 sm:px-5 py-2 h-10 bg-[#1D4CB5] rounded-lg text-white font-medium flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                        >
                          <img src={download} className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="hidden sm:inline">Export</span>
                          <span className="lg:hidden">Export</span>
                        </button>

                        {exportOpen && (
                          <div className="absolute right-0 mt-2 w-28 bg-[#2E3439] border border-[#2A2D31] rounded-lg shadow-lg z-20">
                            {exportOptions.includes("pdf") && (
                              <button
                                onClick={() => {
                                  onExport("pdf");
                                  setExportOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-[#2A2F34]"
                              >
                                <img src={pdf} className="w-4 h-4" />
                                PDF
                              </button>
                            )}

                            {exportOptions.includes("excel") && (
                              <button
                                onClick={() => {
                                  onExport("excel");
                                  setExportOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-[#2A2F34]"
                              >
                                <img src={excel} className="w-4 h-4" />
                                Excel
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TABLE BODY */}
      <div className="bg-[#1A1F24] mt-[1.5px] overflow-x-auto scrollbar-grey">
        <table className="w-full text-[#8F8F8F] text-sm min-w-[640px]">
          <thead>
            <tr className="text-white font-semibold">
              {columns.map((col, index) =>
                sortableKeys.includes(col.key) ? (
                  <SortableHeader
                    key={index}
                    label={col.label}
                    columnKey={col.key}
                    sortBy={sortConfig.key}
                    sortAsc={sortConfig.asc}
                    onSort={handleSort}
                    className={`py-1.5 px-2 sm:px-4 font-semibold text-${col.align || "center"} ${col.className || ""}`}
                  />
                ) : (
                  <th
                    key={index}
                    className={`py-1.5 px-2 sm:px-4 font-semibold text-${col.align || "center"} ${col.className || ""}`}
                  >
                    {col.label}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-10">
                  <EmptyState
                    {...emptyStateProps}
                    message={search || statusFilter !== "All Status" ? "No results found matching your filters" : emptyStateProps.message}
                  />
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className="h-9 rounded-2xl odd:bg-[#16191C] hover:bg-[#151517] transition-colors cursor-pointer"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`py-1.5 px-2 sm:px-4 text-${col.align || "center"} ${col.className || ""}`}
                    >
                      {col.key === "full_name" ? (
                        <span className="text-white">{row[col.key]}</span>
                      ) : (
                        renderCell(col, row[col.key])
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {showPagination && sortedData.length > 0 && (
        <div className="bg-[#1A1F24] rounded-b-lg mt-[1.5px] p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => onPageChange(currentPage - 1)}
            onNext={() => onPageChange(currentPage + 1)}
          />
        </div>
      )}
    </div>
  );
}
